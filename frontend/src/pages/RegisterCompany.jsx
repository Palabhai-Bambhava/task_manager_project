import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerCompany } from "../services/api";
import { useAuth } from "../context/AuthContext";
// import { useNavigate } from "react-router-dom";

import {
  Box,
  Input,
  Button,
  Heading,
  VStack,
  Text,
  FormControl,
  FormLabel,
  Flex,
  Divider,
} from "@chakra-ui/react";

const RegisterCompany = () => {
  const navigate = useNavigate();
  // const { login } = useAuth();
  const { setUser } = useAuth();

  const [form, setForm] = useState({
    companyName: "",
    address: "",
    phone: "",
    website: "",
    description: "",

    ownerName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.companyName || !form.ownerName || !form.email || !form.password) {
      setError("All required fields must be filled");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const { confirmPassword, ...cleanData } = form;

      // 1️⃣ Register company — backend now returns user object + sets cookie
      const res = await registerCompany(cleanData);

      // ✅ 2️⃣ Set user in AuthContext directly from registration response
      // No need to call login() separately — cookie is already set by backend
      setUser(res.data.user);

      // ✅ 3️⃣ Go to dashboard as logged in owner
      navigate("/dashboard");
    } catch (err) {
      console.log("ERROR:", err);
      setError(
        err.response?.data?.message || err.message || "Registration failed",
      );
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
        maxW="500px"
      >
        <Heading mb={6} textAlign="center">
          Company Registration
        </Heading>

        <form onSubmit={handleSubmit}>
          <VStack spacing={4}>
            <Text fontWeight="bold">Company Information</Text>

            <FormControl>
              <FormLabel>Company Name</FormLabel>
              <Input
                name="companyName"
                value={form.companyName}
                onChange={handleChange}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Address</FormLabel>
              <Input
                name="address"
                value={form.address}
                onChange={handleChange}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Phone</FormLabel>
              <Input name="phone" value={form.phone} onChange={handleChange} />
            </FormControl>

            <FormControl>
              <FormLabel>Website</FormLabel>
              <Input
                name="website"
                value={form.website}
                onChange={handleChange}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Description</FormLabel>
              <Input
                name="description"
                value={form.description}
                onChange={handleChange}
              />
            </FormControl>

            <Divider />

            <Text fontWeight="bold">Owner Information</Text>

            <FormControl>
              <FormLabel>Owner Name</FormLabel>
              <Input
                name="ownerName"
                value={form.ownerName}
                onChange={handleChange}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Email</FormLabel>
              <Input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Password</FormLabel>
              <Input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Confirm Password</FormLabel>
              <Input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
              />
            </FormControl>

            {error && (
              <Text color="red.500" fontSize="sm">
                {error}
              </Text>
            )}

            <Button
              type="submit"
              colorScheme="blue"
              w="full"
              isLoading={loading}
            >
              Register Company
            </Button>
          </VStack>
        </form>
      </Box>
    </Flex>
  );
};

export default RegisterCompany;
