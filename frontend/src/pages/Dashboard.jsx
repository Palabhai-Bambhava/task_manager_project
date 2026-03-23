import { Box, Text, SimpleGrid, Flex } from "@chakra-ui/react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { useEffect, useState } from "react";
import { getStaff, getTasks } from "../services/api";
import { Outlet, useLocation } from "react-router-dom";

const Dashboard = () => {
  const location = useLocation();
  const [staff, setStaff] = useState([]);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    if (location.pathname === "/dashboard") {
      getStaff().then((res) => setStaff(res.data)).catch(console.error);
      getTasks().then((res) => setTasks(res.data)).catch(console.error);
    }
  }, [location.pathname]);

  const totalStaff = staff.length;
  const activeUsers = staff.filter((s) => s.isActive).length;
  const totalTasks = tasks.length;
  const isDashboardPage = location.pathname === "/dashboard";

 return (
  <Flex h="100vh" overflow="hidden">
    {/* Sidebar */}
    <Sidebar />

    {/* Right Side */}
    <Box flex="1" ml={{ base: 0, md: "220px" }} display="flex" flexDirection="column">

      {/* Navbar */}
      <Navbar />

      {/* Scrollable Content */}
      <Box flex="1" overflowY="auto" p={5}  mt="70px">
        {isDashboardPage && (
          <>
            <Text fontSize="2xl" mb={5}>
              Dashboard
            </Text>

            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={5} mb={5}>
              <Box p={5} shadow="md" borderWidth="1px" borderRadius="md">
                <Text>Total Staff</Text>
                <Text fontSize="2xl">{totalStaff}</Text>
              </Box>

              <Box p={5} shadow="md" borderWidth="1px" borderRadius="md">
                <Text>Total Tasks</Text>
                <Text fontSize="2xl">{totalTasks}</Text>
              </Box>

              <Box p={5} shadow="md" borderWidth="1px" borderRadius="md">
                <Text>Active Users</Text>
                <Text fontSize="2xl">{activeUsers}</Text>
              </Box>
            </SimpleGrid>
          </>
        )}

        <Outlet />
      </Box>

    </Box>
  </Flex>
);
};

export default Dashboard;