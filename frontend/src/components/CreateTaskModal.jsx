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
  Textarea,
  Select,
  useToast,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { createTask, getStaff, updateTask } from "../services/api";
import { useProject } from "../context/ProjectContext";

const CreateTaskModal = ({ isOpen, onClose, refreshTasks, editData }) => {
  const toast = useToast();
  const { selectedProject } = useProject();
  const [staffList, setStaffList] = useState([]);

  const [form, setForm] = useState({
    title: "",
    description: "",
    assignedTo: "",
    status: "pending",
  });

  // Load staff when modal opens
  useEffect(() => {
    if (isOpen) {
      getStaff()
        .then((res) => setStaffList(res.data))
        .catch((err) => console.error("Failed to load staff:", err));
    }
  }, [isOpen]);

  // Prefill form when editing
  useEffect(() => {
    if (editData) {
      setForm({
        title: editData.title || "",
        description: editData.description || "",
        assignedTo: editData.assignedTo?._id || "",
        status: editData.status || "pending",
      });
    } else {
      setForm({
        title: "",
        description: "",
        assignedTo: "",
        status: "pending",
      });
    }
  }, [editData]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      toast({ title: "Title is required", status: "error" });
      return;
    }

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      assignedTo: form.assignedTo,
      status: form.status,
      project: selectedProject._id, // Assign to selected project
    };

    try {
      if (editData) {
        await updateTask(editData._id, payload);
        toast({
          title: "Task updated successfully",
          status: "success",
          duration: 2000,
        });
      } else {
        await createTask(payload);
        toast({
          title: "Task created successfully",
          status: "success",
          duration: 2000,
        });
      }

      refreshTasks();
      onClose();

      // Reset form
      setForm({
        title: "",
        description: "",
        assignedTo: "",
        status: "pending",
      });
    } catch (error) {
      console.error(
        "Error saving task:",
        error.response?.data || error.message,
      );
      toast({ title: "Error saving task", status: "error" });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{editData ? "Edit Task" : "Create Task"}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {/* Title */}
          <FormControl mb={3} isRequired>
            <FormLabel>Title</FormLabel>
            <Input name="title" value={form.title} onChange={handleChange} />
          </FormControl>

          {/* Description */}
          <FormControl mb={3}>
            <FormLabel>Description</FormLabel>
            <Textarea
              name="description"
              value={form.description}
              onChange={handleChange}
            />
          </FormControl>

          {/* Assign To */}
          <FormControl mb={3}>
            <FormLabel>Assign To</FormLabel>
            <Select
              name="assignedTo"
              value={form.assignedTo}
              onChange={handleChange}
            >
              <option value="">Select Staff</option>
              {staffList.map((staff) => (
                <option key={staff._id} value={staff._id}>
                  {staff.name}
                </option>
              ))}
            </Select>
          </FormControl>

          {/* Status */}
          <FormControl mb={3}>
            <FormLabel>Status</FormLabel>
            <Select name="status" value={form.status} onChange={handleChange}>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
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

export default CreateTaskModal;
