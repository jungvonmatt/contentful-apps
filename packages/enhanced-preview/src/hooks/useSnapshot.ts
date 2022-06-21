import { useCMA, useSDK } from "@contentful/react-apps-toolkit";
import { EntryProps, KeyValueMap } from "contentful-management";
import { useEffect, useState } from "react";

export const useSnapshot = (entryId: string) => {
  const cma = useCMA();
  const sdk = useSDK();

  const [entry, setEntry] = useState<EntryProps<KeyValueMap>>();

  useEffect(() => {
    (async () => {
      const snapshot = await cma.snapshot.getManyForEntry({
        entryId,
        environmentId: sdk.ids.environment,
      });

      if (snapshot.items.length) {
        setEntry(snapshot.items[snapshot.items.length - 1].snapshot);
      }
    })();
  }, [cma.snapshot, entryId, sdk.ids.environment]);

  return entry;
};

export const useSnapshotValue = <T = any>(
  entryId: string,
  fieldId: string
): T => {
  const cma = useCMA();
  const sdk = useSDK();

  const [value, setValue] = useState<T>();

  useEffect(() => {
    (async () => {
      const snapshot = await cma.snapshot.getManyForEntry({
        entryId,
        environmentId: sdk.ids.environment,
      });

      if (snapshot.items.length) {
        const entry = snapshot.items[snapshot.items.length - 1].snapshot;
        setValue(entry.fields?.[fieldId]?.[sdk.locales.default] as T);
      }
    })();
  }, [cma.snapshot, entryId, sdk.ids.environment]);

  return value;
};
