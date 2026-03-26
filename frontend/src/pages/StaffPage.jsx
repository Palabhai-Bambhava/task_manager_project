import React, { useEffect, useState } from "react";
import TableComponent from "../components/TableComponent";
import SearchAndFilter from "../components/SearchAndFilter";
import { useAuth } from "../context/AuthContext";
import Pagination from "../components/Pagination";
import { getStaff, deleteStaff as deleteStaffAPI } from "../services/api";
import {
  Box,
  Button,
  Heading,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import CreateStaffModal from "../components/CreateStaffModal";
import { useCompany } from "../context/CompanyContext";
import { useProject } from "../context/ProjectContext";

const StaffPage = () => {
  const { user } = useAuth();
  const [staff, setStaff] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [editingStaff, setEditingStaff] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { selectedCompany } = useCompany();
  const { selectedProject } = useProject();
  const toast = useToast();
  // const itemsPerPage = 5;

  // ✅ Fetch staff from backend
  const fetchStaff = async () => {
    try {
      const res = await getStaff(selectedCompany?._id);
      setStaff(res.data);
    } catch (err) {
      console.error(err);
      toast({
        title: "Error fetching staff",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  useEffect(() => {
    fetchStaff();
  }, [selectedCompany]);

  // ✅ Filter logic
  // ✅ Filter logic (FINAL CLEAN VERSION)
  let filteredStaff = [...staff];

  // 1️⃣ Company filter
  if (selectedCompany) {
    filteredStaff = filteredStaff.filter(
      (s) => s.company?._id?.toString() === selectedCompany?._id?.toString(),
    );
  }

  // 2️⃣ Project filter (optional - agar field hai to hi chalega)
  if (selectedProject) {
    filteredStaff = filteredStaff.filter(
      (s) => s.project?._id?.toString() === selectedProject?._id?.toString(),
    );
  }

  // 3️⃣ Search filter
  if (search) {
    filteredStaff = filteredStaff.filter((s) =>
      s.name.toLowerCase().includes(search.toLowerCase()),
    );
  }

  // 4️⃣ Status filter
  if (status !== "All") {
    filteredStaff = filteredStaff.filter((s) =>
      status === "Active" ? s.isActive : !s.isActive,
    );
  }

  // 5️⃣ Map for table
  filteredStaff = filteredStaff.map((u, index) => ({
    _id: u._id,
    "#": index + 1,
    Name: u.name,
    Email: u.email,
    Phone: u.phone || "-",
    Role: u.role,
    Status: u.isActive ? "Active" : "Inactive",
    original: u,
  }));

  useEffect(() => {
    setCurrentPage(1);
  }, [search, status, selectedCompany, selectedProject]);

  // ✅ Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentStaff = filteredStaff.slice(indexOfFirstItem, indexOfLastItem);

  // ✅ Edit
  const handleEdit = (row) => {
    const originalStaff = staff.find((s) => s._id === row._id);
    setEditingStaff(originalStaff);
    onOpen();
  };

  // ✅ Delete
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      await deleteStaffAPI(id);
      setStaff((prev) => prev.filter((u) => u._id !== id));
      toast({
        title: "User deleted successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "Error deleting user",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={4}
      >
        <Heading size="md">Staff</Heading>

        {user?.permissions?.create && (
          <Button
            colorScheme="blue"
            onClick={() => {
              setEditingStaff(null);
              onOpen();
            }}
          >
            Create
          </Button>
        )}
      </Box>

      <SearchAndFilter
        search={search}
        setSearch={setSearch}
        status={status}
        setStatus={setStatus}
        options={["All", "Active", "Inactive"]}
      />

      <TableComponent
        title=""
        columns={["#", "Name", "Email", "Phone", "Role", "Status"]}
        data={currentStaff} // ✅ pagination applied here
        onEdit={user?.permissions?.update ? handleEdit : null}
        onDelete={user?.permissions?.delete ? handleDelete : null}
      />

      <Pagination
        totalItems={filteredStaff.length}
        itemsPerPage={itemsPerPage}
        setItemsPerPage={setItemsPerPage}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />

      <CreateStaffModal
        isOpen={isOpen}
        onClose={() => {
          onClose();
          setEditingStaff(null);
        }}
        refreshStaff={fetchStaff}
        editData={editingStaff}
      />
    </Box>
  );
};

export default StaffPage;
