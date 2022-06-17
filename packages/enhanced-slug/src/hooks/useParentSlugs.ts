import { BaseExtensionSDK, EntryAPI, FieldExtensionSDK } from "@contentful/app-sdk";
import { Entry } from "contentful-management";
import { useEffect, useState } from "react";
import { usePagedGet, PagedGet } from "./usePagedGet";


export const useParentSlugs = (sdk: FieldExtensionSDK) => {
  
  const fields = sdk.entry.fields

  console.log(fields);

  return fields;
};
