import { Badge, Box, Checkbox, Group, Input, NumberInput, Stack, Text, TextInput, Textarea, useMatches } from "@mantine/core";
import CatalogGate from "../Plan/Cataloggate";
import type { PlanCatalog, PlanForm, ProductCode } from "../../../types/plan.types";

interface Props {
  form: PlanForm;
  catalog: PlanCatalog;
}

const BasicInfoTab = ({ form, catalog }: Props) => {
  const toggleProduct = (code: ProductCode, checked: boolean) => {
    const { products, modules } = form.values;
    const ids = catalog.modules.filter((m) => m.product === code).map((m) => m.id);
    form.setFieldValue("products", checked ? [...products, code] : products.filter((p) => p !== code));
    form.setFieldValue("modules", checked ? Array.from(new Set([...modules, ...ids])) : modules.filter((m) => !ids.includes(m)));
  };

  const fieldColumns = useMatches({
    base: "minmax(0, 1fr)",
    sm: "minmax(0, 2fr) minmax(0, 1fr)",
  });

  return (
    <Stack gap="md">
      <Input.Wrapper label="Products" required error={form.errors.products}>
        <div style={{ marginTop: 4 }}>
          <CatalogGate catalog={catalog} rows={1} rowHeight={72}>
            <Group gap="xs" wrap="nowrap" align="stretch">
              {catalog.products.map((p) => {
                const checked = form.values.products.includes(p.code);
                return (
                  <Checkbox.Card key={p.code} radius="md" p="xs" style={{ flex: "1 1 0", minWidth: 0 }} checked={checked} onClick={() => toggleProduct(p.code, !checked)}>
                    <Group wrap="nowrap" align="flex-start" gap="xs">
                      <Checkbox.Indicator />
                      <div>
                        <Badge variant="light" color={p.color} mb={4}>
                          {p.code}
                        </Badge>
                        <Text size="xs" truncate>{p.name}</Text>
                        {p.description && (
                          <Text size="xs" c="dimmed" lineClamp={2}>
                            {p.description}
                          </Text>
                        )}
                      </div>
                    </Group>
                  </Checkbox.Card>
                );
              })}
            </Group>
          </CatalogGate>
        </div>
      </Input.Wrapper>

      <Box
        style={{
          display: "grid",
          gridTemplateColumns: fieldColumns,
          gap: "var(--mantine-spacing-md)",
          alignItems: "start",
        }}
      >
        <TextInput
          label="Plan Name"
          placeholder="e.g. Enterprise Core & Lending Bundle"
          required
          maxLength={100}
          {...form.getInputProps("name")}
        />
        <NumberInput label="User Limit" placeholder="e.g. 25" min={1} allowDecimal={false} {...form.getInputProps("userLimit")} />
      </Box>

      <Textarea
        label="Description"
        placeholder="Short description of what this plan includes"
        minRows={4}
        autosize
        maxLength={500}
        {...form.getInputProps("description")}
      />
    </Stack>
  );
};

export default BasicInfoTab;