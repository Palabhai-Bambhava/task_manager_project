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
  CheckboxGroup,
  Checkbox,
  Stack,
} from "@chakra-ui/react";

import { useState, useEffect } from "react";
import API from "../services/api";

const CreateProjectModal = ({
  isOpen,
  onClose,
  refreshProjects,
  editData,
  onProjectCreated,
}) => {
  const toast = useToast();
  const [staffList, setStaffList] = useState([]);

  const [form, setForm] = useState({
    name: "",
    status: "Pending",
    assignedStaff: [],
  });

  // Fetch staff list
  useEffect(() => {
    if (isOpen) {
      API.get("/staff")
        .then((res) => setStaffList(res.data))
        .catch((err) => console.error(err));
    }
  }, [isOpen]);

  // Prefill edit data
  useEffect(() => {
    if (editData) {
      setForm({
        name: editData.name || "",
        status: editData.status || "Pending",
        assignedStaff: editData.assignedStaff?.map((s) => s._id) || [],
      });
    } else {
      setForm({
        name: "",
        status: "Pending",
        assignedStaff: [],
      });
    }
  }, [editData]);

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      toast({
        title: "Project name is required",
        status: "error",
      });
      return;
    }

    const payload = {
      name: form.name.trim(),
      status: form.status,
      assignedStaff: form.assignedStaff,
    };

    try {
      if (editData) {
        await API.put(`/projects/${editData._id}`, payload);
        toast({ title: "Project updated", status: "success" });
      } else {
        const res = await API.post("/projects", payload);
        toast({ title: "Project created", status: "success" });

        // ✅ Auto-select newly created project
        if (onProjectCreated) onProjectCreated(res.data);
      }

      refreshProjects();
      onClose();
    } catch (error) {
      console.error(error.response?.data || error.message);
      toast({
        title: "Error saving project",
        status: "error",
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />

      <ModalContent>
        <ModalHeader>
          {editData ? "Edit Project" : "Create Project"}
        </ModalHeader>

        <ModalCloseButton />

        <ModalBody>
          {/* Project Name */}
          <FormControl mb={3} isRequired>
            <FormLabel>Project Name</FormLabel>
            <Input
              name="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </FormControl>

          {/* Status */}
          <FormControl mb={3}>
            <FormLabel>Status</FormLabel>
            <Select
              name="status"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </Select>
          </FormControl>

          {/* Assign Staff */}
          <FormControl mb={3}>
            <FormLabel>Assign Staff</FormLabel>

            <CheckboxGroup
              value={form.assignedStaff}
              onChange={(values) => setForm({ ...form, assignedStaff: values })}
            >
              <Stack spacing={2} maxH="150px" overflowY="auto">
                {staffList.map((staff) => (
                  <Checkbox key={staff._id} value={staff._id}>
                    {staff.name}
                  </Checkbox>
                ))}
              </Stack>
            </CheckboxGroup>
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

export default CreateProjectModal;
