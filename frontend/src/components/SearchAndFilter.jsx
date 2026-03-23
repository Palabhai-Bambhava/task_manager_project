import React from "react";
import { HStack, Input, Select, Text } from "@chakra-ui/react";

const SearchAndFilter = ({ search, setSearch, status, setStatus, options }) => {
  return (
    <HStack spacing={4} mb={4}>
      <Text>Status:</Text>
      <Select w="150px" value={status} onChange={(e) => setStatus(e.target.value)}>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </Select>

      <Input
        placeholder="Search..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
    </HStack>
  );
};

export default SearchAndFilter;