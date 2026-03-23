import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  useToast,
} from "@chakra-ui/react";

import { useState } from "react";
import { bulkUploadIssues } from "../services/api";
import { useProject } from "../context/ProjectContext";

const BulkIssueModal = ({ isOpen, onClose, refreshIssues }) => {
  const [file, setFile] = useState(null);
  const toast = useToast();
  const { selectedProject } = useProject();
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    if (!selectedFile) return;

    // ✅ File size check (100MB)
    if (selectedFile.size > 100 * 1024 * 1024) {
      toast({
        title: "File too large (Max 100MB)",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!selectedProject) {
      toast({
        title: "Please select project first",
        status: "error",
      });
      return;
    }
    if (!file) {
      toast({
        title: "Please select CSV file",
        status: "error",
      });
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("project", selectedProject?._id);

    try {
      const res = await bulkUploadIssues(formData);

      toast({
        title: `${res.data.totalInserted} issues uploaded`,
        status: "success",
      });

      refreshIssues();
      onClose();
    } catch (error) {
      toast({
        title: "Bulk upload failed",
        status: "error",
      });
    }
    setUploading(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />

      <ModalContent>
        <ModalHeader>Bulk Upload Issues</ModalHeader>

        <ModalBody>
          <Input type="file" accept=".csv" onChange={handleFileChange} />
        </ModalBody>

        <ModalFooter>
          <Button
            colorScheme="blue"
            onClick={handleUpload}
            isLoading={uploading}
          >
            Upload
          </Button>

          <Button ml={3} onClick={onClose}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default BulkIssueModal;
