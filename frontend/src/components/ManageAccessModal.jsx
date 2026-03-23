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
  Checkbox,
  Flex,
  VStack,
} from "@chakra-ui/react";
import { updateDocumentAccess } from "../services/api";

const ManageAccessModal = ({
  isOpen,
  onClose,
  documentData,
  refreshDocuments,
}) => {
  const [accessList, setAccessList] = useState([]);

  useEffect(() => {
    if (documentData) {
      const mappedAccess = documentData.access.map((a) => ({
        user: typeof a.user === "object" ? a.user._id : a.user,
        canView: a.canView || false,
        canEdit: a.canEdit || false,
      }));

      setAccessList(mappedAccess);
    }
  }, [documentData]);

  const handleToggle = (index, type) => {
    const updated = [...accessList];

    if (type === "canEdit") {
      updated[index].canEdit = !updated[index].canEdit;

      if (updated[index].canEdit) {
        updated[index].canView = true; // edit requires view
      }
    }

    if (type === "canView") {
      updated[index].canView = !updated[index].canView;

      if (!updated[index].canView) {
        updated[index].canEdit = false; // no view → no edit
      }
    }

    setAccessList(updated);
  };

  const handleSave = async () => {
    try {
      console.log("SENDING:", accessList);

      await updateDocumentAccess(documentData._id, accessList);

      refreshDocuments();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to update access");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Manage Access</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack align="stretch" spacing={2} maxH="300px" overflowY="auto">
            {accessList.map((userAccess, idx) => (
              <Flex
                key={userAccess.user?._id || userAccess.user}
                justify="space-between"
                align="center"
              >
                <span>{userAccess.user.name}</span>
                <Flex gap={2}>
                  <Checkbox
                    isChecked={userAccess.canView}
                    onChange={() => handleToggle(idx, "canView")}
                  >
                    View
                  </Checkbox>
                  <Checkbox
                    isChecked={userAccess.canEdit}
                    onChange={() => handleToggle(idx, "canEdit")}
                  >
                    Edit
                  </Checkbox>
                </Flex>
              </Flex>
            ))}
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={handleSave}>
            Save
          </Button>
          <Button onClick={onClose}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ManageAccessModal;
