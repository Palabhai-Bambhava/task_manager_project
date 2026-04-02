import {
  Box,
  Text,
  Input,
  Button,
  Checkbox,
  Flex,
  Heading,
  Card,
  CardBody,
  HStack,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from "@chakra-ui/react";

import { useEffect, useState } from "react";
import { getRoles, updateRole, deleteRole, createRole } from "../services/api";
import TableComponent from "../components/TableComponent";
import { useAuth } from "../context/AuthContext";

const RolePage = () => {
  const { user, loading } = useAuth();
  const toast = useToast();

  const [roles, setRoles] = useState([]);
  const [newRole, setNewRole] = useState("");
  const [search, setSearch] = useState("");

  const [isOpen, setIsOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);

  if (user?.role !== "superadmin") return null;

  // FETCH ROLES
  const fetchRoles = async () => {
    try {
      const res = await getRoles();
      setRoles(res.data);
    } catch {
      toast({ title: "Failed to load roles", status: "error" });
    }
  };

  useEffect(() => {
    if (loading) return; // ⛔ wait

    if (user?.role !== "superadmin") return;

    fetchRoles();
  }, [user, loading]);

  // FILTER
  const filteredRoles = roles.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase()),
  );

  // TABLE DATA
  const tableData = filteredRoles.map((role) => ({
    _id: role._id,
    Role: role.name,
    Status: role.isActive ? "Active" : "Inactive",
  }));

  // CREATE ROLE
  const handleCreateRole = async () => {
    if (!newRole) {
      toast({ title: "Role name required", status: "warning" });
      return;
    }

    try {
      await createRole({
        name: newRole,
        permissions: {
          create: false,
          read: true,
          update: false,
          delete: false,
        },
      });

      setNewRole("");
      fetchRoles();
      toast({ title: "Role created", status: "success" });
    } catch {
      toast({ title: "Role creation failed", status: "error" });
    }
  };

  // DELETE
  const handleDeleteRole = async (id) => {
    const role = roles.find((r) => r._id === id);

    if (role.name === "superadmin") {
      toast({ title: "Superadmin cannot be deleted", status: "warning" });
      return;
    }

    if (!window.confirm("Delete this role?")) return;

    await deleteRole(id);
    setRoles((prev) => prev.filter((r) => r._id !== id));

    toast({ title: "Role deleted", status: "success" });
  };

  // OPEN EDIT
  const openEditModal = (id) => {
    const role = roles.find((r) => r._id === id);
    setSelectedRole(role);
    setIsOpen(true);
  };

  // SAVE EDIT
  const handleSave = async () => {
    try {
      await updateRole(selectedRole._id, {
        permissions: selectedRole.permissions,
        isActive: selectedRole.isActive,
      });

      toast({ title: "Role updated", status: "success" });

      setIsOpen(false);
      fetchRoles();
    } catch {
      toast({ title: "Update failed", status: "error" });
    }
  };

  return (
    <Box>
      <Heading size="lg" mb={6}>
        Role Management
      </Heading>

      <Card>
        <CardBody>
          {/* SEARCH + CREATE */}
          <Flex justify="space-between" mb={5} wrap="wrap" gap={3}>
            <Input
              placeholder="Search role..."
              maxW="250px"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <HStack>
              <Input
                placeholder="New role"
                width="180px"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
              />

              {user?.role === "superadmin" && (
                <Button colorScheme="blue" onClick={handleCreateRole}>
                  + Create
                </Button>
              )}
            </HStack>
          </Flex>

          {/* TABLE */}
          <TableComponent
            columns={["Role", "Status", "Action"]}
            data={tableData}
            renderCell={(row, column) => {
              if (column === "Role") {
                return (
                  <Text fontWeight="semibold" color="gray.800">
                    {row[column] || "-"}
                  </Text>
                );
              }
              if (column === "Status") {
                return (
                  <Text
                    color={row.Status === "Active" ? "green.500" : "red.500"}
                  >
                    {row.Status}
                  </Text>
                );
              }

              if (column === "Action") {
                return (
                  user?.role === "superadmin" && (
                    <HStack>
                      <Button
                        size="sm"
                        colorScheme="blue"
                        variant="outline"
                        _hover={{ bg: "blue.50" }}
                        onClick={() => onEdit(row)}
                      >
                        ✏️
                      </Button>

                      <Button
                        size="sm"
                        colorScheme="red"
                        variant="outline"
                        _hover={{ bg: "red.50" }}
                        onClick={() => onDelete(row._id)}
                      >
                        🗑️
                      </Button>
                    </HStack>
                  )
                );
              }

              return row[column];
            }}
          />
        </CardBody>
      </Card>

      {/* EDIT MODAL */}
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Role</ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            {/* STATUS */}
            <Checkbox
              isChecked={selectedRole?.isActive}
              onChange={(e) =>
                setSelectedRole({
                  ...selectedRole,
                  isActive: e.target.checked,
                })
              }
            >
              Active
            </Checkbox>

            {/* PERMISSIONS */}
            <Heading size="sm" mt={4}>
              Permissions
            </Heading>

            {["create", "read", "update", "delete"].map((perm) => (
              <Checkbox
                key={perm}
                isChecked={selectedRole?.permissions?.[perm]}
                onChange={(e) =>
                  setSelectedRole({
                    ...selectedRole,
                    permissions: {
                      ...selectedRole.permissions,
                      [perm]: e.target.checked,
                    },
                  })
                }
              >
                {perm}
              </Checkbox>
            ))}
          </ModalBody>

          <ModalFooter>
            <Button mr={3} onClick={() => setIsOpen(false)}>
              Cancel
            </Button>

            <Button colorScheme="blue" onClick={handleSave}>
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default RolePage;
