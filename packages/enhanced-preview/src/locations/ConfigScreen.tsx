import { AppExtensionSDK } from "@contentful/app-sdk";
import {
  Flex,
  Stack,
  Form,
  FormControl,
  Heading,
  SectionHeading,
  Subheading,
  TextInput,
  Checkbox,
  IconButton,
  Paragraph,
} from "@contentful/f36-components";
import { DeleteTrimmedIcon } from "@contentful/f36-icons";
import { /* useCMA, */ useSDK } from "@contentful/react-apps-toolkit";
import { css } from "emotion";
import React, { useCallback, useEffect, useState } from "react";

export interface Domain {
  domain?: string;
  name?: string;
  isPreview?: boolean;
}

export interface AppInstallationParameters {
  domains: Domain[];
  parentFieldId?: string;
  slugFieldId?: string;
}

const ConfigScreen = () => {
  const [parameters, setParameters] = useState<AppInstallationParameters>({
    domains: [],
  });

  const [domains, setDomains] = useState<Domain[]>([]);

  // useEffect(() => {

  // }); // eslint-disable-line react-hooks/exhaustive-deps

  const sdk = useSDK<AppExtensionSDK>();
  /*
     To use the cma, inject it as follows.
     If it is not needed, you can remove the next line.
  */
  // const cma = useCMA();

  const onConfigure = useCallback(async () => {
    // This method will be called when a user clicks on "Install"
    // or "Save" in the configuration screen.
    // for more details see https://www.contentful.com/developers/docs/extensibility/ui-extensions/sdk-reference/#register-an-app-configuration-hook

    // Get current the state of EditorInterface and other entities
    // related to this app installation
    const currentState = await sdk.app.getCurrentState();

    return {
      // Parameters to be persisted as the app configuration.
      parameters,
      // In case you don't want to submit any update to app
      // locations, you can just pass the currentState as is
      targetState: currentState,
    };
  }, [parameters, sdk]);

  useEffect(() => {
    // `onConfigure` allows to configure a callback to be
    // invoked when a user attempts to install the app or update
    // its configuration.
    sdk.app.onConfigure(() => onConfigure());
  }, [sdk, onConfigure]);

  useEffect(() => {
    (async () => {
      // Get current parameters of the app.
      // If the app is not installed yet, `parameters` will be `null`.
      const currentParameters: AppInstallationParameters | null =
        await sdk.app.getParameters();

      if (currentParameters) {
        setParameters(currentParameters);
      }

      if (currentParameters.domains) {
        setDomains([
          ...(currentParameters?.domains ?? []),
          { domain: "", name: "", isPreview: false },
        ]);
      }

      // Once preparation has finished, call `setReady` to hide
      // the loading screen and present the app to a user.
      sdk.app.setReady();
    })();
  }, [sdk]);

  // );

  const addEmpty = () => {
    const last = domains[domains.length - 1];
    if (last.domain && last.name) {
      setDomains((domains) => [
        ...domains,
        { domain: "", name: "", isPreview: false },
      ]);
    }
  };

  const setDomainValue = (index: number, key: keyof Domain, value: any) => {
    const domain = domains[index];
    setDomains([
      ...domains.slice(0, index),
      { ...domain, [key]: value },
      ...domains.slice(index + 1),
    ]);
  };

  const removeDomainValue = (index: number) => {
    setDomains([...domains.slice(0, index), ...domains.slice(index + 1)]);
  };

  useEffect(() => {
    const newDomains = domains.filter((data) => data.domain && data.name);
    setParameters((parameters) => ({
      ...parameters,
      domains: newDomains,
    }));
  }, [domains]);

  return (
    <Flex
      flexDirection="column"
      className={css({ margin: "80px", maxWidth: "800px" })}
    >
      <Form>
        <Heading>Enhanced Slug: Config</Heading>
        <Subheading marginBottom="none">Configure preview domains</Subheading>
        <Paragraph>
          These domains will be available in the Sidebar App
        </Paragraph>
        {domains.map((data, index) => (
          <Stack marginBottom="none" key={index}>
            <FormControl>
              <FormControl.Label>Name</FormControl.Label>
              <TextInput
                size="small"
                type="text"
                name="name"
                value={data.name}
                onChange={(e) => setDomainValue(index, "name", e.target.value)}
                onBlur={() => addEmpty()}
              />
            </FormControl>
            <FormControl>
              <FormControl.Label>Domain</FormControl.Label>
              <TextInput
                size="small"
                type="text"
                name="domain"
                value={data.domain}
                onChange={(e) =>
                  setDomainValue(index, "domain", e.target.value)
                }
                onBlur={() => addEmpty()}
              />
            </FormControl>
            <Checkbox.Group name="checkbox-options">
              <Checkbox
                name="isPreview"
                isChecked={data.isPreview}
                label="Use preview API"
                onChange={() =>
                  setDomainValue(index, "isPreview", !data.isPreview)
                }
              >
                Use preview API
              </Checkbox>
            </Checkbox.Group>
            {index < domains.length - 1 && (
              <IconButton
                variant="transparent"
                aria-label="Remove domain"
                onClick={() => {
                  removeDomainValue(index);
                }}
                icon={<DeleteTrimmedIcon />}
              />
            )}
          </Stack>
        ))}
        <Subheading marginBottom="none" marginTop="spacingM">
        Parent reference field
        </Subheading>
        <Paragraph>
          This is required to compute the URL path
        </Paragraph>
        <FormControl>
          {/* <FormControl.Label>Parent reference field</FormControl.Label> */}
          <TextInput
            value={parameters.parentFieldId}
            type="text"
            name="slugFieldId"
            placeholder="slug"
            onChange={(e) =>
              setParameters({ ...parameters, slugFieldId: e.target.value })
            }
          />
        </FormControl>
        <FormControl>
          {/* <FormControl.Label>Parent reference field</FormControl.Label> */}
          <TextInput
            value={parameters.parentFieldId}
            type="text"
            name="parentFieldId"
            placeholder="parent_page"
            onChange={(e) =>
              setParameters({ ...parameters, parentFieldId: e.target.value })
            }
          />
        </FormControl>
      </Form>
    </Flex>
  );
};

export default ConfigScreen;
