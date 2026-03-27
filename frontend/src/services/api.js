import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true,
});

// TASKS
export const getTasks = (companyId) =>
  companyId ? API.get(`/tasks?company=${companyId}`) : API.get("/tasks");
export const createTask = (data) => API.post("/tasks", data);
export const updateTask = (id, data) => API.put(`/tasks/${id}`, data);
export const deleteTask = (id) => API.delete(`/tasks/${id}`);

// STAFF
export const getStaff = (companyId) =>
  companyId ? API.get(`/staff?company=${companyId}`) : API.get("/staff");
export const createStaff = (staffData) => API.post("/staff", staffData);
export const deleteStaff = (id) => API.delete(`/staff/${id}`);
export const updateStaff = (id, data) => API.put(`/staff/${id}`, data);

export const getRoles = () => API.get("/roles");
export const createRole = (data) => API.post("/roles", data);
export const updateRole = (id, data) => API.put(`/roles/${id}`, data);
export const deleteRole = (id) => API.delete(`/roles/${id}`);

export const getProjects = () => API.get("/projects");
export const createProject = (data) => API.post("/projects", data);

export const getIssues = (companyId) =>
  companyId ? API.get(`/issues?company=${companyId}`) : API.get("/issues");
export const createIssue = (data) => API.post("/issues", data);
export const updateIssue = (id, data) => API.put(`/issues/${id}`, data);
export const deleteIssue = (id) => API.delete(`/issues/${id}`);

export const bulkUploadIssues = (formData) =>
  API.post("/issues/bulk-upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

// documents
export const getDocuments = (projectId, companyId) => {
  if (projectId) return API.get(`/documents?project=${projectId}`);
  if (companyId) return API.get(`/documents?company=${companyId}`);
  return API.get("/documents");
};

export const createDocument = (data) => {
  if (data instanceof FormData) {
    return API.post("/documents", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  } else {
    return API.post("/documents", data);
  }
};
export const deleteDocument = (id) => API.delete(`/documents/${id}`);
export const updateDocument = (id, formData) =>
  API.put(`/documents/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
export const updateDocumentAccess = (id, access) => {
  return API.put(`/documents/access/${id}`, {
    access,
  });
};

export const loginUser = (email, password) =>
  API.post("/auth/login", { email, password });

// COMPANY REGISTER
export const registerCompany = (data) => API.post("/companies/register", data);
export const getCompanies = () => API.get("/companies");
export const updateCompany = (id, data) => API.put(`/companies/${id}`, data);
export const deleteCompany = (id) => API.delete(`/companies/${id}`);

// ✅ GET ALL PLANS
export const getPlans = () => API.get("/subscription/all");

// ✅ CREATE PLAN (SUPERADMIN)
export const createPlan = (data) =>
  API.post("/subscription", {
    ...data,
    price: Number(data.price), // 🔥 FIX
    modules: data.modules.map((m) => ({
      moduleName: m.moduleName,
      limit: Number(m.limit), // 🔥 FIX
    })),
  });

// ✅ UPDATE PLAN
export const updatePlan = (id, data) =>
  API.put(`/subscription/${id}`, {
    ...data,
    price: Number(data.price), // 🔥 FIX
    modules: data.modules.map((m) => ({
      moduleName: m.moduleName,
      limit: Number(m.limit), // 🔥 FIX
    })),
  });

// ✅ DELETE PLAN
export const deletePlan = (id) =>
  API.delete(`/subscription/${id}`);

// ✅ APPLY PLAN (OWNER)
export const applyPlan = (planId) =>
  API.post("/subscription/apply", { planId });

// ✅ GET COMPANY SUBSCRIPTION
export const getMyCompany = () =>
  API.get("/subscription/my-company");

// ✅ GET MODULE LIST (DROPDOWN USE)
export const getModules = () =>
  API.get("/subscription/modules");

export default API;
