import React from "react";
import { Flex, Button, Select, Text } from "@chakra-ui/react";

const Pagination = ({
  totalItems,
  itemsPerPage,
  setItemsPerPage,
  currentPage,
  setCurrentPage,
}) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  // ⭐ show only 5 page numbers
  const getVisiblePages = () => {
    const pages = [];
    const start = Math.max(currentPage - 2, 1);
    const end = Math.min(currentPage + 2, totalPages);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  };

  return (
    <Flex justify="space-between" align="center" mt={4} wrap="wrap" gap={3}>
      {/* Items per page selector */}
      <Flex align="center" gap={2}>
        <Text fontSize="sm">Items per page:</Text>
        <Select
          size="sm"
          width="80px"
          value={itemsPerPage}
          onChange={(e) => {
            setItemsPerPage(Number(e.target.value));
            setCurrentPage(1);
          }}
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={15}>15</option>
        </Select>
      </Flex>

      {/* Pagination buttons */}
      <Flex gap={2} align="center" flexWrap="wrap">
        <Button size="sm" onClick={handlePrev} isDisabled={currentPage === 1}>
          Prev
        </Button>

        {/* first page */}
        {currentPage > 3 && (
          <>
            <Button size="sm" onClick={() => setCurrentPage(1)}>
              1
            </Button>
            <Text>...</Text>
          </>
        )}

        {getVisiblePages().map((page) => (
          <Button
            key={page}
            size="sm"
            colorScheme={currentPage === page ? "blue" : "gray"}
            onClick={() => setCurrentPage(page)}
          >
            {page}
          </Button>
        ))}

        {/* last page */}
        {currentPage < totalPages - 2 && (
          <>
            <Text>...</Text>
            <Button size="sm" onClick={() => setCurrentPage(totalPages)}>
              {totalPages}
            </Button>
          </>
        )}

        <Button
          size="sm"
          onClick={handleNext}
          isDisabled={currentPage === totalPages}
        >
          Next
        </Button>
      </Flex>
    </Flex>
  );
};

export default Pagination;