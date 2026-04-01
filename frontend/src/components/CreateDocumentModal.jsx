import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Checkbox,
  Flex,
  VStack,
} from "@chakra-ui/react";
import { createDocument, getStaff, updateDocument } from "../services/api";
import { useProject } from "../context/ProjectContext";
import Cookies from "js-cookie";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const CreateDocumentModal = ({
  isOpen,
  onClose,
  refreshDocuments,
  editData,
  mode,
}) => {
  const { selectedProject } = useProject();

  const [staffList, setStaffList] = useState([]);
  const [docMode, setDocMode] = useState("text"); // text | docs
  const [pages, setPages] = useState([""]);
  const [activePageIndex, setActivePageIndex] = useState(0);
  const [isHoveringPage, setIsHoveringPage] = useState(false);
  const pageRefs = useRef([]);
  const modules = useMemo(
    () => ({
      keyboard: {
        bindings: {
          addPage: {
            key: 13,
            shiftKey: true,
            handler: (range, context) => {
              setPages((prev) => {
                const newPages = [...prev];
                newPages.splice(activePageIndex + 1, 0, "");
                return newPages;
              });

              setActivePageIndex((prev) => prev + 1);
              return false;
            },
          },
        },
      },
    }),
    [activePageIndex],
  );

  const [form, setForm] = useState({
    name: "",
    description: "",
    editorContent: "",
    file: null,
    autoSave: false,
    access: [],
  });

  const showEditor = mode === "editor";
  const showFile = mode === "file";

  /* ---------------- FETCH STAFF ---------------- */

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const res = await getStaff();
        setStaffList(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchStaff();
  }, []);

  /* ---------------- LOAD EDIT DATA ---------------- */
  useEffect(() => {
    if (editData) {
      const combinedContent =
        editData.pages?.map((p) => p.content).join("") || "";

      setForm({
        name: editData.name || "",
        description: editData.description || "",
        editorContent: combinedContent,
        file: null,
        autoSave: editData.autoSave || false,
        access:
          editData.access?.map((a) => ({
            user: a.user?._id || a.user,
            canView: a.canView || false,
            canEdit: a.canEdit || false,
          })) || [],
      });

      if (editData.pages && editData.pages.length > 1) {
        setDocMode("docs");
        setPages(editData.pages.map((p) => p.content));
      } else {
        setDocMode("text");
        setPages([combinedContent]);
      }
    } else if (showEditor && isOpen) {
      const savedContent = Cookies.get("editorContent");
      const savedPages = Cookies.get("editorPages");

      setForm({
        name: "",
        description: "",
        editorContent: savedContent || "",
        file: null,
        autoSave: !!savedContent,
        access: [],
      });

      setDocMode("text");

      if (savedPages) {
        setPages(JSON.parse(savedPages));
      } else {
        setPages([savedContent || ""]);
      }

      setActivePageIndex(0); // ✅ important
    }
  }, [editData, isOpen, showEditor]);

  /* ---------------- AUTO SAVE ---------------- */

  useEffect(() => {
    if (!form.autoSave || !showEditor) return;

    if (docMode === "text") {
      Cookies.set("editorContent", form.editorContent, { expires: 7 });
    } else {
      Cookies.set("editorPages", JSON.stringify(pages), { expires: 7 });
    }
  }, [form.editorContent, pages, form.autoSave, showEditor, docMode]);

  useEffect(() => {
    if (!isOpen) return;

    const savedPages = Cookies.get("editorPages");

    if (savedPages && docMode === "docs") {
      try {
        setPages(JSON.parse(savedPages));
      } catch (e) {
        console.error("Invalid cookie data");
      }
    }
  }, [docMode, isOpen]);

  /* ---------------- INPUT CHANGE ---------------- */

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  /* ---------------- FILE CHANGE ---------------- */

  const handleFileChange = (e) => {
    setForm((prev) => ({
      ...prev,
      file: e.target.files[0],
    }));
  };

  /* ---------------- ACCESS TOGGLE ---------------- */

  const toggleAccess = (userId, type) => {
    setForm((prev) => {
      const access = [...prev.access];

      const index = access.findIndex(
        (a) => (typeof a.user === "object" ? a.user._id : a.user) === userId,
      );

      if (index > -1) {
        access[index][type] = !access[index][type];
      } else {
        access.push({
          user: userId,
          canView: type === "canView",
          canEdit: type === "canEdit",
        });
      }

      return { ...prev, access };
    });
  };

  /* ---------------- SUBMIT ---------------- */

  const handleSubmit = async () => {
    try {
      if (showFile && !form.file && !editData) {
        return alert("Please upload a file");
      }

      if (showEditor) {
        if (docMode === "text" && !form.editorContent.trim()) {
          return alert("Please enter document content");
        }

        if (docMode === "docs" && pages.every((p) => !p.trim())) {
          return alert("Please enter document content");
        }
      }

      let projectId =
        selectedProject?._id ||
        (typeof editData?.project === "object"
          ? editData?.project?._id
          : editData?.project);

      if (!projectId) {
        return alert("Please select a project");
      }

      let finalContent = "";

      if (docMode === "text") {
        finalContent = form.editorContent;
      } else {
        finalContent = pages.join("<!--PAGE_BREAK-->");
      }
      // 🔥 TEXT DOCUMENT → send JSON (NOT FormData)
      if (showEditor) {
        const payload = {
          name: form.name,
          description: form.description,
          type: "text",
          project: projectId,
          editorContent: finalContent,
          autoSave: form.autoSave,
          access: form.access,
        };

        if (editData) {
          await updateDocument(editData._id, payload);
        } else {
          await createDocument(payload);
        }
      }

      // 🔥 FILE DOCUMENT → use FormData
      if (showFile) {
        const formData = new FormData();
        formData.append("name", form.name);
        formData.append("description", form.description);
        formData.append("type", "file");
        formData.append("project", projectId);
        formData.append("autoSave", form.autoSave);
        formData.append("access", JSON.stringify(form.access));

        if (form.file) {
          formData.append("file", form.file);
        }

        if (editData) {
          await updateDocument(editData._id, formData);
        } else {
          await createDocument(formData);
        }
      }

      refreshDocuments();
      handleClose();
    } catch (err) {
      console.error("Failed to save document:", err.response?.data || err);
      alert(err.response?.data?.message || "Failed to save document");
    }
  };

  /* ---------------- CLOSE MODAL ---------------- */

  const handleClose = () => {
    Cookies.remove("editorContent");
    Cookies.remove("editorPages");

    setForm({
      name: "",
      description: "",
      editorContent: "",
      file: null,
      autoSave: false,
      access: [],
    });

    setPages([""]); // ✅ RESET pages
    setActivePageIndex(0); // ✅ RESET hover
    setDocMode("text"); // ✅ RESET mode

    onClose();
  };

  const handleAutoPageBreak = (index) => {
    const editor = pageRefs.current[index];

    if (!editor) return;

    const editorEl = editor.editor?.root;

    if (!editorEl) return;

    const height = editorEl.scrollHeight;

    // 🔥 A4 height limit
    if (height > 1000) {
      const content = pages[index];

      // 🔥 split content (simple split)
      const splitPoint = Math.floor(content.length / 2);

      const firstHalf = content.substring(0, splitPoint);
      const secondHalf = content.substring(splitPoint);

      const newPages = [...pages];
      newPages[index] = firstHalf;
      newPages.splice(index + 1, 0, secondHalf);

      setPages(newPages);
      setActivePageIndex(index + 1);
    }
  };

  const handleGeneratePDF = async () => {
    const pdf = new jsPDF("p", "mm", "a4");

    const tempDiv = document.createElement("div");
    tempDiv.style.background = "#fff";
    tempDiv.style.padding = "20px";
    tempDiv.style.width = "794px";

    if (docMode === "text") {
      tempDiv.innerHTML = form.editorContent;
    } else {
      tempDiv.innerHTML = pages.join("");
    }

    document.body.appendChild(tempDiv);

    const canvas = await html2canvas(tempDiv, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");

    const imgWidth = 210;
    const pageHeight = 297;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(`${form.name || "document"}.pdf`);

    document.body.removeChild(tempDiv);
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="6xl">
      <ModalOverlay />

      <ModalContent>
        <ModalHeader>
          {editData
            ? "Edit Document"
            : showEditor
              ? "Create Document"
              : "Upload Document"}
        </ModalHeader>

        <ModalCloseButton />

        <ModalBody>
          <FormControl mb={3} isRequired>
            <FormLabel>Name</FormLabel>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              style={{ width: "100%", padding: "8px" }}
            />
          </FormControl>

          <FormControl mb={3}>
            <FormLabel>Description</FormLabel>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              style={{ width: "100%", padding: "8px" }}
            />
          </FormControl>

          <FormControl mb={3} isRequired>
            <FormLabel>Document Type</FormLabel>

            <Flex gap={2}>
              <Button
                size="sm"
                colorScheme={docMode === "text" ? "blue" : "gray"}
                onClick={() => {
                  if (docMode === "docs") {
                    setForm((prev) => ({
                      ...prev,
                      editorContent: pages.join(""),
                    }));
                  }
                  setDocMode("text");
                }}
              >
                Text
              </Button>

              <Button
                size="sm"
                colorScheme={docMode === "docs" ? "blue" : "gray"}
                onClick={() => {
                  if (docMode === "text") {
                    setPages([form.editorContent]);
                  }
                  setDocMode("docs");
                }}
              >
                Docs (A4)
              </Button>
            </Flex>
          </FormControl>

          {showEditor && docMode === "text" && (
            <FormControl mb={3}>
              <FormLabel>Editor Content</FormLabel>

              <ReactQuill
                theme="snow"
                value={form.editorContent}
                onChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    editorContent: value,
                  }))
                }
              />
            </FormControl>
          )}
          {showEditor && docMode === "docs" && (
            <div
              style={{ maxHeight: "80vh", overflowY: "auto", padding: "20px" }}
            >
              {pages.map((page, index) => (
                <div
                  key={index}
                  style={{
                    width: "794px",
                    minHeight: "1123px",
                    margin: "30px auto",
                    background: "#fff",
                    padding: "40px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.12)", // 👈 important
                    borderRadius: "8px", // 👈 smooth look
                  }}
                >
                  <FormControl mb={2}>
                    <FormLabel>Page {index + 1}</FormLabel>

                    <ReactQuill
                      theme="snow"
                      modules={modules}
                      value={page}
                      onFocus={() => setActivePageIndex(index)}
                      onChange={(value) => {
                        const updated = [...pages];
                        updated[index] = value;
                        setPages(updated);
                      }}
                    />
                  </FormControl>

                  {/* DELETE BUTTON */}
                  {pages.length > 1 && (
                    <Button
                      size="xs"
                      colorScheme="red"
                      onClick={() => {
                        const updated = pages.filter((_, i) => i !== index);
                        setPages(updated);
                        setActivePageIndex(0);
                      }}
                    >
                      Delete Page
                    </Button>
                  )}
                </div>
              ))}

              {/* ADD PAGE */}
              <div style={{ textAlign: "center", marginTop: "20px" }}>
                <Button
                  colorScheme="green"
                  onClick={() => setPages([...pages, ""])}
                >
                  + Add Page
                </Button>
              </div>
            </div>
          )}

          {showFile && (
            <FormControl mb={3}>
              <FormLabel>Upload File</FormLabel>

              {editData?.fileUrl && !form.file && (
                <div style={{ marginBottom: "8px" }}>
                  Current File:{" "}
                  <a
                    href={`http://localhost:5000${editData.fileUrl}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View File
                  </a>
                </div>
              )}

              <input type="file" onChange={handleFileChange} />
            </FormControl>
          )}

          <FormControl mb={3}>
            <FormLabel>Access Users</FormLabel>

            <VStack
              align="stretch"
              maxH="200px"
              overflowY="auto"
              border="1px solid #e2e8f0"
              p={2}
              borderRadius="md"
            >
              {staffList.map((staff) => {
                const userAccess =
                  form.access.find((a) => a.user === staff._id) || {};

                return (
                  <Flex key={staff._id} justify="space-between">
                    <span>{staff.name}</span>

                    <Flex gap={2}>
                      <Checkbox
                        isChecked={userAccess.canView || false}
                        onChange={() => toggleAccess(staff._id, "canView")}
                      >
                        View
                      </Checkbox>

                      <Checkbox
                        isChecked={userAccess.canEdit || false}
                        onChange={() => toggleAccess(staff._id, "canEdit")}
                      >
                        Edit
                      </Checkbox>
                    </Flex>
                  </Flex>
                );
              })}
            </VStack>
          </FormControl>

          {showEditor && (
            <FormControl mb={3}>
              <Checkbox
                name="autoSave"
                isChecked={form.autoSave}
                onChange={handleChange}
              >
                Auto Save (Cookie)
              </Checkbox>
            </FormControl>
          )}
        </ModalBody>

        <ModalFooter>
          {showEditor && (
            <Button colorScheme="purple" mr={3} onClick={handleGeneratePDF}>
              Generate PDF
            </Button>
          )}

          <Button colorScheme="blue" mr={3} onClick={handleSubmit}>
            Save
          </Button>

          <Button onClick={handleClose}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CreateDocumentModal;
