import { WorkbenchContent } from "@contentful/f36-workbench";
import { Tree } from "primereact/tree";
import { useEffect, useState } from "react";
import { NodeService } from "../service/NodeService";
// theme
import { useFieldValue } from "@contentful/react-apps-toolkit";
import "primereact/resources/themes/lara-light-cyan/theme.css";
import { TreeNode } from "primereact/treenode";
import styles from "./EntryEditor.module.scss";

const Entry = () => {
  const [nodes, setNodes] = useState<TreeNode[]>([]);
  const [, setNavigation] = useFieldValue("navigation");

  useEffect(() => {
    NodeService.getTreeNodes().then((data) => setNodes(data));
  }, []);

  useEffect(() => {
    setNavigation(nodes);
  }, [nodes]);

  return (
    <WorkbenchContent type="default" className={styles.container}>
      <div className="card flex justify-content-center">
        <Tree
          value={nodes}
          dragdropScope="demo"
          onDragDrop={(e) => setNodes(e.value)}
          className={styles.container}
        />
      </div>
    </WorkbenchContent>
  );
};

export default Entry;
