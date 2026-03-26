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
  Button,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";

import TableComponent from "../components/TableComponent";
import SearchAndFilter from "../components/SearchAndFilter";
import Pagination from "../components/Pagination";
import CreateSubscriptionPlanModal from "../components/CreateSubscriptionPlanModal";
import { getPlans, applyPlan, deletePlan } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { getMyCompany } from "../services/api";
const SubscriptionPage = ({ companyId }) => {
  const [plans, setPlans] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const [editData, setEditData] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [myCompany, setMyCompany] = useState(null);
  const { user } = useAuth();
  const isSuperAdmin = user?.role === "superadmin";

  console.log("USER:", user);
  console.log("companyId:", companyId);

  const toast = useToast();

  const {
    isOpen: isCreateOpen,
    onOpen: onCreateOpen,
    onClose: onCreateClose,
  } = useDisclosure();

  const {
    isOpen: isViewOpen,
    onOpen: onViewOpen,
    onClose: onViewClose,
  } = useDisclosure();

  const fetchMyCompany = async () => {
    try {
      const res = await getMyCompany();
      setMyCompany(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  // ✅ Fetch plans
  const fetchPlans = async () => {
    try {
      const res = await getPlans();
      setPlans(res.data);
    } catch (err) {
      toast({ title: "Failed to fetch plans", status: "error" });
    }
  };

  useEffect(() => {
    if (user) {
      fetchPlans();
      fetchMyCompany();
    }
  }, [user]);

  const handleApply = async (plan) => {
    try {
      await applyPlan(plan._id);

      toast({
        title: "Plan Applied Successfully",
        status: "success",
      });

      fetchMyCompany(); // ✅ VERY IMPORTANT
    } catch (err) {
      toast({
        title:
          err?.response?.data?.message || err?.message || "Error applying plan",
        status: "error",
      });
    }
  };

  const activePlanId = myCompany?.subscription?.planId?._id;

  const filteredPlans = plans
    .filter((p) => p.planName.toLowerCase().includes(search.toLowerCase()))
    .map((p, index) => ({
      _id: p._id,
      "#": index + 1,
      Name: p.planName,
      Price: p.price,
      Cycle: p.billingCycle,
      original: p,

      // ✅ CONTROL BUTTON STATE HERE
      isActive: activePlanId === p._id,
      onApply: handleApply,
    }));

  // ✅ Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const currentPlans = filteredPlans.slice(
    indexOfLastItem - itemsPerPage,
    indexOfLastItem,
  );

  // ✅ CREATE
  const handleCreate = () => {
    setEditData(null);
    onCreateOpen();
  };

  // ✅ EDIT
  const handleEdit = (row) => {
    setEditData(row.original);
    onCreateOpen();
  };

  // ✅ VIEW
  const handleView = (row) => {
    setSelectedPlan(row.original);
    onViewOpen();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this plan?")) return;

    try {
      await deletePlan(id);
      fetchPlans();

      toast({
        title: "Plan deleted",
        status: "success",
      });
    } catch {
      toast({
        title: "Delete failed",
        status: "error",
      });
    }
  };

  return (
    <Box p={4}>
      <Heading size="md" mb={4}>
        Subscription Plans
      </Heading>

      {/* Search + Filter */}
      <SearchAndFilter
        search={search}
        setSearch={setSearch}
        status={status}
        setStatus={setStatus}
        options={["All"]}
      />

      {/* Create Button */}
      {isSuperAdmin && (
        <Button colorScheme="green" mb={4} onClick={handleCreate}>
          + Create Plan
        </Button>
      )}

      {/* Table */}
      <TableComponent
        columns={["#", "Name", "Price", "Cycle"]}
        data={currentPlans}
        // ✅ SUPERADMIN ONLY
        onEdit={isSuperAdmin ? handleEdit : null}
        onDelete={isSuperAdmin ? handleDelete : null}
        // ✅ OWNER VIEW ALWAYS HAS VIEW
        onView={handleView}
        renderCell={(row, col) => {
          if (col === "Cycle" && !isSuperAdmin) {
            return (
              <>
                {row[col]}

                <Button
                  size="xs"
                  ml={2}
                  colorScheme={row.isActive ? "green" : "purple"}
                  isDisabled={row.isActive}
                  onClick={() => handleApply(row.original)}
                >
                  {row.isActive ? "Activated" : "Choose Plan"}
                </Button>
              </>
            );
          }

          return row[col];
        }}
      />

      {/* Pagination */}
      <Pagination
        totalItems={filteredPlans.length}
        itemsPerPage={itemsPerPage}
        setItemsPerPage={setItemsPerPage}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />

      {/* CREATE / EDIT MODAL */}
      <CreateSubscriptionPlanModal
        isOpen={isCreateOpen}
        onClose={onCreateClose}
        refreshPlans={fetchPlans}
        editData={editData}
      />

      {/* VIEW MODAL */}
      <Modal isOpen={isViewOpen} onClose={onViewClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Plan Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedPlan && (
              <Box>
                <p>
                  <b>Name:</b> {selectedPlan.planName}
                </p>
                <p>
                  <b>Billing Cycle:</b> {selectedPlan.billingCycle}
                </p>
                <p>
                  <b>Price:</b> {selectedPlan.price}
                </p>

                <Box mt={3}>
                  <b>Modules:</b>
                  {selectedPlan.modules?.map((m, i) => (
                    <Box key={i} ml={3}>
                      • {m.moduleName} : {m.limit}
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default SubscriptionPage;
