import { FieldExtensionSDK, Link } from "@contentful/app-sdk";
import { Paragraph, Text } from "@contentful/f36-components";
import { useFieldValue, useSDK } from "@contentful/react-apps-toolkit";
import React, { useEffect, useMemo, useState } from "react";
import { SlugEditor } from "../components/slug-editor";
import { useParents } from "../hooks/useParents";

const Field = () => {
  const sdk = useSDK<FieldExtensionSDK>();
  const [value, setValue] = useState<string>(sdk.field.getValue());
  const [slugs, setSlugs] = useState<string[]>();
  const [url, setUrl] = useState<string>();
  const [parent] = useFieldValue<Link>("parent_page");
  const { getParentsDev } = useParents();

  let parentFieldId: string =
    sdk.parameters.installation.parentFieldId || "parent_page";

  const parentId = parent?.sys?.id;

  sdk.field.onValueChanged((newValue) => {
    if (value !== newValue) {
      setValue(newValue);
    }
  });

  useEffect(() => {
    sdk.window.startAutoResizer();
    // @ts-ignore
    return () => sdk.window.stopAutoResizer();
  }, [sdk.window]);

  useEffect(() => {
    (async () => {
      const parents = parentId ? await getParentsDev(parentId) : [];

      setSlugs(
        parents.map(
          (parent) => parent?.fields?.[sdk.field.id]?.[sdk.field.locale]
        )
      );
    })();
  }, [getParentsDev, parentId, sdk.field.id, sdk.field.locale]);

  useEffect(() => {
    (async () => {
      if (value && Array.isArray(slugs)) {
        setUrl(`/${[...slugs, value].join("/")}`);
      } else if (value) {
        setUrl(`/${value}`);
      }
    })();
  }, [slugs, value]);

  const uniqueQueryFilter = useMemo(() => {
    if (parentId) {
      return {
        [`fields.${parentFieldId}.${sdk.field.locale}.sys.id`]: parentId,
      };
    }

    return {};
  }, [parentFieldId, parentId, sdk.field.locale]);

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
          Path: <Text as="i">{url}</Text>
        </Paragraph>
      )}
    </>
  );
};

export default Field;
