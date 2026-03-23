import {
  Box,
  Text,
  Avatar,
  VStack,
  Button,
  Flex,
  Card,
  CardBody,
  Heading,
  Badge,
  Divider,
  HStack
} from "@chakra-ui/react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <Flex justify="center" align="center" p={8}>
      <Card maxW="500px" w="100%" shadow="lg" borderRadius="lg">
        <CardBody>

          <VStack spacing={5} align="center">

            {/* Avatar */}
            <Avatar size="2xl" name={user?.name} />

            {/* Name */}
            <Heading size="md">{user?.name}</Heading>

            {/* Role */}
            <Badge colorScheme="blue" fontSize="0.9em" px={3} py={1}>
              {user?.role}
            </Badge>

            <Divider />

            {/* Info */}
            <Box w="100%">
              <Text fontWeight="bold">Email</Text>
              <Text color="gray.500">{user?.email}</Text>
            </Box>

            <Divider />

            {/* Buttons */}
            <HStack spacing={4} pt={2}>
              <Button
                colorScheme="blue"
                onClick={() => navigate("/dashboard")}
              >
                Back to Dashboard
              </Button>

              <Button colorScheme="red" onClick={logout}>
                Logout
              </Button>
            </HStack>

          </VStack>

        </CardBody>
      </Card>
    </Flex>
  );
};

export default ProfilePage;