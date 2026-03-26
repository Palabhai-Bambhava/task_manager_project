import React from "react";
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Box,
  Text,
  Button,
  HStack,
} from "@chakra-ui/react";

const TableComponent = ({
  title,
  columns,
  data = [],
  onEdit,
  onDelete,
  onView,
  renderCell,
}) => {
  return (
    <Box mt={5}>
      {title && (
        <Text fontSize="2xl" mb={4}>
          {title}
        </Text>
      )}

      <Table variant="simple">
        <Thead>
          <Tr>
            {columns.map((col) => (
              <Th key={col}>{col}</Th>
            ))}
            {(onEdit || onDelete || onView) && <Th>ACTIONS</Th>}
          </Tr>
        </Thead>

        <Tbody>
          {data.length > 0 ? (
            data.map((row) => (
              <Tr key={row._id}>
                {columns.map((col) => (
                  <Td key={col}>
                    {renderCell ? renderCell(row, col) : row[col]}
                  </Td>
                ))}

                {(onEdit || onDelete || onView) && (
                  <Td>
                    <HStack spacing={2}>
                      {onView && (
                        <Button
                          size="sm"
                          colorScheme="green"
                          onClick={() => onView(row)}
                        >
                          View
                        </Button>
                      )}

                      {onEdit && (
                        <Button
                          size="sm"
                          colorScheme="blue"
                          onClick={() => onEdit(row)}
                        >
                          ✏️
                        </Button>
                      )}

                      {onDelete && (
                        <Button
                          size="sm"
                          colorScheme="red"
                          onClick={() => onDelete(row._id)}
                        >
                          🗑️
                        </Button>
                      )}
                      {!onEdit && !onDelete && row.onApply && (
                        <Button
                          size="sm"
                          colorScheme={row.isActive ? "green" : "purple"}
                          isDisabled={row.isActive}
                          onClick={() => row.onApply(row.original)}
                        >
                          {row.isActive ? "Activated" : "Choose Plan"}
                        </Button>
                      )}
                    </HStack>
                  </Td>
                )}
              </Tr>
            ))
          ) : (
            <Tr>
              <Td colSpan={columns.length + 1} textAlign="center">
                No data found
              </Td>
            </Tr>
          )}
        </Tbody>
      </Table>
    </Box>
  );
};

export default TableComponent;
