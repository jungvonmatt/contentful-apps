import { MetaSysProps } from "contentful-management";

export function isArchived(entity: { sys: MetaSysProps }) {
  return !!entity.sys.archivedVersion;
}

export function isPublished(entity: { sys: MetaSysProps }) {
  return (
    !!entity.sys.publishedVersion &&
    entity.sys.version === entity.sys.publishedVersion + 1
  );
}

export function isChanged(entity: { sys: MetaSysProps }) {
  return (
    !!entity.sys.publishedVersion &&
    entity.sys.version >= entity.sys.publishedVersion + 2
  );
}

export function isDraft(entity: { sys: MetaSysProps }) {
  return !entity.sys.publishedVersion;
}
