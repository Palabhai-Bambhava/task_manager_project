import { Box, Text, SimpleGrid, Flex, HStack, Icon } from "@chakra-ui/react";
import {
  MdPeople,
  MdCheckCircle,
  MdBusiness,
  MdFolder,
  MdWarning,
  MdDescription,
  MdAttachMoney,
} from "react-icons/md";

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
      getStaff()
        .then((res) => setStaff(res.data))
        .catch(console.error);
      getTasks()
        .then((res) => setTasks(res.data))
        .catch(console.error);
      getCompanies()
        .then((res) => setCompanies(res.data))
        .catch(console.error);
      getProjects()
        .then((res) => setProjects(res.data))
        .catch(console.error);
      getIssues()
        .then((res) => setIssues(res.data))
        .catch(console.error);
      getDocuments()
        .then((res) => setDocuments(res.data))
        .catch(console.error);
      getPlans()
        .then((res) => setPlans(res.data))
        .catch(console.error);
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

  const stats = [
    { label: "Total Staff", value: totalStaff, icon: MdPeople },
    { label: "Active Users", value: activeUsers, icon: MdCheckCircle },
    { label: "Total Companies", value: totalCompanies, icon: MdBusiness },
    { label: "Total Projects", value: totalProjects, icon: MdFolder },
    { label: "Total Issues", value: totalIssues, icon: MdWarning },
    { label: "Total Documents", value: totalDocuments, icon: MdDescription },
    { label: "Total Plans", value: totalPlans, icon: MdAttachMoney },
  ];

  return (
    <Flex h="100vh" overflow="hidden" bg="gray.50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <Box
        flex="1"
        ml={{ base: 0, md: "220px" }}
        display="flex"
        flexDirection="column"
      >
        <Navbar />

        {/* Scrollable Content */}
        <Box flex="1" overflowY="auto" p={6} mt="70px">
          {isDashboardPage && (
            <>
              <Text fontSize="2xl" fontWeight="bold" mb={6}>
                Dashboard
              </Text>

              <SimpleGrid columns={{ base: 1, md: 3, lg: 4 }} spacing={6}>
                {stats.map((stat, index) => (
                  <Flex
                    key={stat.label}
                    bg="white"
                    _dark={{ bg: "gray.700" }}
                    p={5}
                    borderRadius="lg"
                    shadow="md"
                    transition="all 0.2s"
                    _hover={{ transform: "translateY(-5px)", shadow: "xl" }}
                  >
                    <HStack spacing={3}>
                      <Icon as={stat.icon} boxSize={8} color={stat.color} />
                      
                      <Box>
                        <Text fontSize="sm" color="gray.500" _dark={{ color: "gray.300" }}>
                          {stat.label}
                        </Text>
                        <Text fontSize="2xl" fontWeight="bold" >
                          {stat.value}
                        </Text>
                      </Box>
                    </HStack>
                  </Flex>
                ))}
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
