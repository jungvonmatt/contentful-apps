import { EditorAppSDK } from "@contentful/app-sdk";
import { Heading } from "@contentful/f36-components";
import { WorkbenchContent } from "@contentful/f36-workbench";
import { /* useCMA, */ useSDK } from "@contentful/react-apps-toolkit";

const Entry = () => {
  const sdk = useSDK<EditorAppSDK>();
  /*
     To use the cma, inject it as follows.
     If it is not needed, you can remove the next line.
  */
  // const cma = useCMA();
  const contentType = "Settings";

  return (
    <WorkbenchContent type="default">
      <Heading as="h1">Documentation for {contentType}</Heading>
    </WorkbenchContent>
  );
};

export default Entry;
