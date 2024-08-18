import { Heading, Paragraph } from "@contentful/f36-components";

import { WorkbenchContent } from "@contentful/f36-workbench";

const Home = () => {
  return (
    <WorkbenchContent type="default">
      <Heading as="h1">This is the Home page for Navigation Build POC</Heading>
      <Heading as="h2">Motivation</Heading>
      <Paragraph>
        Contentful is not user friendly when it comes to build a navigation
        menu. The intention behind this application is to enhance user
        experience and accessibility inside Contentful.
      </Paragraph>
      <Heading as="h2">Problem</Heading>
      <Paragraph>
        Every new client needs to be onboarded to Contentful and the content
        types. We need navigation for every project we do and this topic is
        always problematic to be introduced to.
      </Paragraph>
      <Heading as="h2">Solution</Heading>
      <Paragraph>
        Contentful App that adds a tab to navigation Content Type with an easy
        to use UI.
      </Paragraph>
      <Heading as="h2">Usage</Heading>
      <Paragraph>
        You can find the 'Navigation Builder' tab under navigation content type.
      </Paragraph>
    </WorkbenchContent>
  );
};

export default Home;
