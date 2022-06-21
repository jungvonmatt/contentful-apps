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
  const { getParentValues, getParentsDev, getParentsProd } = useParents();
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
  const prodSlug = useSnapshotValue(sdk.ids.entry, slugFieldId);
  const prodParentPageValue = useSnapshotValue<Link>(
    sdk.ids.entry,
    parentFieldId
  );
  const parentPageId = parentPageValue?.sys?.id;
  const prodParentPageId = prodParentPageValue?.sys?.id;

  const isPage = pageId === sdk.entry.getSys().id;

  useEffect(() => {
    sdk.window.startAutoResizer();
    // @ts-ignore
    return () => sdk.window.stopAutoResizer();
  }, [sdk.window]);

  useEffect(() => {
    (async () => {
      if (isPage) {
        const parentPagesDev = parentPageId
          ? await getParentsDev(parentPageId)
          : [];
        const parentPagesProd = prodParentPageId
          ? await getParentsProd(prodParentPageId)
          : [];

        const slugsDev = parentPagesDev.map(
          (node) => node?.fields?.[slugFieldId]?.[sdk.locales.default]
        );
        const slugsProd = parentPagesProd.map(
          (node) => node?.fields?.[slugFieldId]?.[sdk.locales.default]
        );

        const result: Paths = {
          dev: parentPageId ? [...slugsDev, slug].join("/") : slug,
          prod: "",
        };

        if (!prodParentPageId) {
          result.prod = prodSlug || "";
        } else if (slugsProd.length && prodSlug) {
          result.prod = [...slugsProd, prodSlug].join("/");
        }
        setPaths(result);
      } else if (pageId) {
        const slugs = await getParentValues(pageId, slugFieldId);

        setPaths({
          dev: slugs?.dev?.join("/") ?? "",
          prod: slugs?.prod?.join("/") ?? "",
        });
      }
    })();
  }, [
    getParentValues,
    getParentsDev,
    getParentsProd,
    isPage,
    pageId,
    parentPageId,
    prodParentPageId,
    prodSlug,
    sdk.locales.default,
    slug,
    slugFieldId,
  ]);

  useEffect(() => {
    setUrls(
      domains.map((data) => {
        const path = data.isPreview ? paths.dev : paths.prod;
        const url = path ? [data.domain, path].join("/") : "";
        return {
          name: data.name,
          url,
        };
      })
    );
  }, [domains, paths.dev, paths.prod]);

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
