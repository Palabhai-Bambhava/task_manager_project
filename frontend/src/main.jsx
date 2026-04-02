// main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { ChakraProvider } from "@chakra-ui/react";
import App from "./App.jsx";
import { CompanyProvider } from "./context/CompanyContext";
import { ProjectProvider } from "./context/ProjectContext";
import { AuthProvider } from "./context/AuthContext";
import theme from "./theme";
import "./App.css";


ReactDOM.createRoot(document.getElementById("root")).render(
  <ChakraProvider theme={theme}>
    <AuthProvider>
      <CompanyProvider>
        <ProjectProvider>
          <App />
        </ProjectProvider>
      </CompanyProvider>
    </AuthProvider>
  </ChakraProvider>
);