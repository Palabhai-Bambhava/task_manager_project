import { useEffect, useState } from "react";
import {
  Box,
  Heading,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  VStack,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";

import TableComponent from "../components/TableComponent";
import SearchAndFilter from "../components/SearchAndFilter";
import Pagination from "../components/Pagination";

import { getCompanies, updateCompany, deleteCompany } from "../services/api";
import CompanyForm from "../components/CompanyForm"; // ✅ Reusable form

const CompanyPage = () => {
  const [companies, setCompanies] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const [selectedCompany, setSelectedCompany] = useState(null);
  const [editCompany, setEditCompany] = useState(null);
  const [form, setForm] = useState({});

  const toast = useToast();

  const {
    isOpen: isViewOpen,
    onOpen: onViewOpen,
    onClose: onViewClose,
  } = useDisclosure();

  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose,
  } = useDisclosure();

  // ✅ Fetch companies
  const fetchCompanies = async () => {
    try {
      const res = await getCompanies();
      setCompanies(res.data);
    } catch (err) {
      console.error(err);
      toast({ title: "Failed to fetch companies", status: "error" });
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  // ✅ Filter
  const filteredCompanies = companies
    .filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
    .filter((c) =>
      status === "All" ? true : status === "Active" ? c.isActive : !c.isActive
    )
    .map((c, index) => ({
      _id: c._id,
      "#": index + 1,
      Name: c.name,
      Owner: c.owner?.name || "-",
      Status: c.isActive ? "Active" : "Inactive",
      original: c,
    }));

  // ✅ Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const currentCompanies = filteredCompanies.slice(
    indexOfLastItem - itemsPerPage,
    indexOfLastItem
  );

  // ✅ VIEW modal
  const handleView = (row) => {
    setSelectedCompany(row.original);
    onViewOpen();
  };

  // ✅ EDIT modal
  const handleEdit = (row) => {
    const data = row.original;
    setEditCompany(data);
    setForm({
      name: data.name,
      address: data.address,
      phone: data.phone,
      website: data.website,
      description: data.description,
      ownerName: data.owner?.name || "",
      ownerEmail: data.owner?.email || "",
      isActive: data.isActive,
      permissions: data.permissions || [],
    });
    onEditOpen();
  };

  const handleUpdate = async () => {
    try {
      await updateCompany(editCompany._id, form);
      toast({ title: "Company updated", status: "success" });
      fetchCompanies();
      onEditClose();
    } catch (err) {
      console.error(err);
      toast({ title: "Update failed", status: "error" });
    }
  };

  // ✅ DELETE
  const handleDelete = async (id) => {
    if (!window.confirm("Delete company?")) return;
    try {
      await deleteCompany(id);
      toast({ title: "Company deleted", status: "success" });
      fetchCompanies();
    } catch {
      toast({ title: "Delete failed", status: "error" });
    }
  };

  return (
    <Box p={4}>
      <Heading size="md" mb={4}>
        Companies
      </Heading>

      {/* Search & Filter */}
      <SearchAndFilter
        search={search}
        setSearch={setSearch}
        status={status}
        setStatus={setStatus}
        options={["All", "Active", "Inactive"]}
      />

      {/* Table */}
      <TableComponent
        columns={["#", "Name", "Owner", "Status"]}
        data={currentCompanies}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Pagination */}
      <Pagination
        totalItems={filteredCompanies.length}
        itemsPerPage={itemsPerPage}
        setItemsPerPage={setItemsPerPage}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />

      {/* VIEW Modal */}
      <Modal isOpen={isViewOpen} onClose={onViewClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Company Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedCompany && (
              <CompanyForm
                form={{
                  name: selectedCompany.name,
                  address: selectedCompany.address,
                  phone: selectedCompany.phone,
                  website: selectedCompany.website,
                  description: selectedCompany.description,
                  ownerName: selectedCompany.owner?.name,
                  ownerEmail: selectedCompany.owner?.email,
                }}
                setForm={() => {}}
                readOnly={true}
                showOwner={true}
              />
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* EDIT Modal */}
      <Modal isOpen={isEditOpen} onClose={onEditClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Company</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <CompanyForm
              form={form}
              setForm={setForm}
              onSubmit={handleUpdate}
              showOwner={true}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default CompanyPage;