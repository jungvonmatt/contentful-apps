import { createClient } from "contentful";

export type Page = {
  slug: string;
  label: string;
  key: string;
  children?: Page[];
};
export type NavigationContent = {
  fields: {
    title: string;
    slug: string;
  };
};

export const getAllPages = async () => {
  const client = createClient({
    space: import.meta.env.VITE_REACT_APP_SPACE_ID,
    accessToken: import.meta.env.VITE_REACT_APP_ACCESS_TOKEN,
  });

  const result = await client.getEntries({
    content_type: import.meta.env.VITE_REACT_APP_CONTENT_TYPE,
  });
  return formatPages(result.items as unknown as NavigationContent[]);
};

export const formatPages = (pages: NavigationContent[]): Page[] => {
  return pages.map(({ fields }) => {
    const { title, slug } = fields;
    return {
      label: title,
      key: slug,
      slug,
    };
  });
};

export const mapUsedSlugs = (navigation: Page[]) => {
  return navigation.reduce((acc: string[], nav) => {
    if (nav.children && nav.children.length) {
      const childrenSlugs = mapUsedSlugs(nav.children);
      acc.push(...childrenSlugs);
    }
    acc.push(nav.slug);
    return acc;
  }, []);
};

export const filterPages = (usedPages: Page[], navigation: any[] = []) => {
  const usedSlugs = mapUsedSlugs(navigation);
  return usedPages.filter(({ slug }) => !usedSlugs.includes(slug));
};

export const removeFromArray = (page: Page, array: any[]) => {
  const arrayCopy = [...array];
  const index = arrayCopy.indexOf(page);
  arrayCopy.splice(index, 1);
  return arrayCopy;
};
