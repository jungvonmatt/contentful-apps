import {
  Box,
  Table as CTable,
  Heading,
  TableBody,
  TableCell,
  TableCellProps,
  TableHead,
  TableRow,
} from "@contentful/f36-components";
import tokens from "@contentful/f36-tokens";
import { css } from "emotion";
import { ReactElement } from "react";
type TableProps = {
  data: any;
};

const containerStyle = css`
  padding: 1px;
  width: 100%;
`;

const tableStyle = css`
  table-layout: fixed;

  th:nth-child(3) {
    width: 5%;
  }

  th:nth-child(4) {
    width: 10%;
  }

  th:nth-child(5) {
    width: 120px;
  }
`;

const bodyStyle = css`
  tr:nth-child(even) td {
    background-color: ${tokens.gray100};
  }

  tr:hover td {
    background-color: ${tokens.blue100};
    cursor: default;
  }
`;

const cellStyle = css`
  overflow: auto;
  white-space: nowrap;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const StyledCell = (props: TableCellProps) => (
  <TableCell className={cellStyle}>{props.children}</TableCell>
);

const Table = ({ data }: TableProps): ReactElement => {
  return (
    <Box className={containerStyle}>
      <Heading as="h3">Field: {data.name}</Heading>
      <CTable className={tableStyle}>
        <TableHead>
          <TableRow>
            <TableCell>Key</TableCell>
            <TableCell>Value</TableCell>
          </TableRow>
        </TableHead>
        <TableBody className={bodyStyle}>
          {Object.keys(data).map((key) => (
            <TableRow key={key}>
              <StyledCell>{key}</StyledCell>
              <StyledCell>{JSON.stringify(data[key])}</StyledCell>
            </TableRow>
          ))}
        </TableBody>
      </CTable>
    </Box>
  );
};

export default Table;
