import { Box, Flex } from "@chakra-ui/react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

const DashboardLayout = ({ children }) => {
  return (
    <Flex h="100vh" overflow="hidden">
      {/* Sidebar fixed */}
      <Sidebar />

      {/* Main content */}
      <Box flex="1" overflowY="auto">
        {/* Navbar fixed at top */}
        <Box position="sticky" top="0" zIndex="10">
          <Navbar />
        </Box>

        {/* Page content */}
        <Box p={5}>{children}</Box>
      </Box>
    </Flex>
  );
};

export default DashboardLayout;