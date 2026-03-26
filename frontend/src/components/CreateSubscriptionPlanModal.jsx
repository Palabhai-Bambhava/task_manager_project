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
  Input,
  Select,
  VStack,
  HStack,
  IconButton,
  useToast,
} from "@chakra-ui/react";
import { createPlan, updatePlan, getModules } from "../services/api";

import { useState, useEffect } from "react";
import { AddIcon, DeleteIcon } from "@chakra-ui/icons";

const CreateSubscriptionPlanModal = ({
  isOpen,
  onClose,
  refreshPlans,
  editData,
}) => {
  const toast = useToast();

  const [form, setForm] = useState({
    planName: "",
    billingCycle: "Monthly",
    price: "",
    modules: [],
  });

  const [moduleOptions, setModuleOptions] = useState([]);

  // ✅ Fetch modules from backend
  useEffect(() => {
    const fetchModules = async () => {
      try {
        const res = await getModules();
        setModuleOptions(res.data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchModules();
  }, []);

  // ✅ Prefill for edit
  useEffect(() => {
    if (editData) {
      setForm({
        planName: editData.planName || "",
        billingCycle: editData.billingCycle || "Monthly",
        price: editData.price || "",
        modules: editData.modules || [],
      });
    } else {
      setForm({
        planName: "",
        billingCycle: "Monthly",
        price: "",
        modules: [],
      });
    }
  }, [editData]);

  // ✅ Add module row
  const addModule = () => {
    setForm({
      ...form,
      modules: [...form.modules, { moduleName: "", limit: "" }],
    });
  };

  // ✅ Update module
  const updateModule = (index, field, value) => {
    const updated = [...form.modules];
    updated[index][field] = value;
    setForm({ ...form, modules: updated });
  };

  // ✅ Remove module
  const removeModule = (index) => {
    const updated = form.modules.filter((_, i) => i !== index);
    setForm({ ...form, modules: updated });
  };

  // ✅ Submit
  const handleSubmit = async () => {
    if (!form.planName.trim()) {
      toast({ title: "Plan name required", status: "error" });
      return;
    }

    try {
      // ✅ CLEAN MODULES (IMPORTANT FIX)
      const cleanedModules = form.modules
        .filter((m) => m.moduleName && m.limit)
        .map((m) => ({
          moduleName: m.moduleName,
          limit: Number(m.limit), // ✅ convert to number
        }));

      const payload = {
        planName: form.planName,
        billingCycle: form.billingCycle,
        price: Number(form.price), // ✅ convert price
        modules: cleanedModules,
      };

      if (editData) {
        await updatePlan(editData._id, payload);
        toast({ title: "Plan updated", status: "success" });
      } else {
        await createPlan(payload);
        toast({ title: "Plan created", status: "success" });
      }

      refreshPlans();
      onClose();
    } catch (err) {
      console.error(err.response?.data || err.message);
      toast({ title: "Error saving plan", status: "error" });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {editData ? "Edit Subscription Plan" : "Create Subscription Plan"}
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          {/* Plan Name */}
          <FormControl mb={3} isRequired>
            <FormLabel>Plan Name</FormLabel>
            <Input
              value={form.planName}
              onChange={(e) => setForm({ ...form, planName: e.target.value })}
            />
          </FormControl>

          {/* Billing Cycle */}
          <FormControl mb={3}>
            <FormLabel>Billing Cycle</FormLabel>
            <Select
              value={form.billingCycle}
              onChange={(e) =>
                setForm({ ...form, billingCycle: e.target.value })
              }
            >
              <option value="Monthly">Monthly</option>
              <option value="Quarterly">Quarterly</option>
              <option value="Half-Yearly">Half-Yearly</option>
              <option value="Yearly">Yearly</option>
            </Select>
          </FormControl>

          {/* Price */}
          <FormControl mb={3}>
            <FormLabel>Price</FormLabel>
            <Input
              type="number"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />
          </FormControl>

          {/* Modules */}
          <FormControl mb={3}>
            <FormLabel>Modules</FormLabel>

            <VStack spacing={3} align="stretch">
              {form.modules.map((mod, index) => {
                const selectedModules = form.modules.map((m) => m.moduleName);

                return (
                  <HStack key={index}>
                    {/* ✅ MODULE DROPDOWN */}
                    <Select
                      placeholder="Select Module"
                      value={mod.moduleName}
                      onChange={(e) =>
                        updateModule(index, "moduleName", e.target.value)
                      }
                    >
                      {moduleOptions.map((module) => (
                        <option
                          key={module.name}
                          value={module.name}
                          disabled={
                            selectedModules.includes(module.name) &&
                            module.name !== mod.moduleName
                          }
                        >
                          {module.label}
                        </option>
                      ))}
                    </Select>

                    {/* ✅ LIMIT */}
                    <Input
                      placeholder="Limit"
                      type="number"
                      value={mod.limit}
                      onChange={(e) =>
                        updateModule(index, "limit", e.target.value)
                      }
                    />

                    {/* DELETE */}
                    <IconButton
                      icon={<DeleteIcon />}
                      colorScheme="red"
                      onClick={() => removeModule(index)}
                    />
                  </HStack>
                );
              })}

              {/* ADD MODULE */}
              <Button
                leftIcon={<AddIcon />}
                onClick={addModule}
                isDisabled={form.modules.length >= moduleOptions.length}
              >
                Add Module
              </Button>
            </VStack>
          </FormControl>
        </ModalBody>

        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={handleSubmit}>
            {editData ? "Update" : "Create"}
          </Button>
          <Button onClick={onClose}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CreateSubscriptionPlanModal;
