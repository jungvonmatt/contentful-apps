import { EditorAppSDK } from "@contentful/app-sdk";
import {
  DateTime,
  Flex,
  Heading,
  Note,
  Paragraph,
  Spinner,
  Stack,
  Text,
} from "@contentful/f36-components";
import { WorkbenchContent } from "@contentful/f36-workbench";
import { useSDK } from "@contentful/react-apps-toolkit";
import OpenAI from "openai";
import { useEffect, useState } from "react";
import Table from "../components/Table";

const Entry = () => {
  const sdk = useSDK<EditorAppSDK>();

  const [documentation, setDocumentation] = useState<Documentation>();
  const [error, setError] = useState("");

  const { contentType } = sdk;

  const fetchDocumentation = async () => {
    try {
      const openai = new OpenAI({
        organization: "org-chAGFfV7luYM1pu8EtLJILYA",
        apiKey: import.meta.env.VITE_OPENAI_API_KEY,
        dangerouslyAllowBrowser: true,
      });

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content:
              "You are a Contentful Professional. Your job is to analyze the content types I provide in JSON format. Then, you write detailed documentation about the provided content type. The documentation is meant for a Content Manager who implements content into the content type and needs to understand every field of the content type, how to use it, and what kind of content should go into the fields. Always provide an example on how to use this Content Type. Your output has to be JSON format as well.",
          },
          {
            role: "user",
            content:
              "Provide a documentation in JSON for the following Contentful Content Type: " +
              JSON.stringify(contentType),
          },
        ],
        max_tokens: 4095,
        temperature: 0.5,
      });

      console.log(response);

      if (response) {
        let plainResponse = response.choices[0].message.content;
        if (plainResponse && plainResponse !== "") {
          plainResponse = plainResponse
            .replace("```json", "")
            .replaceAll("```", "");
        }
        setDocumentation(JSON.parse(plainResponse ?? ""));
      } else {
        throw new Error("Failed to generate documentation");
      }
    } catch (error) {
      setError("Error fetching documentation: " + error);
    }
  };

  useEffect(() => {
    fetchDocumentation();
  }, []);

  return (
    <WorkbenchContent type="default">
      <Heading as="h1">Documentation for {contentType.name}</Heading>
      {error && <Paragraph title="Error">{error}</Paragraph>}
      {!documentation && (
        <Flex justifyContent="center">
          <Text marginRight="spacingXs">Loading</Text>
          <Spinner />
        </Flex>
      )}
      {documentation && (
        <Stack flexDirection="column" alignItems="start">
          <Note variant="neutral">
            This documentation was generated on <DateTime date={Date.now()} />
          </Note>
          <Heading as="h2">Available Fields</Heading>
          {documentation.fields.map((field) => (
            <Table key={field.id} data={field} />
          ))}
        </Stack>
      )}
    </WorkbenchContent>
  );
};

export default Entry;
