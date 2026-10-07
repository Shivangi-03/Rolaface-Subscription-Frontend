import type { ReactNode } from "react";
import { Group, Paper, Select, SimpleGrid, Stack, Text, TextInput } from "@mantine/core";
import { useCountryOptions, withSelectOnFocus } from "../../hooks/uselookupoptions";
import type { AddressValues, CustomerForm } from "../../types/customer.types";

interface Props {
  form: CustomerForm;
  name: "billing" | "shipping";
  title: string;
  subtitle: string;
  mirrorOf?: AddressValues;
  headerRight?: ReactNode;
}

const AddressBlock = ({ form, name, title, subtitle, mirrorOf, headerRight }: Props) => {
  const field = (key: keyof AddressValues) =>
    mirrorOf ? { value: mirrorOf[key], disabled: true, readOnly: true } : form.getInputProps(`${name}.${key}`);

  const country = field("country");
  const countries = useCountryOptions(country.value);

  return (
    <Paper withBorder p="sm">
      <Group justify="space-between" align="flex-start" mb="sm">
        <div>
          <Text fw={700}>{title}</Text>
          <Text size="sm" c="dimmed">
            {subtitle}
          </Text>
        </div>
        {headerRight}
      </Group>

      <Stack gap="xs">
        <TextInput label="Line 1" withAsterisk {...field("line1")} />
        <TextInput label="Line 2" {...field("line2")} />
        <SimpleGrid cols={2} spacing="sm" verticalSpacing="xs">
          <TextInput label="City / Town" withAsterisk {...field("city")} />
          <TextInput label="State / Province" withAsterisk {...field("state")} />
          <Select
            label="Country"
            withAsterisk
            searchable
            allowDeselect={false}
            autoComplete="off"
            maxDropdownHeight={200}
            comboboxProps={{ position: "bottom-start", middlewares: { flip: false, shift: true } }}
            placeholder={countries.loading ? "Loading countries..." : "Select country"}
            nothingFoundMessage={countries.error ? "Couldn't load countries" : "No country found"}
            data={countries.options}
            {...withSelectOnFocus(country)}
            value={country.value || null}
          />
          <TextInput label="Postal Code" {...field("postalCode")} />
        </SimpleGrid>
      </Stack>
    </Paper>
  );
};

export default AddressBlock;