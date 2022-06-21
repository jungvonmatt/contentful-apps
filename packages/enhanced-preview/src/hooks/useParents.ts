import { Link } from "@contentful/app-sdk";
import { useCMA, useFieldValue, useSDK } from "@contentful/react-apps-toolkit";
import { EntryProps, KeyValueMap, PlainClientAPI } from "contentful-management";
import { useCallback } from "react";
import { AppInstallationParameters } from "../locations/ConfigScreen";

export const useParents = () => {
  const cma = useCMA();
  const sdk = useSDK();

  const parameters = sdk?.parameters?.installation as AppInstallationParameters;
  const parentFieldId = parameters.parentFieldId || "parent_page";

  const getParentsDev = useCallback(
    async (entryId: string): Promise<Array<EntryProps<KeyValueMap>>> => {
      const entry = await cma.entry.get({
        entryId,
        environmentId: sdk.ids.environment,
      });
      const parentLink: Link =
        entry?.fields?.[parentFieldId]?.[sdk.locales.default];

      if (!parentLink) {
        return [entry];
      }

      const parent = await cma.entry.get({
        entryId: parentLink.sys.id,
        environmentId: sdk.ids.environment,
      });

      if (!parent) {
        return [entry];
      }

      const parentEntries = await getParentsDev(parent.sys.id);

      return [...parentEntries, entry];
    },
    [cma.entry, parentFieldId, sdk.ids.environment, sdk.locales.default]
  );

  const getParentsProd = useCallback(
    async (entryId: string): Promise<Array<EntryProps<KeyValueMap>>> => {
      const snapshot = await cma.snapshot.getManyForEntry({
        entryId,
      });

      const items = snapshot?.items ?? [];
      if (!items.length) {
        return [];
      }

      const entry = items?.[items.length - 1]?.snapshot;
      const parentLink: Link =
        entry?.fields?.[parentFieldId]?.[sdk.locales.default];

      if (!parentLink) {
        return [entry];
      }

      const parentSnapshot = await cma.snapshot.getManyForEntry({
        entryId: parentLink.sys.id,
      });

      const parentItems = parentSnapshot?.items ?? [];
      if (!parentItems.length) {
        return [entry];
      }

      const parent = parentItems?.[parentItems.length - 1]?.snapshot;
      if (!parent) {
        return [entry];
      }

      const parentEntries = await getParentsProd(parent.sys.id);

      if (parentEntries.length) {
        return [...parentEntries, entry];
      }

      return [];
    },
    [cma.snapshot, parentFieldId, sdk.locales.default]
  );

  const getParentValues = useCallback(
    async (entryId, fieldId) => {
      const parentsDev = await getParentsDev(entryId);
      const parentsProd = await getParentsProd(entryId);

      const dev = parentsDev.map(
        (node) => node?.fields?.[fieldId]?.[sdk.locales.default]
      );
      const prod = parentsProd.map(
        (node) => node?.fields?.[fieldId]?.[sdk.locales.default]
      );

      return {
        dev,
        prod,
      };
    },
    [getParentsDev, getParentsProd, sdk.locales.default]
  );

  return {
    getParentValues,
    getParentsProd,
    getParentsDev,
  };
};
