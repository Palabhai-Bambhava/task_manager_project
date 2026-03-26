import {
  Box,
  VStack,
  HStack,
  Text,
  Icon,
  IconButton,
  useDisclosure,
  Drawer,
  DrawerBody,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useColorModeValue,
} from "@chakra-ui/react";
import { NavLink } from "react-router-dom";
import {
  MdDashboard,
  MdPeople,
  MdTask,
  MdSecurity,
  MdFolder,
  MdBugReport,
  MdDescription,
  MdMenu,
   MdBusiness,
   MdSubscriptions,
} from "react-icons/md";
import { useAuth } from "../context/AuthContext";

const links = [
  { path: "/dashboard", label: "Dashboard", icon: MdDashboard },
  { path: "/dashboard/staff", label: "Staff", icon: MdPeople },
  { path: "/dashboard/tasks", label: "Tasks", icon: MdTask },
  { path: "/dashboard/roles", label: "Roles", icon: MdSecurity },
  { path: "/dashboard/projects", label: "Project", icon: MdFolder },
  { path: "/dashboard/issues", label: "Issue", icon: MdBugReport },
  { path: "/dashboard/documents", label: "Document", icon: MdDescription },
  { path: "/dashboard/company", label: "Company", icon: MdBusiness },
  { path: "/dashboard/subscription", label: "Subscription", icon: MdSubscriptions },
];

const SidebarContent = ({ onClose }) => {
  const bg = useColorModeValue("gray.100", "gray.900");
  const hoverBg = useColorModeValue("blue.100", "blue.700");
  const textColor = useColorModeValue("black", "white");

  return (
    <VStack align="start" spacing={3} w="full" p={5}>
      {links.map((link) => (
        <NavLink
          key={link.path}
          to={link.path}
          style={({ isActive }) => ({
            width: "100%",
            textDecoration: "none",
            color: isActive ? "#2B6CB0" : textColor,
            fontWeight: isActive ? "bold" : "normal",
          })}
          onClick={onClose} // mobile drawer close
        >
          <HStack
            spacing={3}
            p={2}
            borderRadius="md"
            transition="all 0.2s"
            _hover={{ bg: hoverBg, transform: "translateX(4px)" }}
          >
            <Icon as={link.icon} boxSize={5} color={textColor} />
            <Text fontWeight="medium" color={textColor}>
              {link.label}
            </Text>
          </HStack>
        </NavLink>
      ))}
    </VStack>
  );
};

const Sidebar = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const bg = useColorModeValue("gray.100", "gray.900");

  return (
    <>
      {/* Hamburger button for mobile */}
      <IconButton
        aria-label="Open Menu"
        icon={<MdMenu />}
        display={{ base: "inline-flex", md: "none" }}
        m={2}
        onClick={onOpen}
      />

      {/* Desktop Sidebar */}
      <Box
        display={{ base: "none", md: "block" }}
        w="220px"
        h="100vh"
        position="fixed"
        bg={bg}
        transition="background-color 0.3s"
      >
        <SidebarContent />
      </Box>

      {/* Mobile Drawer */}
      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent bg={bg} transition="background-color 0.3s">
          <DrawerCloseButton />
          <DrawerBody p={0}>
            <SidebarContent onClose={onClose} />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default Sidebar;