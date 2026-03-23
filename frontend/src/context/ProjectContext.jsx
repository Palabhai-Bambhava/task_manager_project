import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import API from "../services/api";

const ProjectContext = createContext();
export const useProject = () => useContext(ProjectContext);

export const ProjectProvider = ({ children }) => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);

  // ✅ Make fetchProjects reusable
  const fetchProjects = async () => {
    if (!user) return;

    try {
      const res = await API.get("/projects");
      let filteredProjects = res.data;

      // Staff: only assigned projects
      if (user.role === "staff") {
        filteredProjects = filteredProjects.filter((project) =>
          Array.isArray(project.assignedStaff) &&
          project.assignedStaff.some(
            (staff) =>
              staff &&
              staff._id &&
              staff._id.toString() === user.id.toString()
          )
        );
      }

      setProjects(filteredProjects);

      // Reset selected project if it no longer exists
      if (
        selectedProject &&
        !filteredProjects.find((p) => p._id === selectedProject._id)
      ) {
        setSelectedProject(null);
      }

    } catch (err) {
      console.error("Project fetch failed:", err);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [user]);

  return (
    <ProjectContext.Provider
      value={{
        projects,
        selectedProject,
        setSelectedProject,
        fetchProjects, // ✅ expose this
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};