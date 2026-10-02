import type { ReactNode } from "react";
import { Group, Paper, SimpleGrid, Stack, Text, TextInput } from "@mantine/core";
import type { AddressValues, CustomerForm } from "../../types/customer.types";

interface Props {
  form: CustomerForm;
  name: "billing" | "shipping";
  title: string;
  subtitle: string;
  /** When set, fields are read-only and show these values (shipping "same as billing") */
  mirrorOf?: AddressValues;
  headerRight?: ReactNode;
}

const AddressBlock = ({ form, name, title, subtitle, mirrorOf, headerRight }: Props) => {
  const field = (key: keyof AddressValues) =>
    mirrorOf ? { value: mirrorOf[key], disabled: true, readOnly: true } : form.getInputProps(`${name}.${key}`);

  return (
    <Paper withBorder p="md">
      <Group justify="space-between" align="flex-start" mb="md">
        <div>
          <Text fw={700}>{title}</Text>
          <Text size="sm" c="dimmed">
            {subtitle}
          </Text>
        </div>
        {headerRight}
      </Group>

      <Stack gap="sm">
        <TextInput label="Line 1" withAsterisk {...field("line1")} />
        <TextInput label="Line 2" {...field("line2")} />
        <SimpleGrid cols={2}>
          <TextInput label="City / Town" withAsterisk {...field("city")} />
          <TextInput label="State / Province" withAsterisk {...field("state")} />
          <TextInput label="Country" withAsterisk {...field("country")} />
          <TextInput label="Postal Code" {...field("postalCode")} />
        </SimpleGrid>
      </Stack>
    </Paper>
  );
};

export default AddressBlock;