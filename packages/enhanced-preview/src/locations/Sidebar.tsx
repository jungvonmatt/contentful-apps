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

const Sidebar = () => {
  const sdk = useSDK<SidebarExtensionSDK>();
  const { getParentsDev, getParentsProd } = useParents();
  const [urls, setUrls] = useState<Url[]>([]);
  const page = useContainingPage();
  const [pathDev, setPathDev] = useState<string>("");
  const [pathProd, setPathProd] = useState<string>("");

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
  const isPage = sys.contentType.sys.id === "page" || pageId === sys.id;
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

        setPathDev([...slugs].join("/"));
      } else if (isPage) {
        setPathDev("");
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

        setPathProd([...slugs].join("/"));
      } else if (isPage) {
        setPathProd("");
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
    if (pageId && !isPage) {
      getParentsDev(pageId).then((parentsDev) => {
        const slugsDev = parentsDev.map(
          (node) => node?.fields?.[slugFieldId]?.[sdk.locales.default]
        );

        setPathDev(slugsDev?.slice(0, -1)?.join("/") ?? "");
        setSlugValueDev(slugsDev?.slice(-1)?.[0]);
      });

      if (valid) {
        getParentsProd(pageId).then((parentsProd) => {
          const slugsProd = parentsProd.map(
            (node) => node?.fields?.[slugFieldId]?.[sdk.locales.default]
          );

          setPathProd(slugsProd?.slice(0, -1)?.join("/") ?? "");
          setSlugValueProd(slugsProd?.slice(-1)?.[0]);
        });
      }
    } else if (!isPage) {
      setPathDev("");
      setSlugValueDev("");
      setPathProd("");
      setSlugValueProd("");
    }
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
        const path = data.isPreview ? pathDev : pathProd;
        const slug = data.isPreview ? slugValueDev : slugValueProd;
        const domain = data.domain.endsWith("/")
          ? data.domain.slice(0, -1)
          : data.domain;

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
  }, [domains, pathDev, pathProd, slugValueDev, slugValueProd]);

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
