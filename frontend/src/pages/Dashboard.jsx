import { Box, Text, SimpleGrid, Flex } from "@chakra-ui/react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { useEffect, useState } from "react";
import {
  getStaff,
  getTasks,
  getCompanies,
  getProjects,
  getIssues,
  getDocuments,
  getPlans,
} from "../services/api";
import { Outlet, useLocation } from "react-router-dom";

const Dashboard = () => {
  const location = useLocation();
  const [staff, setStaff] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [projects, setProjects] = useState([]);
  const [issues, setIssues] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [plans, setPlans] = useState([]);

  useEffect(() => {
    if (location.pathname === "/dashboard") {
      getStaff().then((res) => setStaff(res.data)).catch(console.error);
      getTasks().then((res) => setTasks(res.data)).catch(console.error);
      getCompanies().then((res) => setCompanies(res.data)).catch(console.error);
      getProjects().then((res) => setProjects(res.data)).catch(console.error);
      getIssues().then((res) => setIssues(res.data)).catch(console.error);
      getDocuments().then((res) => setDocuments(res.data)).catch(console.error);
      getPlans().then((res) => setPlans(res.data)).catch(console.error);
    }
  }, [location.pathname]);

  const totalStaff = staff.length;
  const activeUsers = staff.filter((s) => s.isActive).length;
  const totalTasks = tasks.length;
  const totalCompanies = companies.length;
  const totalProjects = projects.length;
  const totalIssues = issues.length;
  const totalDocuments = documents.length;
  const totalPlans = plans.length;

  const isDashboardPage = location.pathname === "/dashboard";

  return (
    <Flex h="100vh" overflow="hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Right Side */}
      <Box
        flex="1"
        ml={{ base: 0, md: "220px" }}
        display="flex"
        flexDirection="column"
      >
        {/* Navbar */}
        <Navbar />

        {/* Scrollable Content */}
        <Box flex="1" overflowY="auto" p={5} mt="70px">
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
                  <Text>Active Users</Text>
                  <Text fontSize="2xl">{activeUsers}</Text>
                </Box>

                <Box p={5} shadow="md" borderWidth="1px" borderRadius="md">
                  <Text>Total Tasks</Text>
                  <Text fontSize="2xl">{totalTasks}</Text>
                </Box>

                <Box p={5} shadow="md" borderWidth="1px" borderRadius="md">
                  <Text>Total Companies</Text>
                  <Text fontSize="2xl">{totalCompanies}</Text>
                </Box>

                <Box p={5} shadow="md" borderWidth="1px" borderRadius="md">
                  <Text>Total Projects</Text>
                  <Text fontSize="2xl">{totalProjects}</Text>
                </Box>

                <Box p={5} shadow="md" borderWidth="1px" borderRadius="md">
                  <Text>Total Issues</Text>
                  <Text fontSize="2xl">{totalIssues}</Text>
                </Box>

                <Box p={5} shadow="md" borderWidth="1px" borderRadius="md">
                  <Text>Total Documents</Text>
                  <Text fontSize="2xl">{totalDocuments}</Text>
                </Box>

                <Box p={5} shadow="md" borderWidth="1px" borderRadius="md">
                  <Text>Total Plans</Text>
                  <Text fontSize="2xl">{totalPlans}</Text>
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