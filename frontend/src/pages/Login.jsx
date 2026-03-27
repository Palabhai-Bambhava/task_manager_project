import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import {
  Box,
  Input,
  Button,
  Heading,
  VStack,
  Text,
  FormControl,
  FormLabel,
  InputGroup,
  InputRightElement,
  Flex,
} from "@chakra-ui/react";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!email || !password) {
      setError("Email and Password are required");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await login(email, password);

      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Flex minH="100vh" align="center" justify="center" bg="gray.100">
      <Box
        bg="white"
        p={8}
        borderRadius="lg"
        boxShadow="lg"
        w="100%"
        maxW="400px"
      >
        <Heading mb={6} textAlign="center">
          Login
        </Heading>

        <form onSubmit={handleSubmit}>
          <VStack spacing={4}>
            {/* Email */}
            <FormControl>
              <FormLabel>Email</FormLabel>
              <Input
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </FormControl>
            {/* Password */}
            <FormControl>
              <FormLabel>Password</FormLabel>

              <InputGroup>
                <Input
                  type={show ? "text" : "password"}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />

                <InputRightElement width="4.5rem">
                  <Button h="1.75rem" size="sm" onClick={() => setShow(!show)}>
                    {show ? "Hide" : "Show"}
                  </Button>
                </InputRightElement>
              </InputGroup>
            </FormControl>
            {/* Error */}
            {error && (
              <Text color="red.500" fontSize="sm">
                {error}
              </Text>
            )}
            {/* Login Button */}
            <Button
              colorScheme="blue"
              type="submit"
              w="full"
              isLoading={loading}
            >
              Login
            </Button>
            
            <Text fontSize="sm" textAlign="center">
              Don't have a company?{" "}
              <Link to="/register-company">
                <Text as="span" color="blue.500">
                  Register Company
                </Text>
              </Link>
            </Text>
          </VStack>
        </form>
      </Box>
    </Flex>
  );
};

export default Login;
