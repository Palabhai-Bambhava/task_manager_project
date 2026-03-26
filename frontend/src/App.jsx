import { ChakraProvider } from "@chakra-ui/react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProjectProvider } from "./context/ProjectContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import StaffPage from "./pages/StaffPage";
import TasksPage from "./pages/TasksPage";
import RolePage from "./pages/RolePage";
import ProjectsPage from "./pages/ProjectsPage";
import ProfilePage from "./pages/ProfilePage";
import IssuesPage from "./pages/IssuesPage"
import DocumentsPage from "./pages/DocumentsPage";
import RegisterCompany from "./pages/RegisterCompany";
import CompanyPage from "./pages/CompanyPage";
import theme from "./theme";
import SubscriptionPage from "./pages/SubscriptionPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register-company" element={<RegisterCompany />} />

        <Route
          path="/dashboard/*"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        >
          <Route index element={null} />
          <Route path="staff" element={<StaffPage />} />
          <Route path="tasks" element={<TasksPage />} />
          <Route path="roles" element={<RolePage />} />

          {/* PROJECT ROUTES */}
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="projects/:id" element={<ProjectsPage />} />

          <Route path="profile" element={<ProfilePage />} />
          <Route path="issues" element={<IssuesPage />} />
          <Route path="documents" element={<DocumentsPage />} />
          <Route path="company" element={<CompanyPage />} />
          <Route path="subscription" element={<SubscriptionPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
