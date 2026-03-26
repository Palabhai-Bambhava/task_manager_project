// main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { ChakraProvider } from "@chakra-ui/react";
import App from "./App.jsx";
import { CompanyProvider } from "./context/CompanyContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <ChakraProvider>
    <CompanyProvider>
      <App />
    </CompanyProvider>
  </ChakraProvider>,
);
