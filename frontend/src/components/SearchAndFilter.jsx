import React from "react";
import { HStack, Input, Select, FormControl, FormLabel, Box } from "@chakra-ui/react";

const SearchAndFilter = ({ search, setSearch, status, setStatus, options }) => {
  return (
    <Box mb={6} w="100%">
      <HStack spacing={4} flexWrap="wrap">
        {/* Status Filter */}
        <FormControl w="180px">
          <FormLabel fontSize="sm" fontWeight="bold" color="gray.600" mb={1}>
            Status
          </FormLabel>
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            bg="white"
            borderColor="gray.300"
            _hover={{ borderColor: "blue.300" }}
            _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px #3182ce" }}
            borderRadius="md"
            size="sm"
          >
            {options.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </Select>
        </FormControl>

        {/* Search Input */}
        <FormControl flex="1" minW="200px">
          <FormLabel fontSize="sm" fontWeight="bold" color="gray.600" mb={1}>
            Search
          </FormLabel>
          <Input
            placeholder="Search by name, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            bg="white"
            borderColor="gray.300"
            _hover={{ borderColor: "blue.300" }}
            _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px #3182ce" }}
            borderRadius="md"
            size="sm"
          />
        </FormControl>
      </HStack>
    </Box>
  );
};

export default SearchAndFilter;