import React, { useEffect, useMemo, useState } from "react";
import { Paragraph, Text } from "@contentful/f36-components";
import { EntryProps, KeyValueMap } from "contentful-management";
import { ContentEntitySys, FieldExtensionSDK, Link } from "@contentful/app-sdk";
import { SlugEditor } from "../components/slug-editor";
import { useSDK, useCMA, useFieldValue } from "@contentful/react-apps-toolkit";
// import { useReferencingPage } from "../hooks/useReferencingPage";
// import { useParentSlugs } from "../hooks/useParentSlugs";

const getParents = (
  sys: ContentEntitySys,
  entries: EntryProps<KeyValueMap>[],
  locale: string,
  parentFieldId: string = "parent_page"
) => {
  const entry = entries.find((node) => node.sys.id === sys.id);
  const parentLink: Link = entry?.fields?.[parentFieldId]?.[locale];
  if (!parentLink) {
    return [entry];
  }

  const parent = entries.find((node) => node.sys.id === parentLink.sys.id);
  if (!parent) {
    return [entry];
  }

  return [...getParents(parent.sys, entries, locale), entry];
};

const Field = () => {
  const sdk = useSDK<FieldExtensionSDK>();
  const cma = useCMA();
  const [entries, setEntries] = useState<EntryProps<KeyValueMap>[]>();
  const [parents, setParents] = useState<EntryProps<KeyValueMap>[]>();
  const [slugs, setSlugs] = useState<string[]>();
  const [value, setValue] = useState<string>(sdk.field.getValue());
  const [url, setUrl] = useState<string>();
  const [parent] = useFieldValue<Link>("parent_page");

  let parentFieldId: string =
    sdk.parameters.installation.parentFieldId || "parent_page";

  const parentId = parent?.sys?.id;

  useEffect(() => {
    sdk.window.startAutoResizer();
    // @ts-ignore
    return () => sdk.window.stopAutoResizer();
  }, [sdk.window]);

  useEffect(() => {
    cma.entry.getMany({}).then((entries) => setEntries(entries.items));
  }, [cma]);

  useEffect(() => {
    if (Array.isArray(entries)) {
      const parents = getParents(
        sdk.entry.getSys(),
        entries,
        sdk.locales.default,
        parentFieldId
      ).slice(0, -1);
      setParents(parents);
    }
  }, [sdk, entries, parentId, parentFieldId]);

  useEffect(() => {
    if (Array.isArray(parents)) {
      const slugs = parents.map(
        (parent) => parent?.fields?.[sdk.field.id]?.[sdk.field.locale]
      );
      setSlugs(slugs);
    }
  }, [parents, sdk.field.id, sdk.field.locale]);

  useEffect(() => {
    if (value && Array.isArray(slugs)) {
      setUrl([...slugs, value].join("/"));
    }
  }, [slugs, value]);

  const uniqueQueryFilter = useMemo(() => {
    if (parentId) {
      return {
        [`fields.${parentFieldId}.${sdk.field.locale}.sys.id`]: parentId,
      };
    }

    return {};
  }, [parentFieldId, parentId, sdk.field.locale]);

  // If you only want to extend Contentful's default editing experience
  // reuse Contentful's editor components
  // -> https://www.contentful.com/developers/docs/extensibility/field-editors/
  return (
    <>
      <SlugEditor
        baseSdk={sdk}
        field={sdk.field}
        parameters={{
          instance: { trackingFieldId: "title", uniqueQueryFilter },
        }}
        onChange={(value) => {
          setValue(value);
        }}
      ></SlugEditor>
      {Boolean(url) && (
        <Paragraph style={{ marginTop: 8 }}>
          <Text as="i">{url}</Text>
        </Paragraph>
      )}
    </>
  );
};

export default Field;
