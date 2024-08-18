import { WorkbenchContent } from "@contentful/f36-workbench";
import { ListBox } from "primereact/ListBox";
import { Tree } from "primereact/tree";
import { useEffect, useState } from "react";
// theme
import { useFieldValue } from "@contentful/react-apps-toolkit";
import "primereact/resources/themes/lara-light-cyan/theme.css";
import { filterPages, getAllPages, Page, removeFromArray } from "../utils/page";
import styles from "./EntryEditor.module.scss";

const Entry = () => {
  const [navigation, setNavigation] = useFieldValue<Page[]>("navigation");
  const [pages, setPages] = useState<Page[]>([]);

  useEffect(() => {
    getAllPages().then((result) => {
      const filteredPages = filterPages(result, navigation);
      setPages(filteredPages);
    });
  }, []);

  useEffect(() => {
    if (!Array.isArray(navigation)) setNavigation([]);
  }, [navigation]);

  const addNavigation = (page: Page) => {
    const newPages = removeFromArray(page, pages);
    setPages(newPages);
    setNavigation([...(navigation || []), page]);
  };

  // const removeNavigation = (page: Page) => {
  //   setPages([...pages, page]);
  // };

  const nodeTemplate = (page: any) => {
    const { label, slug } = page;
    return (
      <div className={styles.navItem}>
        <div className={styles.text}>
          <span>{label}</span>
          <small>{slug}</small>
        </div>
        {/* <IconButton
          size="small"
          variant="transparent"
          icon={<CloseIcon size="tiny" className={styles.delete} />}
          aria-label="Remove navigation"
          onClick={() => removeNavigation(page)}
        /> */}
      </div>
    );
  };

  return (
    <WorkbenchContent type="default">
      <div className={styles.wrapper}>
        <Tree
          value={navigation}
          dragdropScope="navigation"
          onDragDrop={(e) => setNavigation(e.value as Page[])}
          className={styles.navigation}
          nodeTemplate={nodeTemplate}
        />
        <ListBox
          filter
          onChange={(e) => addNavigation(e.value)}
          options={pages}
          optionLabel="label"
          className={styles.filter}
        />
      </div>
    </WorkbenchContent>
  );
};

export default Entry;
