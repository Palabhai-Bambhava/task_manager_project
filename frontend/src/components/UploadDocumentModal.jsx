import React, { useState, useEffect } from "react";
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
  Checkbox,
  Flex,
  VStack,
  useToast,
} from "@chakra-ui/react";
import { createDocument, getStaff } from "../services/api";
import { useProject } from "../context/ProjectContext";

const UploadDocumentModal = ({ isOpen, onClose, refreshDocuments }) => {
  const { selectedProject } = useProject();
  const [file, setFile] = useState(null);
  const [staffList, setStaffList] = useState([]);
  const [access, setAccess] = useState([]);
  const toast = useToast();

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const res = await getStaff(); // replace with your getStaff()
        const data = await res.json();
        setStaffList(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchStaff();
  }, []);

  const toggleAccess = (userId, type) => {
    const updated = [...access];
    const index = updated.findIndex((a) => a.user === userId);
    if (index > -1) updated[index][type] = !updated[index][type];
    else
      updated.push({
        user: userId,
        canView: type === "canView",
        canEdit: type === "canEdit",
      });
    setAccess(updated);
  };

  const handleUpload = async () => {
    if (!file)
      return toast({
        title: "Please select a file",
        status: "warning",
        duration: 3000,
      });
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "file");
      formData.append("name", file.name);
      formData.append("project", selectedProject._id);
      formData.append("access", JSON.stringify(access));

      await createDocument(formData);
      toast({ title: "File uploaded successfully", status: "success" });
      onClose();
      refreshDocuments();
    } catch (err) {
      console.error(err);
      toast({ title: "Upload failed", status: "error" });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Upload Document</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {/* Access Users */}
          <FormControl mb={3}>
            <FormLabel>Access Users</FormLabel>
            <VStack
              align="stretch"
              maxH="200px"
              overflowY="auto"
              border="1px solid #e2e8f0"
              p={2}
              borderRadius="md"
            >
              {staffList.map((staff) => {
                const userAccess = access.find((a) => a.user === staff._id) || {
                  canView: false,
                  canEdit: false,
                };
                return (
                  <Flex key={staff._id} justify="space-between" align="center">
                    <span>{staff.name}</span>
                    <Flex gap={2}>
                      <Checkbox
                        isChecked={userAccess.canView}
                        onChange={() => toggleAccess(staff._id, "canView")}
                      >
                        View
                      </Checkbox>
                      <Checkbox
                        isChecked={userAccess.canEdit}
                        onChange={() => toggleAccess(staff._id, "canEdit")}
                      >
                        Edit
                      </Checkbox>
                    </Flex>
                  </Flex>
                );
              })}
            </VStack>
          </FormControl>

          {/* File Upload */}
          <FormControl mb={3}>
            <FormLabel>Upload File</FormLabel>
            <Input type="file" onChange={(e) => setFile(e.target.files[0])} />
          </FormControl>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={handleUpload}>
            Upload
          </Button>
          <Button onClick={onClose}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default UploadDocumentModal;
