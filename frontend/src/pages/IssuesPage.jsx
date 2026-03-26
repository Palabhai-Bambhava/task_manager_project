import React, { useEffect, useState } from "react";
import { Button, Flex, useToast } from "@chakra-ui/react";
import TableComponent from "../components/TableComponent";
import { getIssues, deleteIssue } from "../services/api";
import CreateIssueModal from "../components/CreateIssueModal";
import { useProject } from "../context/ProjectContext";
import { useAuth } from "../context/AuthContext";
import SearchAndFilter from "../components/SearchAndFilter";
import Pagination from "../components/Pagination";
import BulkIssueModal from "../components/BulkIssueModal";
import { useCompany } from "../context/CompanyContext";

const IssuesPage = () => {
  const { selectedProject } = useProject();
  const { selectedCompany } = useCompany();
  const { user } = useAuth();
  const toast = useToast();

  const [issues, setIssues] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [editIssue, setEditIssue] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [bulkOpen, setBulkOpen] = useState(false);

  const fetchIssues = async () => {
    try {
      const res = await getIssues();

      const data = res.data.map((i) => ({
        _id: i._id,
        Title: i.title,
        Description: i.description,
        Priority: i.priority,
        Status: i.status,
        AssignedTo: i.assignedTo?.name || "Unassigned",
        Project: i.project?.name || "No Project",
        project: i.project,
        CreatedAt: new Date(i.createdAt).toLocaleString(),
        assignedTo: i.assignedTo,
        company: i.company,
        original: i,
      }));

      setIssues(data);
    } catch (err) {
      console.error(err);
      toast({
        title: "Error fetching issues",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  useEffect(() => {
    fetchIssues();
  }, [selectedCompany]);
  // ✅ BULK UPLOAD PROJECT CHECK
  const handleBulkOpen = () => {
    if (!selectedProject) {
      toast({
        title: "Please select a project first",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setBulkOpen(true);
  };
  const handleCreateClick = () => {
    if (!selectedProject) {
      toast({
        title: "Please select project first",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsOpen(true);
    setEditIssue(null); // create mode
  };

  let filteredIssues = [...issues];

  // 1️⃣ Company filter (FIRST)
  if (selectedCompany) {
    filteredIssues = filteredIssues.filter(
      (i) => i.company?._id?.toString() === selectedCompany?._id?.toString(),
    );
  }

  // 2️⃣ Search filter
  if (search) {
    const s = search.toLowerCase();
    filteredIssues = filteredIssues.filter(
      (i) =>
        (i.Title || "").toLowerCase().includes(s) ||
        (i.Description || "").toLowerCase().includes(s) ||
        (i.AssignedTo || "").toLowerCase().includes(s),
    );
  }

  // 3️⃣ Status filter
  if (status !== "All") {
    filteredIssues = filteredIssues.filter(
      (i) => (i.Status || "").toLowerCase() === status.toLowerCase(),
    );
  }

  // 4️⃣ Project + Role filter
  filteredIssues = filteredIssues.filter((i) => {
    // project filter
    if (selectedProject) {
      if (!i.project) return false;

      if (i.project._id?.toString() !== selectedProject._id?.toString())
        return false;
    }

    // staff filter
    if (user.role === "staff") {
      return i.assignedTo?._id?.toString() === user._id?.toString();
    }

    return true;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [search, status, selectedProject, selectedCompany]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const currentIssues = filteredIssues.slice(indexOfFirstItem, indexOfLastItem);

  const handleEdit = (issue) => {
    setEditIssue(issue);
    setIsOpen(true);
  };

  const handleDelete = async (id) => {
    await deleteIssue(id);
    fetchIssues();
  };

  const columns = [
    "Title",
    "Description",
    "Priority",
    "AssignedTo",
    "Status",
    "CreatedAt",
  ];

  return (
    <>
      <Flex justify="space-between" align="center" mb={4}>
        <h2 style={{ fontSize: "20px", fontWeight: "bold" }}>Issues List</h2>

        <Flex gap={3}>
          {user?.permissions?.create && (
            <Button colorScheme="purple" onClick={() => setBulkOpen(true)}>
              Bulk Upload
            </Button>
          )}

          {user?.permissions?.create && (
            <Button colorScheme="blue" onClick={handleCreateClick}>
              Create Issue
            </Button>
          )}
        </Flex>
      </Flex>

      {/* Search + Status Filter */}
      <SearchAndFilter
        search={search}
        setSearch={setSearch}
        status={status}
        setStatus={setStatus}
        options={["All", "open", "in-progress", "resolved"]}
      />

      <TableComponent
        columns={columns}
        data={currentIssues}
        onEdit={
          user?.permissions?.update ? (row) => handleEdit(row.original) : null
        }
        onDelete={user?.permissions?.delete ? handleDelete : null}
      />
      <Pagination
        totalItems={filteredIssues.length}
        itemsPerPage={itemsPerPage}
        setItemsPerPage={setItemsPerPage}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />
      <BulkIssueModal
        isOpen={bulkOpen}
        onClose={() => setBulkOpen(false)}
        refreshIssues={fetchIssues}
      />
      <CreateIssueModal
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
          setEditIssue(null);
        }}
        refreshIssues={fetchIssues}
        editData={editIssue}
      />
    </>
  );
};

export default IssuesPage;
