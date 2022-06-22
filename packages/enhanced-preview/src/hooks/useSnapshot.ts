import { SidebarExtensionSDK, EntryAPI } from "@contentful/app-sdk";
import { useCMA, useSDK } from "@contentful/react-apps-toolkit";
import { EntryProps, KeyValueMap } from "contentful-management";
import { useEffect, useState } from "react";
import { isChanged, isPublished } from "../lib/checks";

export const useSnapshot = () => {
  const cma = useCMA();
  const sdk = useSDK<SidebarExtensionSDK>();

  const sys = sdk.entry.getSys();
  const [entry, setEntry] = useState<EntryAPI | EntryProps<KeyValueMap>>(
    isPublished({ sys }) ? sdk.entry : undefined
  );

  useEffect(() => {
    sdk.entry.onSysChanged((sys) => {
      const state = isPublished({ sys })
        ? "published"
        : isChanged({ sys })
        ? "changed"
        : "";

      if (state === "published") {
        cma.entry.get({ entryId: sys.id }).then((entry) => {
          setEntry(entry);
        });
      } else if (state === "") {
        setEntry(undefined);
      }
    });

    if (isChanged({ sys })) {
      cma.snapshot.getManyForEntry({ entryId: sys.id }).then(({ items }) => {
        if (items?.length) {
          const entry = items[items.length - 1].snapshot;
          setEntry(entry);
        }
      });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return entry;
};

export const useSnapshotValue = <T = any>(fieldId: string): T => {
  const sdk = useSDK();
  const entry = useSnapshot();

  return entry?.fields?.[fieldId]?.[sdk.locales.default] as T;
};
