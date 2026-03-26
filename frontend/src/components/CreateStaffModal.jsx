import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  useToast,
} from "@chakra-ui/react";

import { useState, useEffect } from "react";
import { createStaff, updateStaff, getRoles } from "../services/api";
import { useAuth } from "../context/AuthContext";

const CreateStaffModal = ({ isOpen, onClose, refreshStaff, editData }) => {
  const toast = useToast();
  const [roles, setRoles] = useState([]);
  const { user } = useAuth(); // ✅ correct user source

  const fetchRoles = async () => {
    try {
      const res = await getRoles();
      setRoles(res.data);
    } catch (err) {
      console.error("Failed to fetch roles");
    }
  };

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "staff",
    isActive: true,
  });

  // ✅ Prefill form when editing
  useEffect(() => {
    if (editData) {
      setForm({
        name: editData.name || "",
        email: editData.email || "",
        phone: editData.phone || "",
        password: "",
        role: editData.role || "staff",
        isActive: editData.isActive,
      });
    } else {
      setForm({
        name: "",
        email: "",
        phone: "",
        password: "",
        role: "staff",
        isActive: true,
      });
    }
  }, [editData]);
  useEffect(() => {
    if (isOpen) {
      fetchRoles();
    }
  }, [isOpen]);

  // ✅ Handle Input Change
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Phone validation
    if (name === "phone") {
      if (!/^\d*$/.test(value)) return;
      if (value.length > 10) return;
    }

    if (name === "isActive") {
      setForm({ ...form, isActive: value === "true" });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  // ✅ Submit Form
  const handleSubmit = async () => {
    try {
      if (!form.name || !form.email) {
        toast({
          title: "Name and Email are required",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      // if (!editData && !form.password) {
      //   toast({
      //     title: "Password is required",
      //     status: "error",
      //     duration: 3000,
      //     isClosable: true,
      //   });
      //   return;
      // }

      if (form.phone && form.phone.length !== 10) {
        toast({
          title: "Phone number must be exactly 10 digits",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      if (editData) {
        await updateStaff(editData._id, form);

        toast({
          title: "User updated successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        await createStaff(form);

        toast({
          title: "User created successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }

      refreshStaff();
      onClose();

      setForm({
        name: "",
        email: "",
        phone: "",
        password: "",
        role: "staff",
        isActive: true,
      });
    } catch (err) {
      console.error(err);

      toast({
        title: err.response?.data?.message || "Error saving user",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />

      <ModalContent>
        <ModalHeader>{editData ? "Edit User" : "Create Staff"}</ModalHeader>

        <ModalCloseButton />

        <ModalBody>
          {/* Name */}
          <FormControl mb={3}>
            <FormLabel>Name</FormLabel>
            <Input name="name" value={form.name} onChange={handleChange} />
          </FormControl>

          {/* Email */}
          <FormControl mb={3}>
            <FormLabel>Email</FormLabel>
            <Input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
            />
          </FormControl>

          {/* Phone */}
          <FormControl mb={3}>
            <FormLabel>Phone</FormLabel>
            <Input
              type="text"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              maxLength={10}
            />
          </FormControl>

          {/* Password
          {!editData && (
            <FormControl mb={3}>
              <FormLabel>Password</FormLabel>
              <Input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
              />
            </FormControl>
          )} */}

          {/* Role */}
          <FormControl mb={3}>
            <FormLabel>Role</FormLabel>
            <Select name="role" value={form.role} onChange={handleChange}>
              {roles.length === 0 ? (
                <option value="staff">staff</option>
              ) : (
                roles.map((r) => (
                  <option key={r._id} value={r.name}>
                    {r.name}
                  </option>
                ))
              )}
            </Select>
          </FormControl>

          {/* Status */}
          <FormControl mb={3}>
            <FormLabel>Status</FormLabel>

            <Select
              name="isActive"
              value={form.isActive ? "true" : "false"}
              onChange={handleChange}
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </Select>
          </FormControl>
        </ModalBody>

        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={handleSubmit}>
            {editData ? "Update" : "Create"}
          </Button>

          <Button onClick={onClose}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CreateStaffModal;
