import { Heading, Paragraph, TextLink } from "@contentful/f36-components";
import { ExternalLinkIcon } from "@contentful/f36-icons";

import { WorkbenchContent } from "@contentful/f36-workbench";

const Home = () => {
  return (
    <WorkbenchContent type="default">
      <img
        alt='Team Her Logo"'
        height="281px"
        width="500px"
        src="https://images.ctfassets.net/kuie7ww395uo/4n79EgZfJ7O6UD62nzscuB/bb7ff2f05265d55f19bdd5bcbe58fcad/logo.jpg"
      />
      <Heading as="h1">This is the Home page for Hackathon Team Her</Heading>
      <Heading as="h3">Motivation</Heading>
      <Paragraph>
        We need documentation for every project we do. Every new client needs to
        be onboarded to Contentful and the content types. Even if we work with
        experienced content manager, we spend a lot of time on documentation. We
        repeat documenting in the next project, for the next client, even if it
        is very similar to another one. Whenever time and money are short,
        documentation seems to be the first thing to skip. As it is however a
        very simple and repetitive task, we automate it.
      </Paragraph>
      <Heading as="h3">Usage</Heading>
      <Paragraph>
        You can find the Documentation tab under each configured content.{" "}
        <TextLink
          icon={<ExternalLinkIcon />}
          alignIcon="end"
          href="https://app.contentful.com/spaces/kuie7ww395uo/environments/hackathon-documentation-assist/entries/settings"
          target="_blank"
          rel="noopener noreferrer"
        >
          Example
        </TextLink>
      </Paragraph>
      <img
        alt='Settings Documentation"'
        height="450px"
        width="800px"
        src="https://images.ctfassets.net/kuie7ww395uo/2IULh09ASqliTDsmOco1J8/9dbdc942062eefa20feca70cbc90623d/example1.png"
      />
    </WorkbenchContent>
  );
};

export default Home;
