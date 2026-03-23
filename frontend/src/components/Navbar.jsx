import {
  Flex,
  Spacer,
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
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import API from "../services/api";

const Navbar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { colorMode, toggleColorMode } = useColorMode();
  const [projects, setProjects] = useState([]);
  const { selectedProject, setSelectedProject } = useProject();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await API.get("/projects");
        let filtered = res.data;

        if (user?.role === "staff") {
          filtered = res.data.filter(
            (project) =>
              Array.isArray(project.assignedStaff) &&
              project.assignedStaff.some(
                (staff) => staff?._id?.toString() === user.id?.toString(),
              ),
          );
        }

        setProjects(filtered);

        if (!selectedProject && filtered.length > 0 && user?.role === "staff") {
          setSelectedProject(filtered[0]);
        }
      } catch (error) {
        console.error("Project Fetch Error:", error);
      }
    };

    if (user) fetchProjects();
  }, [user]);

  return (
    <Flex
      p={4}
      bg={colorMode === "light" ? "blue.500" : "blue.700"}
      color="white"
      align="center"
      justify="space-between"
      flexWrap="nowrap"
      position="fixed"
      top="0"
      left={{ base: 0, md: "220px" }}
      right="0"
      zIndex="1000"
    >
      <Text
        fontWeight="bold"
        cursor="pointer"
        onClick={() => navigate("/dashboard")}
      >
        Task Manager
      </Text>

      <Flex align="center" gap={3} mt={{ base: 2, md: 0 }}>
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

        <IconButton
          size="sm"
          onClick={toggleColorMode}
          icon={colorMode === "light" ? <MoonIcon /> : <SunIcon />}
        />

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
