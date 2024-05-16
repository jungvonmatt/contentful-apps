interface SysInfo {
  type: "Link";
  linkType: "Asset" | "Entry";
  id: string;
}

interface FieldValidation {
  linkMimetypeGroup?: string[];
  linkContentType?: string[];
  size?: {
    max: number;
  };
}

interface Field {
  id: string;
  name: string;
  type: "Symbol" | "Link" | "Array";
  localized: boolean;
  required: boolean;
  validations?: FieldValidation[];
  description: string;
  linkType?: "Asset" | "Entry";
  items?: {
    type: "Link";
    validations?: FieldValidation[];
    linkType: "Entry";
  };
  example: string | SysInfo | SysInfo[];
}

interface LocalizedString {
  [locale: string]: string;
}

interface Documentation {
  name: string;
  description: string;
  displayField: string;
  fields: Field[];
  exampleUsage: {
    internal_name: string;
    title: LocalizedString;
    site_name: LocalizedString;
    default_share_image: SysInfo;
    home: SysInfo;
    main_menu: SysInfo;
    meta_menu: SysInfo;
    social_menu: SysInfo;
    footer_menus: SysInfo[];
  };
}
