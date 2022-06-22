import { EntryAPI, SidebarExtensionSDK } from "@contentful/app-sdk";
import { useCMA, useSDK } from "@contentful/react-apps-toolkit";
import { EntryProps, KeyValueMap, Link } from "contentful-management";
import { useEffect, useRef, useState } from "react";

type PageEntry = EntryProps<KeyValueMap>;

const convertEntryApi = (entry: EntryAPI): EntryProps<KeyValueMap> => {
  const sys = entry.getSys();
  return {
    fields: entry.fields,
    metadata: entry.getMetadata(),
    sys: {
      ...sys,
      publishedBy: sys.publishedBy as Link<"User">,
    },
  };
};

export const useContainingPage = () => {
  const cma = useCMA();
  const sdk = useSDK<SidebarExtensionSDK>();

  const entryRef = useRef(sdk.entry);

  const [parent, setParent] = useState<PageEntry>();

  useEffect(() => {
    const findContainingPage = async (
      entry: EntryProps<KeyValueMap>,
      depth: number = 10
    ): Promise<EntryProps<KeyValueMap>> => {
      if (entry?.sys?.contentType?.sys?.id === "page") {
        return entry;
      }

      if (depth < 0 || !entry?.sys?.id) {
        return undefined;
      }

      try {
        const next = await cma.entry.getMany({
          query: { links_to_entry: entry.sys.id, limit: 1 },
        });

        const [node] = next?.items ?? [];

        return findContainingPage(node, depth - 1);
      } catch {
        return undefined;
      }
    };

    (async () => {
      const node = await findContainingPage(convertEntryApi(entryRef.current));
      if (node) {
        setParent(node);
      }
    })();
  }, [cma]);

  return parent;
};
