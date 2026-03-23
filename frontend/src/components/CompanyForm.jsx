import {
  VStack,
  FormControl,
  FormLabel,
  Input,
  Text,
  Button,
  Select,
} from "@chakra-ui/react";

const CompanyForm = ({
  form,
  setForm,
  readOnly = false,
  onSubmit,
  showOwner = false,
}) => {
  const handleChange = (e) => {
    if (readOnly) return;
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <VStack spacing={3} align="start">
      <FormControl>
        <FormLabel>Company Name</FormLabel>
        <Input
          name="name"
          value={form.name || ""}
          onChange={handleChange}
          isReadOnly={readOnly}
        />
      </FormControl>

      <FormControl>
        <FormLabel>Address</FormLabel>
        <Input
          name="address"
          value={form.address || ""}
          onChange={handleChange}
          isReadOnly={readOnly}
        />
      </FormControl>

      <FormControl>
        <FormLabel>Phone</FormLabel>
        <Input
          name="phone"
          value={form.phone || ""}
          onChange={handleChange}
          isReadOnly={readOnly}
        />
      </FormControl>

      <FormControl>
        <FormLabel>Website</FormLabel>
        <Input
          name="website"
          value={form.website || ""}
          onChange={handleChange}
          isReadOnly={readOnly}
        />
      </FormControl>

      <FormControl>
        <FormLabel>Description</FormLabel>
        <Input
          name="description"
          value={form.description || ""}
          onChange={handleChange}
          isReadOnly={readOnly}
        />
      </FormControl>

      <FormControl>
        <FormLabel>Status</FormLabel>
        <Select
          name="isActive"
          value={form.isActive ? "Active" : "Inactive"}
          onChange={(e) =>
            setForm({ ...form, isActive: e.target.value === "Active" })
          }
          isDisabled={readOnly}
        >
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </Select>
      </FormControl>

      {showOwner && (
        <>
          <FormControl>
            <FormLabel>Owner Name</FormLabel>
            <Input
              name="ownerName"
              value={form.ownerName || ""}
              onChange={handleChange}
              isReadOnly={readOnly}
            />
          </FormControl>

          <FormControl>
            <FormLabel>Owner Email</FormLabel>
            <Input
              name="ownerEmail"
              value={form.ownerEmail || ""}
              onChange={handleChange}
              isReadOnly={readOnly}
            />
          </FormControl>
        </>
      )}

      {!readOnly && onSubmit && (
        <Button colorScheme="blue" w="full" onClick={onSubmit}>
          Save
        </Button>
      )}
    </VStack>
  );
};

export default CompanyForm;
