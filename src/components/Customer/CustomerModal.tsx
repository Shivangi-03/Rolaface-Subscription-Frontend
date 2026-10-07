import { useMemo } from "react";
import { Box, Checkbox, Group, Input, Paper, Select, SimpleGrid, TextInput } from "@mantine/core";
import { IconMapPin, IconUser, IconUsers, type Icon } from "@tabler/icons-react";
import AppModal, { AppModalFooter } from "../AppModal";
import AddressBlock from "./AddressBlock";
import { useCustomerForm } from "../../hooks/useCustomerForm";
import { useCurrencySelect, withSelectOnFocus } from "../../hooks/uselookupoptions";
import { CUSTOMER_TABS, mapDetailToForm, sanitizeCode, sanitizeDigits } from "../../views/Customer/customer.constants";
import type { CustomerDetail, CustomerFormValues, CustomerTab } from "../../types/customer.types";

const TAB_ICONS: Record<CustomerTab, Icon> = {
  details: IconUser,
  address: IconMapPin,
};

const TABS = CUSTOMER_TABS.map((t) => {
  const TabIcon = TAB_ICONS[t.value];
  return { ...t, icon: <TabIcon size={16} /> };
});

interface Props {
  customer: CustomerDetail | null; // null = create
  onSave: (values: CustomerFormValues) => Promise<void>;
  onClose: () => void;
}

const CustomerModal = ({ customer, onSave, onClose }: Props) => {
  const initial = useMemo(() => (customer ? mapDetailToForm(customer) : undefined), [customer]);
  const { form, tab, setTab, isLast, saving, next, reset, submit, requestClose } = useCustomerForm({
    initial,
    onSave,
    onClose,
  });
  const v = form.values;

  const currency = useCurrencySelect(v.currency);

  return (
    <AppModal
      size="60rem"
      icon={<IconUsers size={22} />}
      title={customer ? "Edit Customer" : "Add Customer"}
      subtitle={customer ? "Edit and manage customer information" : "Fill in the details to add a new customer"}
      onClose={requestClose}
      tabs={TABS}
      activeTab={tab}
      onTabChange={setTab}
      footer={
        <AppModalFooter
          onCancel={requestClose}
          onReset={reset}
          onNext={isLast ? undefined : next}
          onSubmit={submit}
          saving={saving}
          submitLabel={customer ? "Save Changes" : "Create Customer"}
        />
      }
    >
      <Box mih="min(400px, 60vh)">
        {tab === "details" && (
          <Paper withBorder p="md">
            <SimpleGrid cols={{ base: 1, sm: 2 }}>
              <TextInput label="Customer Name" withAsterisk placeholder="Enter full name" {...form.getInputProps("name")} />
              <Select
                label="Currency"
                withAsterisk
                searchable
                allowDeselect={false}
                autoComplete="off"
                placeholder="Search currency..."
                nothingFoundMessage={
                  currency.loading ? "Searching..." : currency.error ? "Couldn't load currencies" : "No currency found"
                }
                data={currency.options}
                filter={({ options }) => options}
                onSearchChange={currency.setSearch}
                {...withSelectOnFocus(form.getInputProps("currency"))}
              />
              <TextInput
                label="Email"
                type="email"
                withAsterisk
                placeholder="email@example.com"
                {...form.getInputProps("email")}
              />
              <Input.Wrapper label="Phone No" withAsterisk error={form.errors.mobileCode ?? form.errors.mobileNumber}>
                <Group gap="xs" wrap="nowrap" mt={4} align="flex-start">
                  <TextInput
                    w={90}
                    aria-label="Country code"
                    placeholder="+1"
                    inputMode="tel"
                    value={v.mobileCode}
                    onChange={(e) => form.setFieldValue("mobileCode", sanitizeCode(e.currentTarget.value))}
                    error={!!form.errors.mobileCode}
                  />
                  <TextInput
                    flex={1}
                    aria-label="Phone number"
                    placeholder="Enter number"
                    inputMode="numeric"
                    value={v.mobileNumber}
                    onChange={(e) => form.setFieldValue("mobileNumber", sanitizeDigits(e.currentTarget.value))}
                    error={!!form.errors.mobileNumber}
                  />
                </Group>
              </Input.Wrapper>
              <TextInput
                label="Website"
                withAsterisk
                placeholder="https://example.com"
                {...form.getInputProps("website")}
              />
            </SimpleGrid>
          </Paper>
        )}

        {tab === "address" && (
          <SimpleGrid cols={{ base: 1, md: 2 }}>
            <AddressBlock form={form} name="billing" title="Billing Address" subtitle="Invoice and payment details" />
            <AddressBlock
              form={form}
              name="shipping"
              title="Shipping Address"
              subtitle="Delivery location"
              mirrorOf={v.sameAsBilling ? v.billing : undefined}
              headerRight={<Checkbox label="Same as billing" {...form.getInputProps("sameAsBilling", { type: "checkbox" })} />}
            />
          </SimpleGrid>
        )}
      </Box>
    </AppModal>
  );
};

export default CustomerModal;