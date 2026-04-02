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
  Badge,
  Avatar,
  AvatarGroup,
  Tooltip,
} from "@chakra-ui/react";
import { ViewIcon } from "@chakra-ui/icons";
const TableComponent = ({
  title,
  columns,
  data = [],
  onEdit,
  onDelete,
  onView,
  renderCell,
}) => {
  const STATUS_COLOR_MAP = {
    Active: "green",
    Inactive: "red",
    Pending: "yellow",
    pending: "yellow",
    open: "yellow",
    resolved: "green",
    Completed: "green",
    completed: "green",
    default: "blue", // fallback
  };
  return (
    <Box mt={5} p={5} bg="white" borderRadius="lg" shadow="md">
      {title && (
        <Text fontSize="2xl" fontWeight="bold" mb={6}>
          {title}
        </Text>
      )}

      <Table variant="simple" size="md" colorScheme="gray">
        <Thead bg="gray.100">
          <Tr>
            {columns.map((col) => (
              <Th
                key={col}
                fontSize="sm"
                textTransform="uppercase"
                letterSpacing="wider"
                color="gray.600"
              >
                {col}
              </Th>
            ))}
            {(onEdit || onDelete || onView) && <Th>ACTIONS</Th>}
          </Tr>
        </Thead>

        <Tbody>
          {data.length > 0 ? (
            data.map((row, idx) => (
              <Tr
                key={row._id}
                _hover={{ bg: "gray.50", cursor: "pointer" }}
                bg={idx % 2 === 0 ? "gray.50" : "white"}
              >
                {columns.map((col) => (
                  <Td key={col} fontSize="sm" color="gray.700">
                    {renderCell ? (
                      renderCell(row, col)
                    ) : col === "Status" ? (
                      <Badge
                        px={3}
                        py={1}
                        borderRadius="full"
                        colorScheme={
                          STATUS_COLOR_MAP[row.Status] ||
                          STATUS_COLOR_MAP.default
                        }
                      >
                        {row.Status || "-"}
                      </Badge>
                    ) : col === "AssignedTo" ||
                      col === "AssignedStaff" ||
                      col === "Access" ||
                      col === "Owner" ||
                      col === "CreatedBy" ||
                      col === "Role" ? (
                      <HStack spacing={2}>
                        {Array.isArray(row[col]) ? (
                          <AvatarGroup size="xs" max={3}>
                            {row[col].map((user, i) => {
                              const name =
                                typeof user === "string"
                                  ? user
                                  : user?.name || "User";

                              return (
                                <Tooltip key={i} label={name} hasArrow>
                                  <Avatar name={name} />
                                </Tooltip>
                              );
                            })}
                          </AvatarGroup>
                        ) : (
                          <Tooltip
                            label={
                              typeof row[col] === "string"
                                ? row[col]
                                : row[col]?.name || "Unassigned"
                            }
                            hasArrow
                          >
                            <Avatar
                              size="xs"
                              name={
                                typeof row[col] === "string"
                                  ? row[col]
                                  : row[col] || "Unassigned"
                              }
                            />
                          </Tooltip>
                        )}

                        <Text fontSize="sm" color="gray.500">
                          {Array.isArray(row[col])
                            ? `${row[col].length} Users`
                            : typeof row[col] === "string"
                              ? row[col]
                              : row[col]?.name || "Unassigned"}
                        </Text>
                      </HStack>
                    ) : col === "Name" || col === "Title" ? (
                      <Text fontWeight="semibold" color="gray.800">
                        {row[col] || "-"}
                      </Text>
                    ) : (
                      row[col] || "-"
                    )}
                  </Td>
                ))}

                {(onEdit || onDelete || onView) && (
                  <Td>
                    <HStack spacing={2}>
                      {onView && (
                        <Tooltip label="View" hasArrow>
                          <Button
                            size="sm"
                            colorScheme="green"
                            variant="outline"
                            _hover={{ bg: "green.50" }}
                            onClick={() => onView(row)}
                          >
                            <ViewIcon />
                          </Button>
                        </Tooltip>
                      )}

                      {onEdit && (
                        <Tooltip label="Edit" hasArrow>
                          <Button
                            size="sm"
                            colorScheme="blue"
                            variant="outline"
                            _hover={{ bg: "blue.50" }}
                            onClick={() => onEdit(row)}
                          >
                            ✏️
                          </Button>
                        </Tooltip>
                      )}

                      {onDelete && (
                        <Tooltip label="Delete" hasArrow>
                          <Button
                            size="sm"
                            colorScheme="red"
                            variant="outline"
                            _hover={{ bg: "red.50" }}
                            onClick={() => onDelete(row._id)}
                          >
                            🗑️
                          </Button>
                        </Tooltip>
                      )}

                      {!onEdit && !onDelete && row.onApply && (
                        <Button
                          size="sm"
                          colorScheme={row.isActive ? "green" : "purple"}
                          isDisabled={row.isActive}
                          variant="solid"
                          _hover={{
                            bg: row.isActive ? "green.400" : "purple.600",
                          }}
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
              <Td
                colSpan={columns.length + 1}
                textAlign="center"
                fontSize="sm"
                color="gray.500"
              >
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
