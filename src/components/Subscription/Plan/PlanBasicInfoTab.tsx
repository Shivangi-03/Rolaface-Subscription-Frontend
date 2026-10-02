import { Badge, Checkbox, Group, Input, NumberInput, SegmentedControl, SimpleGrid, Stack, Text, TextInput, Textarea } from "@mantine/core";
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

  return (
    <Stack gap="md">
      <Input.Wrapper label="Products" required error={form.errors.products}>
        <div style={{ marginTop: 4 }}>
          <CatalogGate catalog={catalog} rows={1} rowHeight={72}>
            <SimpleGrid cols={{ base: 1, sm: Math.min(Math.max(catalog.products.length, 1), 3) }}>
              {catalog.products.map((p) => {
                const checked = form.values.products.includes(p.code);
                return (
                  <Checkbox.Card key={p.code} radius="md" p="sm" checked={checked} onClick={() => toggleProduct(p.code, !checked)}>
                    <Group wrap="nowrap" align="flex-start">
                      <Checkbox.Indicator />
                      <div>
                        <Badge variant="light" color={p.color} mb={4}>
                          {p.code}
                        </Badge>
                        <Text size="sm">{p.name}</Text>
                        {p.description && (
                          <Text size="xs" c="dimmed">
                            {p.description}
                          </Text>
                        )}
                      </div>
                    </Group>
                  </Checkbox.Card>
                );
              })}
            </SimpleGrid>
          </CatalogGate>
        </div>
      </Input.Wrapper>

      <SimpleGrid cols={{ base: 1, sm: 3 }}>
        <TextInput
          label="Plan Name"
          placeholder="e.g. Enterprise Core & Lending Bundle"
          required
          maxLength={100}
          style={{ gridColumn: "span 1" }}
          {...form.getInputProps("name")}
        />
        <TextInput label="Plan Code" placeholder="Custom or auto-generated" maxLength={40} {...form.getInputProps("code")} />
        <NumberInput label="User Limit" placeholder="e.g. 25" min={1} allowDecimal={false} {...form.getInputProps("userLimit")} />
      </SimpleGrid>

      <Textarea
        label="Description"
        placeholder="Short description of what this plan includes"
        minRows={4}
        autosize
        maxLength={500}
        {...form.getInputProps("description")}
      />

      <Input.Wrapper label="Publishing Status">
        <div>
          <SegmentedControl
            mt={4}
            value={form.values.status}
            onChange={(v) => form.setFieldValue("status", v as "draft" | "active")}
            data={[
              { value: "draft", label: "Draft (Hidden)" },
              { value: "active", label: "Active (Live)" },
            ]}
          />
        </div>
      </Input.Wrapper>
    </Stack>
  );
};

export default BasicInfoTab;