import React, { useState, useEffect, useRef } from "react";
import { Button, Flex, useToast } from "@chakra-ui/react";
import TableComponent from "../components/TableComponent";
import Pagination from "../components/Pagination";
import CreateDocumentModal from "../components/CreateDocumentModal";
import ManageAccessModal from "../components/ManageAccessModal";
import SearchAndFilter from "../components/SearchAndFilter";
import { getDocuments, deleteDocument } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useProject } from "../context/ProjectContext";
import { useCompany } from "../context/CompanyContext";

// ✅ USE VARIABLE LIST
import { VariableSizeList as List } from "react-window";

const DocumentsPage = () => {
  const { user } = useAuth();
  const { selectedProject } = useProject();
  const { selectedCompany } = useCompany();
  const toast = useToast();

  const [documents, setDocuments] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [isOpen, setIsOpen] = useState(false);
  const [editDoc, setEditDoc] = useState(null);
  const [manageAccessDoc, setManageAccessDoc] = useState(null);

  const [viewDoc, setViewDoc] = useState(null);

  // ✅ dynamic height cache
  const sizeMap = useRef({});

  const getItemSize = (index) => {
    return sizeMap.current[index] || 400; // default height
  };

  const setSize = (index, size) => {
    sizeMap.current = { ...sizeMap.current, [index]: size };
    listRef.current?.resetAfterIndex(index);
  };

  const listRef = useRef();

  // Fetch documents
  const fetchDocuments = async () => {
  try {
    const res = await getDocuments(selectedProject?._id, selectedCompany?._id);

    let visibleDocs = res.data;

    // ✅ superadmin and owner see everything backend already scoped for them
    // only staff needs access filtering
    if (user.role === "staff") {
      visibleDocs = res.data.filter(
        (doc) =>
          doc.createdBy?._id?.toString() === user._id?.toString() ||
          doc.access?.some((a) => {
            const userId = typeof a.user === "object" ? a.user._id : a.user;
            return userId?.toString() === user._id?.toString();
          })
      );
    }

    setDocuments(visibleDocs);
  } catch (err) {
    console.error(err);
  }
};

  useEffect(() => {
    fetchDocuments();
  }, [selectedProject,selectedCompany]);

  // Filter
  const filteredDocs = documents
    .filter((doc) => doc.name.toLowerCase().includes(search.toLowerCase()))
    .filter((doc) => (status === "All" ? true : doc.status === status))
    .map((doc,index) => ({
      _id: doc._id,
      "#": index + 1,
      Name: doc.name,
      Description: doc.description,
      CreatedBy: doc.createdBy?.name || "Unknown",
      Access:
        doc.access
          ?.map((a) => (typeof a.user === "object" ? a.user?.name : "User"))
          .filter(Boolean)
          .join(", ") || "No Access",
      original: doc,
    }));

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const currentDocs = filteredDocs.slice(
    indexOfLastItem - itemsPerPage,
    indexOfLastItem,
  );

  // Actions
  const handleEdit = (doc) => {
    setEditDoc(doc.original);
    setIsOpen(doc.original.type === "file" ? "file" : "editor");
  };

  const handleDelete = async (id) => {
    await deleteDocument(id);
    fetchDocuments();
  };

  const handleView = (row) => {
    sizeMap.current = {}; // reset sizes
    setViewDoc(row.original);
  };

  const columns = ["#","Name", "Description", "CreatedBy", "Access"];

  const cleanContent = (html) => {
    if (!html) return "";

    let cleaned = html;

    // 🔥 remove ALL A4 wrappers (loop until clean)
    const regex =
      /<div[^>]*style="[^"]*(width\s*:\s*794px|min-height\s*:\s*1123px)[^"]*"[^>]*>(.*?)<\/div>/gis;

    while (regex.test(cleaned)) {
      cleaned = cleaned.replace(regex, "$1");
    }

    return cleaned;
  };

  // ✅ ROW WITH AUTO HEIGHT MEASURE
const Row = ({ index, style }) => {
  const page = viewDoc?.pages?.[index];
  const rowRef = useRef();

  useEffect(() => {
    if (rowRef.current) {
      const height = rowRef.current.getBoundingClientRect().height;
      if (height) setSize(index, height + 20);
    }
  }, [page]);

  if (!page) return null;

  const content = cleanContent(page.content);

  return (
    <div
      style={{
        ...style,
        display: "flex",
        justifyContent: "center",
        padding: "20px 0",
        background: "#f5f5f5",
      }}
    >
      <div
        ref={rowRef}
        style={{
          width: "794px",
          minHeight: "1123px",
          background: "#fff",
          padding: "40px",
          boxShadow: "0 0 10px rgba(0,0,0,0.15)",
          borderRadius: "6px",
        }}
      >
        <div dangerouslySetInnerHTML={{ __html: content }} />
      </div>
    </div>
  );
};

  return (
    <>
      {/* Header */}
      <Flex justify="space-between" mb={4}>
        <h2 style={{ fontSize: "20px", fontWeight: "bold" }}>Documents List</h2>

        {user?.permissions?.create && (
          <Flex gap={2}>
            <Button
              colorScheme="blue"
              onClick={() => {
                if (!selectedProject) {
                  toast({
                    title: "Please select project first",
                    status: "warning",
                  });
                  return;
                }
                setEditDoc(null);
                setIsOpen("editor");
              }}
            >
              Create Document
            </Button>

            <Button
              colorScheme="green"
              onClick={() => {
                if (!selectedProject) {
                  toast({
                    title: "Please select project first",
                    status: "warning",
                  });
                  return;
                }
                setEditDoc(null);
                setIsOpen("file");
              }}
            >
              Upload Document
            </Button>
          </Flex>
        )}
      </Flex>

      {/* Search */}
      <SearchAndFilter
        search={search}
        setSearch={setSearch}
        status={status}
        setStatus={setStatus}
        options={["All"]}
      />

      {/* Table */}
      <TableComponent
        columns={columns}
        data={currentDocs}
        onEdit={user?.permissions?.update ? handleEdit : null}
        onDelete={user?.permissions?.delete ? handleDelete : null}
        onView={handleView}
        onManageAccess={(row) => setManageAccessDoc(row.original)}
      />

      {/* Pagination */}
      <Pagination
        totalItems={filteredDocs.length}
        itemsPerPage={itemsPerPage}
        setItemsPerPage={setItemsPerPage}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />

      {/* ✅ VIEWER */}
      {viewDoc && (
        <div
          style={{
            marginTop: "20px",
            border: "1px solid #ddd",
            borderRadius: "10px",
            padding: "10px",
            background: "#fff",
          }}
        >
          <Flex justify="space-between" mb={3}>
            <h3>{viewDoc.name}</h3>
            <Button onClick={() => setViewDoc(null)}>Close</Button>
          </Flex>

          {viewDoc.type === "file" ? (
            <iframe
              src={`http://localhost:5000${viewDoc.fileUrl}`}
              style={{ width: "100%", height: "600px" }}
              title={viewDoc.name}
            />
          ) : viewDoc.pages?.length > 0 ? (
            <List
              ref={listRef}
              height={600}
              width="100%"
              itemCount={viewDoc.pages.length}
              itemSize={getItemSize}
            >
              {Row}
            </List>
          ) : (
            <div>No content available</div>
          )}
        </div>
      )}

      {/* Modals */}
      <CreateDocumentModal
        isOpen={!!isOpen}
        onClose={() => setIsOpen(false)}
        refreshDocuments={fetchDocuments}
        editData={editDoc}
        mode={isOpen}
      />

      {manageAccessDoc && (
        <ManageAccessModal
          isOpen={!!manageAccessDoc}
          onClose={() => setManageAccessDoc(null)}
          documentData={manageAccessDoc}
          refreshDocuments={fetchDocuments}
        />
      )}
    </>
  );
};

export default DocumentsPage;
