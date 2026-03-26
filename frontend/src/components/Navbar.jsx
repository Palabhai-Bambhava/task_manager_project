import {
  Flex,
  Text,
  Avatar,
  IconButton,
  useColorMode,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
} from "@chakra-ui/react";
import { MoonIcon, SunIcon } from "@chakra-ui/icons";
import { useAuth } from "../context/AuthContext";
import { useProject } from "../context/ProjectContext";
import { useCompany } from "../context/CompanyContext";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import API from "../services/api";

const Navbar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { colorMode, toggleColorMode } = useColorMode();

  const { selectedProject, setSelectedProject } = useProject();
  const { selectedCompany, setSelectedCompany } = useCompany();

  const [projects, setProjects] = useState([]);
  const [companies, setCompanies] = useState([]);

  // =========================
  // ✅ FETCH COMPANIES (SUPERADMIN ONLY)
  // =========================
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await API.get("/companies");
        setCompanies(res.data);
      } catch (err) {
        console.error("Company Fetch Error:", err);
      }
    };

    if (user?.role === "superadmin") {
      fetchCompanies();
    }
  }, [user]);

  // =========================
  // ✅ FETCH PROJECTS (COMPANY BASED)
  // =========================
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        let url = "/projects";

        // ✅ if company selected → filter
        if (user?.role === "superadmin" && selectedCompany) {
          url = `/projects?company=${selectedCompany._id}`;
        }

        const res = await API.get(url);
        let filtered = res.data;

        // ✅ STAFF FILTER
        if (user?.role === "staff") {
          filtered = res.data.filter((project) =>
            project.assignedStaff?.some(
              (staff) => staff?._id?.toString() === user._id?.toString(),
            ),
          );
        }

        setProjects(filtered);

        // ✅ AUTO SELECT FOR STAFF
        if (!selectedProject && filtered.length > 0 && user?.role === "staff") {
          setSelectedProject(filtered[0]);
        }
      } catch (error) {
        console.error("Project Fetch Error:", error);
      }
    };

    if (user) fetchProjects();
  }, [user, selectedCompany]);

  useEffect(() => {
    setSelectedProject(null);
  }, [selectedCompany]);

  return (
    <Flex
      p={4}
      bg={colorMode === "light" ? "blue.500" : "blue.700"}
      color="white"
      align="center"
      justify="space-between"
      position="fixed"
      top="0"
      left={{ base: 0, md: "220px" }}
      right="0"
      zIndex="1000"
    >
      {/* LOGO */}
      <Text
        fontWeight="bold"
        cursor="pointer"
        onClick={() => navigate("/dashboard")}
      >
        Task Manager
      </Text>

      <Flex align="center" gap={3}>
        {/* ========================= */}
        {/* ✅ COMPANY DROPDOWN */}
        {/* ========================= */}
        {user?.role === "superadmin" && (
          <Menu>
            <MenuButton as={Button} colorScheme="whiteAlpha">
              {selectedCompany ? selectedCompany.name : "All Companies"}
            </MenuButton>
            <MenuList color="black">
              {/* ✅ ALL COMPANIES OPTION */}
              <MenuItem
                onClick={() => {
                  setSelectedCompany(null);
                  setSelectedProject(null);
                  navigate("/dashboard/tasks");
                }}
              >
                All Companies
              </MenuItem>

              {companies.map((company) => (
                <MenuItem
                  key={company._id}
                  onClick={() => {
                    setSelectedCompany(company);
                    setSelectedProject(null); // reset project
                  }}
                >
                  {company.name}
                </MenuItem>
              ))}
            </MenuList>
          </Menu>
        )}

        {/* ========================= */}
        {/* ✅ PROJECT DROPDOWN */}
        {/* ========================= */}
        <Menu>
          <MenuButton as={Button} colorScheme="whiteAlpha">
            {selectedProject ? selectedProject.name : "Projects"}
          </MenuButton>
          <MenuList color="black">
            <MenuItem
              onClick={() => {
                setSelectedProject(null);
                navigate("/dashboard/tasks");
              }}
            >
              All Projects
            </MenuItem>

            {projects.map((project) => (
              <MenuItem
                key={project._id}
                onClick={() => {
                  setSelectedProject(project);
                  navigate("/dashboard/tasks");
                }}
              >
                {project.name}
              </MenuItem>
            ))}
          </MenuList>
        </Menu>

        {/* THEME */}
        <IconButton
          size="sm"
          onClick={toggleColorMode}
          icon={colorMode === "light" ? <MoonIcon /> : <SunIcon />}
        />

        {/* PROFILE */}
        <Avatar
          size="sm"
          name={user?.name}
          cursor="pointer"
          onClick={() => navigate("/dashboard/profile")}
        />
      </Flex>
    </Flex>
  );
};

export default Navbar;
