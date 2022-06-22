import { Link, SidebarExtensionSDK } from "@contentful/app-sdk";
import {
  Button,
  ButtonGroup,
  Flex,
  IconButton,
  Stack,
} from "@contentful/f36-components";
import { CopyIcon, ExternalLinkIcon } from "@contentful/f36-icons";
import { useSDK } from "@contentful/react-apps-toolkit";
import React, { useEffect, useState } from "react";
import CopyToClipboard from "react-copy-to-clipboard";
import { useContainingPage } from "../hooks/useContainingPage";
import { useLooseFieldValue } from "../hooks/useLooseFieldValue";
import { useParents } from "../hooks/useParents";
import { useSnapshotValue } from "../hooks/useSnapshot";
import { isChanged, isPublished } from "../lib/checks";
import { AppInstallationParameters } from "./ConfigScreen";

type Url = {
  name: string;
  url: string;
};

type Paths = {
  dev: string;
  prod: string;
};

const Sidebar = () => {
  const sdk = useSDK<SidebarExtensionSDK>();
  const { getParentsDev, getParentsProd } = useParents();
  const [urls, setUrls] = useState<Url[]>([]);
  const page = useContainingPage(sdk.ids.entry);
  const [paths, setPaths] = useState<Paths>({
    dev: "",
    prod: "",
  });

  const parameters = sdk?.parameters?.installation as AppInstallationParameters;
  const domains = parameters.domains;
  const pageId = page?.sys?.id;
  const slugFieldId = parameters.slugFieldId || "slug";
  const parentFieldId = parameters.parentFieldId || "parent_page";

  const [slug] = useLooseFieldValue<string>(slugFieldId);
  const [parentPageValue] = useLooseFieldValue<Link>(parentFieldId);
  const prodSlug = useSnapshotValue(slugFieldId);
  const prodParentPageValue = useSnapshotValue<Link>(parentFieldId);
  const parentPageId = parentPageValue?.sys?.id;
  const prodParentPageId = prodParentPageValue?.sys?.id;

  const sys = sdk.entry.getSys();
  const isPage = pageId === sys.id;
  const valid = isPublished({ sys }) || isChanged({ sys });

  const [slugValueDev, setSlugValueDev] = useState<string>(slug);
  const [slugValueProd, setSlugValueProd] = useState<string>(prodSlug);

  useEffect(() => {
    sdk.window.startAutoResizer();
    // @ts-ignore
    return () => sdk.window.stopAutoResizer();
  }, [sdk.window]);

  useEffect(() => {
    setSlugValueDev(slug);
  }, [slug]);

  useEffect(() => {
    setSlugValueProd(prodSlug);
  }, [prodSlug]);

  // handle dev when sidebar is used on page
  useEffect(() => {
    (async () => {
      if (parentPageId) {
        const parents = await getParentsDev(parentPageId);
        const slugs = parents.map(
          (node) => node?.fields?.[slugFieldId]?.[sdk.locales.default]
        );

        setPaths((paths) => ({ ...paths, dev: [...slugs].join("/") }));
      } else if (isPage) {
        setPaths((paths) => ({ ...paths, dev: "" }));
      }
    })();
  }, [getParentsDev, isPage, parentPageId, sdk.locales.default, slugFieldId]);

  // handle dev when sidebar is used on page
  useEffect(() => {
    (async () => {
      if (prodParentPageId) {
        const parents = await getParentsProd(prodParentPageId);
        const slugs = parents.map(
          (node) => node?.fields?.[slugFieldId]?.[sdk.locales.default]
        );

        setPaths((paths) => ({ ...paths, prod: [...slugs].join("/") }));
      } else if (isPage) {
        setPaths((paths) => ({ ...paths, prod: "" }));
      }
    })();
  }, [
    getParentsProd,
    isPage,
    prodParentPageId,
    sdk.locales.default,
    slugFieldId,
  ]);

  // handle prod/dev when sidebar is not used on page
  useEffect(() => {
    (async () => {
      if (pageId && !isPage) {
        const parentsDev = await getParentsDev(pageId);
        const parentsProd = valid ? await getParentsProd(pageId) : [];

        const slugsDev = parentsDev.map(
          (node) => node?.fields?.[slugFieldId]?.[sdk.locales.default]
        );
        const slugsProd = parentsProd.map(
          (node) => node?.fields?.[slugFieldId]?.[sdk.locales.default]
        );

        setPaths({
          dev: slugsDev?.slice(0, -1)?.join("/") ?? "",
          prod: valid ? slugsProd?.slice(0, -1)?.join("/") ?? "" : "",
        });

        setSlugValueDev(slugsDev?.slice(-1)?.[0]);
        if (valid) {
          setSlugValueProd(slugsProd?.slice(-1)?.[0]);
        }
      } else if (!isPage) {
        setPaths({ dev: "", prod: "" });
      }
    })();
  }, [
    getParentsDev,
    getParentsProd,
    isPage,
    pageId,
    sdk.locales.default,
    slugFieldId,
    valid,
  ]);

  useEffect(() => {
    setUrls(
      domains.map((data) => {
        const path = data.isPreview ? paths.dev : paths.prod;
        const domain = data.domain.endsWith("/")
          ? data.domain.slice(0, -1)
          : data.domain;

        const slug = data.isPreview ? slugValueDev : slugValueProd;

        const url =
          path || slug
            ? [domain, path, slug].filter((v) => v).join("/") +
              (data.ending || "")
            : "";
        return {
          name: data.name,
          url,
        };
      })
    );
  }, [domains, paths.dev, paths.prod, slugValueDev, slugValueProd]);

  return (
    <Stack flexDirection="column" alignItems="stretch">
      {urls.map((data, index) => (
        <ButtonGroup style={{ display: "flex" }} key={index}>
          <Button
            style={{
              width: "100%",
              justifyContent: "left",
              paddingLeft: "2rem",
            }}
            isDisabled={!Boolean(data.url)}
            variant="secondary"
            size="medium"
            href={data.url}
            target="_blank"
            rel="noopener noreferrer"
            as="a"
          >
            <Flex>
              <Flex marginRight="spacing2Xs">
                <ExternalLinkIcon variant="secondary" />{" "}
              </Flex>
              Open {data.name}
            </Flex>
          </Button>
          <CopyToClipboard text={data.url}>
            <IconButton
              variant="secondary"
              isDisabled={!Boolean(data.url)}
              aria-label={`Copy ${data.url} to clipboard`}
              icon={<CopyIcon />}
            />
          </CopyToClipboard>
        </ButtonGroup>
      ))}
    </Stack>
  );
};

export default Sidebar;
