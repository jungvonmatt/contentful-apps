// import { BaseExtensionSDK } from "@contentful/app-sdk";
// import { Entry } from "contentful-management";
// import { useEffect, useState } from "react";
// import { usePagedGet, PagedGet } from "./usePagedGet";

// const findPage = async (id: string, pagedGet: PagedGet) => {
//   const { items: entries } = await pagedGet<Entry>({
//     method: "getEntries",
//     query: { links_to_entry: id },
//   });

//   const page = entries.find((entry) => entry.sys.contentType.sys.id === "page");

//   if (page) {
//     return page;
//   }

//   for (const entry of entries) {
//     const page = await findPage(entry.sys.id, pagedGet);
//     if (page) {
//       return page;
//     }
//   }

//   return undefined;
// };

// export const useReferencingPage = (id:string, sdk: BaseExtensionSDK) => {
// //   const pagedGet = usePagedGet(sdk.cmaAdapter);
//   const [page, setPage] = useState<Entry>();

//   useEffect(() => {
//     findPage(id, pagedGet).then((node) => setPage(node));
//   }, [id, pagedGet]);

//   return page;
// };


export {}