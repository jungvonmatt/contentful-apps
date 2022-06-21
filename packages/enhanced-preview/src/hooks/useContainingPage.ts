import { Entry } from "@contentful/app-sdk";
import { useCMA } from "@contentful/react-apps-toolkit";
import { KeyValueMap } from "contentful-management";
import { useEffect, useState } from "react";

export const useContainingPage = (entryId: string) => {
  const cma = useCMA();

  const [parent, setParent] = useState<Entry<KeyValueMap>>();

  useEffect(() => {
    const findParentPage = async (id: string, depth: number = 10) => {
      const current = await cma.entry.get({ entryId: id });
      if (current?.sys?.contentType?.sys?.id === "page") {
        return current;
      }

      if (depth <= 0) {
        return undefined;
      }

      const entries = await cma.entry.getMany({
        query: { links_to_entry: id },
      });

      for (const node of entries?.items ?? []) {
        if (node.sys.contentType.sys.id === "page") {
          return node;
        }

        const parentNode = await findParentPage(node.sys.id, depth - 1);

        if (parentNode) {
          return parentNode;
        }
      }
    };
    (async () => {
      const node = await findParentPage(entryId);
      if (node) {
        setParent(node);
      }
    })();
  }, [cma, entryId]);

  return parent;
};
