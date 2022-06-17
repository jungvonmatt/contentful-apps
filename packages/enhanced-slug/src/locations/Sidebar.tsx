import { Link, SidebarExtensionSDK } from "@contentful/app-sdk";
import {
  Button,
  ButtonGroup,
  Flex,
  IconButton,
} from "@contentful/f36-components";
import { CopyIcon, ExternalLinkIcon } from "@contentful/f36-icons";
import { useCMA, useSDK } from "@contentful/react-apps-toolkit";
import { EntryProps, KeyValueMap } from "contentful-management";
import React, { useEffect, useState } from "react";
import CopyToClipboard from "react-copy-to-clipboard";

const getParents = (
  id: string,
  entries: EntryProps<KeyValueMap>[],
  locale: string,
  parentFieldId: string = "parent_page"
) => {
  const entry = entries.find((node) => node.sys.id === id);
  const parentLink: Link = entry?.fields?.[parentFieldId]?.[locale];
  if (!parentLink) {
    return [entry];
  }

  const parent = entries.find((node) => node.sys.id === parentLink.sys.id);
  if (!parent) {
    return [entry];
  }

  return [...getParents(parent.sys.id, entries, locale), entry];
};

const Sidebar = () => {
  const sdk = useSDK<SidebarExtensionSDK>();
  const cma = useCMA();

  const [entries, setEntries] = useState<EntryProps<KeyValueMap>[]>();
  const [parents, setParents] = useState<EntryProps<KeyValueMap>[]>();
  const [slugs, setSlugs] = useState<string[]>();
  const [url, setUrl] = useState<string>();
  const [parent, setParent] = useState<EntryProps<KeyValueMap>>();

  let base: string = sdk?.parameters?.installation?.baseUrl || "";
  let parentFieldId: string = sdk?.parameters?.installation?.parentFieldId || "";

  const parentId = parent?.sys?.id;

  useEffect(() => {
    sdk.window.startAutoResizer();
    // @ts-ignore
    return () => sdk.window.stopAutoResizer();
  }, [sdk.window]);

  useEffect(() => {
    const findParentPage = async (id: string) => {
      const current = await cma.entry.get({ entryId: id });

      if (current.sys.contentType.sys.id === "page") {
        return current;
      }

      const entries = await cma.entry.getMany({
        query: { links_to_entry: id },
      });

      for (const node of entries.items) {
        if (node.sys.contentType.sys.id === "page") {
          return node;
        }

        const parentNode = await findParentPage(node.sys.id);

        if (parentNode) {
          return parentNode;
        }
      }
    };

    findParentPage(sdk.ids.entry).then((value) => {
      if (value) {
        setParent(value);
      }
    });
  }, [cma, sdk.ids.entry]);

  useEffect(() => {
    cma.entry.getMany({}).then((entries) => setEntries(entries.items));
  }, [cma]);

  useEffect(() => {
    if (parentId && Array.isArray(entries)) {
      const parents = getParents(
        parentId,
        entries,
        sdk.locales.default,
        parentFieldId
      );
      setParents(parents);
    }
  }, [sdk, entries, parentId, parentFieldId]);

  useEffect(() => {
    if (Array.isArray(parents)) {
      const slugs = parents.map(
        (parent) => parent?.fields?.slug?.[sdk.locales.default]
      );
      setSlugs(slugs);
    }
  }, [parents, sdk.locales.default]);

  useEffect(() => {
    if (Array.isArray(slugs)) {
      setUrl([base, ...slugs].join("/"));
    }
  }, [slugs, base]);

  console.log(parents);

  return (
    <>
      <ButtonGroup>
        <Button
          isDisabled={!Boolean(url)}
          variant="secondary"
          size="medium"
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          as="a"
        >
          <Flex>
            <Flex marginRight="spacing2Xs">
              <ExternalLinkIcon variant="secondary" />{" "}
            </Flex>
            Open Preview
          </Flex>
        </Button>
        <CopyToClipboard text={url}>
          <IconButton
            variant="secondary"
            isDisabled={!Boolean(url)}
            aria-label={`Copy ${url} to clipboard`}
            icon={<CopyIcon />}
          />
        </CopyToClipboard>
      </ButtonGroup>
    </>
  );
};

export default Sidebar;
