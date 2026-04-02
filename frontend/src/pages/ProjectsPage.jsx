import React, { useState,useEffect } from "react";
import { Button, Flex, useToast } from "@chakra-ui/react";
import TableComponent from "../components/TableComponent";
import CreateProjectModal from "../components/CreateProjectModal";
import SearchAndFilter from "../components/SearchAndFilter";
import Pagination from "../components/Pagination";
import { useAuth } from "../context/AuthContext";
import { useProject } from "../context/ProjectContext";
import API from "../services/api";
import { useCompany } from "../context/CompanyContext";

const ProjectsPage = () => {
  const { user } = useAuth();
  const { projects, fetchProjects } = useProject();
  const { selectedCompany } = useCompany();

  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [editProject, setEditProject] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const toast = useToast();

  // ✅ Filter Logic
  // ✅ Filter Logic (FINAL CLEAN VERSION)
  let filteredProjects = [...projects];

  // 1️⃣ Company filter (MOST IMPORTANT)
  if (selectedCompany) {
    filteredProjects = filteredProjects.filter(
      (p) => p.company?._id?.toString() === selectedCompany?._id?.toString(),
    );
  }

  // 2️⃣ Staff access filter
  filteredProjects = filteredProjects.filter((p) => {
    if (user?.role === "staff") {
      return (
        Array.isArray(p.assignedStaff) &&
        p.assignedStaff.some(
          (staff) => staff?._id?.toString() === user?._id?.toString(),
        )
      );
    }
    return true;
  });

  // 3️⃣ Search filter (safe)
  if (search) {
    filteredProjects = filteredProjects.filter((p) =>
      (p.name || "").toLowerCase().includes(search.toLowerCase()),
    );
  }

  // 4️⃣ Status filter
  if (status !== "All") {
    filteredProjects = filteredProjects.filter((p) => p.status === status);
  }

  // 5️⃣ Map for table
  filteredProjects = filteredProjects.map((p,index) => ({
    _id: p._id,
    "#": index + 1,
    Name: p.name,
    Status: p.status,
    AssignedStaff: Array.isArray(p.assignedStaff)
      ? p.assignedStaff.map((s) => s.name).join(", ")
      : "None",
    original: p,
  }));

  useEffect(() => {
    setCurrentPage(1);
  }, [search, status, selectedCompany]);

  // ✅ Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const currentProjects = filteredProjects.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );

  // ✅ Delete Project
  const handleDelete = async (id) => {
    try {
      await API.delete(`/projects/${id}`);

      toast({
        title: "Project deleted",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // refresh global projects (Navbar + pages)
      fetchProjects();
    } catch (err) {
      toast({
        title: "Delete failed",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const columns = ["#","Name", "Status", "AssignedStaff"];

  return (
    <>
      <Flex justify="space-between" mb={4}>
        <h2 style={{ fontSize: "20px", fontWeight: "bold" }}>Projects List</h2>

        {user?.permissions?.create && (
          <Button colorScheme="blue" onClick={() => setIsOpen(true)}>
            Create Project
          </Button>
        )}
      </Flex>

      {/* Search + Status Filter */}
      <SearchAndFilter
        search={search}
        setSearch={setSearch}
        status={status}
        setStatus={setStatus}
        options={["All", "Pending", "In Progress", "Completed"]}
      />

      <TableComponent
        columns={columns}
        data={currentProjects}
        onEdit={
          user?.permissions?.update
            ? (row) => {
                setEditProject(row.original);
                setIsOpen(true);
              }
            : null
        }
        onDelete={user?.permissions?.delete ? handleDelete : null}
      />

      <Pagination
        totalItems={filteredProjects.length}
        itemsPerPage={itemsPerPage}
        setItemsPerPage={setItemsPerPage}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />

      <CreateProjectModal
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
          setEditProject(null);
        }}
        refreshProjects={fetchProjects}
        editData={editProject}
      />
    </>
  );
};

export default ProjectsPage;
