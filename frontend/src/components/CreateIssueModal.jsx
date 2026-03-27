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
import { createIssue, updateIssue, getStaff } from "../services/api";
import { useProject } from "../context/ProjectContext";
import { useCompany } from "../context/CompanyContext";

const CreateIssueModal = ({ isOpen, onClose, refreshIssues, editData }) => {
  const toast = useToast();
  const { selectedProject } = useProject();
  const { selectedCompany } = useCompany();
  const [staffList, setStaffList] = useState([]);

  const defaultForm = {
    title: "",
    description: "",
    assignedTo: "",
    priority: "Medium",
    status: "open",
  };
  const [form, setForm] = useState(defaultForm);

  useEffect(() => {
    if (isOpen && !editData) {
      setForm(defaultForm);
    }
  }, [isOpen, editData]);

  useEffect(() => {
    if (isOpen) {
      getStaff(selectedCompany?._id)
        .then((res) => setStaffList(res.data))
        .catch((err) => console.error(err));
    }
  }, [isOpen, selectedCompany]);

  useEffect(() => {
    if (editData) {
      setForm({
        title: editData.title,
        description: editData.description,
        assignedTo: editData.assignedTo?._id || "",
        priority: editData.priority || "Medium",
        status: editData.status || "open",
      });
    }
  }, [editData]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleClose = () => {
    setForm(defaultForm);
    onClose();
  };

  const handleSubmit = async () => {
    const projectId = editData ? editData.project?._id : selectedProject?._id;

    if (!projectId) {
      toast({
        title: "Please select project first",
        status: "error",
      });
      return;
    }

    const payload = {
      ...form,
      project: projectId,
    };

    try {
      if (editData) {
        await updateIssue(editData._id, payload);
      } else {
        await createIssue(payload);
      }

      refreshIssues();
      setForm(defaultForm);
      onClose();

      toast({
        title: editData ? "Issue updated" : "Issue created",
        status: "success",
      });
    } catch (err) {
      toast({ title: "Error saving issue", status: "error" });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{editData ? "Edit Issue" : "Create Issue"}</ModalHeader>
        <ModalCloseButton onClose={handleClose} />

        <ModalBody>
          <FormControl mb={3}>
            <FormLabel>Title</FormLabel>
            <Input name="title" value={form.title} onChange={handleChange} />
          </FormControl>

          <FormControl mb={3}>
            <FormLabel>Description</FormLabel>
            <Textarea
              name="description"
              value={form.description}
              onChange={handleChange}
            />
          </FormControl>

          <FormControl mb={3}>
            <FormLabel>Assign To</FormLabel>
            <Select
              name="assignedTo"
              value={form.assignedTo}
              onChange={handleChange}
            >
              <option value="">Select Staff</option>
              {staffList.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </Select>
          </FormControl>

          <FormControl mb={3}>
            <FormLabel>Priority</FormLabel>
            <Select
              name="priority"
              value={form.priority}
              onChange={handleChange}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </Select>
          </FormControl>
          <FormControl mb={3}>
            <FormLabel>Status</FormLabel>
            <Select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option value="open">Open</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </Select>
          </FormControl>
        </ModalBody>

        <ModalFooter>
          <Button colorScheme="blue" onClick={handleSubmit}>
            {editData ? "Update" : "Create"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CreateIssueModal;
