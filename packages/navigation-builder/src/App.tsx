import { locations } from "@contentful/app-sdk";
import { useSDK } from "@contentful/react-apps-toolkit";
import { useMemo } from "react";
import EntryEditor from "./locations/EntryEditor";
import Home from "./locations/Home";

const ComponentLocationSettings = {
  [locations.LOCATION_ENTRY_EDITOR]: EntryEditor,
  [locations.LOCATION_HOME]: Home,
};

const App = () => {
  const sdk = useSDK();

  const Component = useMemo(() => {
    for (const [location, component] of Object.entries(
      ComponentLocationSettings
    )) {
      if (sdk.location.is(location)) {
        return component;
      }
    }
  }, [sdk.location]);

  return Component ? <Component /> : null;
};

export default App;