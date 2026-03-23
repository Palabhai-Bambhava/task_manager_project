import React, { useEffect, useState } from "react";
import { Button, Flex, useToast } from "@chakra-ui/react";
import TableComponent from "../components/TableComponent";
import CreateTaskModal from "../components/CreateTaskModal";
import { getTasks, deleteTask } from "../services/api";
import SearchAndFilter from "../components/SearchAndFilter";
import Pagination from "../components/Pagination";
import { useProject } from "../context/ProjectContext";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";

const TasksPage = () => {
  const { user } = useAuth();
  const { selectedProject } = useProject();
  const toast = useToast();

  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // ---------------- FETCH TASKS ----------------
  const fetchTasks = async () => {
    try {
      const res = await getTasks();
      const tableData = res.data.map((t) => ({
        _id: t._id,
        Title: t.title,
        Description: t.description,
        AssignedTo: t.assignedTo ? t.assignedTo.name : "Unassigned",
        Status: t.status,
        CreatedAt: new Date(t.createdAt).toLocaleDateString(),
        project: t.project,
        Project: t.project ? t.project.name : "No Project",
        assignedTo: t.assignedTo,
        original: t,
      }));
      setTasks(tableData);
    } catch (err) {
      console.error(err);
    }
  };

  // ---------------- FETCH PROJECTS ----------------
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await API.get("/projects");
        setProjects(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchProjects();
  }, []);

  useEffect(() => {
    fetchTasks();
  }, []);

  // ---------------- FILTER LOGIC (StaffPage style) ----------------
  let filteredTasks = [...tasks];

  // 1️⃣ Search filter
  if (search) {
    const s = search.toLowerCase();
    filteredTasks = filteredTasks.filter(
      (t) =>
        (t.Title || "").toLowerCase().includes(s) ||
        (t.Description || "").toLowerCase().includes(s) ||
        (t.AssignedTo || "").toLowerCase().includes(s),
    );
  }

  // 2️⃣ Status filter
  if (status !== "All") {
    filteredTasks = filteredTasks.filter(
      (t) => (t.Status || "").toLowerCase() === status.toLowerCase(),
    );
  }

  // 3️⃣ Project & role filter
  filteredTasks = filteredTasks.filter((t) => {
    if (!selectedProject && user.role === "superadmin") return true;
    if (!selectedProject && user.role === "staff") {
      return t.assignedTo?._id === user._id;
    }
    if (selectedProject) {
      if (!t.project) return false;
      const projectMatch =
        t.project._id.toString() === selectedProject._id.toString();
      if (!projectMatch) return false;
      if (user.role === "staff") {
        return t.assignedTo?._id?.toString() === user._id.toString();
      }
      return true; // superadmin
    }
    return false;
  });

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, status, selectedProject]);

  // ---------------- PAGINATION ----------------
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTasks = filteredTasks.slice(indexOfFirstItem, indexOfLastItem);

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

    setEditTask(null);
    setIsOpen(true);
  };

  // ---------------- EDIT ----------------
  const handleEdit = (row) => {
    setEditTask(row.original);
    setIsOpen(true);
  };

  // ---------------- DELETE ----------------
  const handleDelete = async (id) => {
    try {
      await deleteTask(id);
      toast({ title: "Task deleted successfully", status: "success" });
      fetchTasks();
    } catch (err) {
      toast({ title: "Delete failed", status: "error" });
    }
  };

  const columns = ["Title", "Description", "AssignedTo", "Status", "CreatedAt"];

  return (
    <>
      <Flex justify="space-between" mb={4}>
        <h2 style={{ fontSize: "20px", fontWeight: "bold" }}>Tasks List</h2>
        {user?.permissions?.create && (
          <Button colorScheme="blue" onClick={handleCreateClick}>
            Create Task
          </Button>
        )}
      </Flex>

      <SearchAndFilter
        search={search}
        setSearch={setSearch}
        status={status}
        setStatus={setStatus}
        options={["All", "pending", "in-progress", "completed"]}
      />

      <TableComponent
        columns={columns}
        data={currentTasks}
        onEdit={user?.permissions?.update ? handleEdit : null}
        onDelete={user?.permissions?.delete ? handleDelete : null}
      />

      <Pagination
        totalItems={filteredTasks.length}
        itemsPerPage={itemsPerPage}
        setItemsPerPage={setItemsPerPage}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />

      <CreateTaskModal
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
          setEditTask(null);
        }}
        refreshTasks={fetchTasks}
        editData={editTask}
        projects={projects}
      />
    </>
  );
};

export default TasksPage;
