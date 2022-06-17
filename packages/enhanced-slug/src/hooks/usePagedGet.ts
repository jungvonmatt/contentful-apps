import type { QueryOptions, CollectionProp } from "contentful-management/types";
import { ClientAPI, createClient } from "contentful-management";
import { useSDK, useCMA } from "@contentful/react-apps-toolkit";
const MAX_ALLOWED_LIMIT = 1000;

interface PagedGetOptions<T> {
  method: string;
  skip?: number;
  aggregatedResponse?: CollectionProp<T>;
  query?: QueryOptions;
}

export type PagedGet = <T>({
  method,
  skip,
  aggregatedResponse,
  query,
}: PagedGetOptions<T>) => Promise<CollectionProp<T>>;

/**
 * Gets all the existing entities based on pagination parameters.
 * The first call will have no aggregated response. Subsequent calls will
 * concatenate the new responses to the original one.
 * Methods:
 * - getContentTypes
 * - getEntries
 * - getAssets
 */

export const usePagedGet = () => {
  const sdk = useSDK();
  const cma = createClient({ apiAdapter: sdk.cmaAdapter });

  const pagedGet = async <T>({
    method,
    skip = 0,
    aggregatedResponse,
    query,
  }: PagedGetOptions<T>): Promise<CollectionProp<T>> => {
    const fullQuery: QueryOptions = {
      skip,
      limit: MAX_ALLOWED_LIMIT,
      order: "sys.createdAt,sys.id",
      locale: "*",
      include: 0,
      ...(query || {}),
    };

    const response = (await cma[method](fullQuery)) as CollectionProp<T>;

    if (aggregatedResponse) {
      aggregatedResponse.items = aggregatedResponse.items.concat(
        response.items
      );
    } else {
      aggregatedResponse = response;
    }

    if (skip + MAX_ALLOWED_LIMIT <= response.total) {
      return pagedGet({
        method,
        skip: skip + MAX_ALLOWED_LIMIT,
        aggregatedResponse,
        query,
      });
    }

    return aggregatedResponse;
  };

  return pagedGet;
};
