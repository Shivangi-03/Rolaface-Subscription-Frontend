import { Group, Input, NumberInput, Paper, Radio, Select, SegmentedControl, SimpleGrid, Stack, Text } from "@mantine/core";
import CatalogGate from "../Plan/Cataloggate";
import { useCurrencySelect, withSelectOnFocus } from "../../../hooks/uselookupoptions";
import { BILLING_OPTIONS, calcRate, formatMoney } from "../../../views/Subscription/Plan/plan.constants";
import type { BillingFrequency, PlanCatalog, PlanForm, PricingModel } from "../../../types/plan.types";

interface Props {
  form: PlanForm;
  catalog: PlanCatalog;
}

const PricingTab = ({ form, catalog }: Props) => {
  const v = form.values;
  const perModule = v.pricingModel === "per_module";
  const selected = catalog.modules.filter((m) => v.modules.includes(m.id));
  const productName = (code: string) => catalog.products.find((p) => p.code === code)?.name ?? code;

  // currency: type karte hi API ko ?search= ke saath (debounced) call hoti hai
  const currency = useCurrencySelect(v.currency);

  return (
    <Stack gap="md">
      <Input.Wrapper label="Billing Frequency">
        <div>
          <SegmentedControl
            mt={4}
            value={v.billingFrequency}
            onChange={(val) => form.setFieldValue("billingFrequency", val as BillingFrequency)}
            data={BILLING_OPTIONS}
          />
        </div>
      </Input.Wrapper>

      <Radio.Group
        label="Pricing Model"
        value={v.pricingModel}
        onChange={(val) => form.setFieldValue("pricingModel", val as PricingModel)}
      >
        <SimpleGrid cols={{ base: 1, sm: 2 }} mt={4}>
          <Radio.Card value="flat" radius="md" p="sm">
            <Group justify="space-between" wrap="nowrap">
              <div>
                <Text fw={500}>Flat Subscription Rate</Text>
                <Text size="xs" c="dimmed">
                  Fixed rate covers all entitled modules
                </Text>
              </div>
              <Radio.Indicator />
            </Group>
          </Radio.Card>
          <Radio.Card value="per_module" radius="md" p="sm">
            <Group justify="space-between" wrap="nowrap">
              <div>
                <Text fw={500}>Per-Module Breakdown</Text>
                <Text size="xs" c="dimmed">
                  Dynamic sum calculated from active modules
                </Text>
              </div>
              <Radio.Indicator />
            </Group>
          </Radio.Card>
        </SimpleGrid>
      </Radio.Group>

      <SimpleGrid cols={{ base: 1, sm: 3 }}>
        <Select
          label="Currency"
          required
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
        <NumberInput
          label="Base Price"
          min={0}
          decimalScale={2}
          disabled={perModule}
          description={perModule ? "Calculated from module prices" : undefined}
          {...(perModule ? { value: calcRate(v) } : form.getInputProps("basePrice"))}
        />
        <NumberInput label="Setup / Onboarding Fee" min={0} decimalScale={2} {...form.getInputProps("setupFee")} />
      </SimpleGrid>

      {perModule && (
        <Stack gap="xs">
          <Group justify="space-between">
            <Text fw={600}>Module Pricing Allocation</Text>
            <Text size="sm" c="blue">
              Total: {formatMoney(calcRate(v), v.currency || "USD")}
            </Text>
          </Group>
          {form.errors.modulePrices && (
            <Text size="sm" c="red">
              {form.errors.modulePrices}
            </Text>
          )}

          <CatalogGate catalog={catalog} rows={2}>
            {selected.length === 0 && (
              <Text size="sm" c="dimmed">
                No modules selected. Choose modules in Modules & Features first.
              </Text>
            )}
            <SimpleGrid cols={{ base: 1, sm: 2 }}>
              {selected.map((m) => (
                <Paper key={m.id} withBorder p="sm">
                  <Group justify="space-between" wrap="nowrap">
                    <div>
                      <Text size="sm" fw={500}>
                        {m.name}{" "}
                        <Text span size="xs" c="dimmed">
                          ({productName(m.product)})
                        </Text>
                      </Text>
                      {(catalog.subModulesByModule[m.id]?.length ?? 0) > 0 && (
                        <Text size="xs" c="dimmed">
                          {catalog.subModulesByModule[m.id].length} sub-modules bundled
                        </Text>
                      )}
                    </div>
                    <NumberInput
                      w={110}
                      min={0}
                      decimalScale={2}
                      aria-label={`${m.name} price`}
                      value={v.modulePrices[m.id] ?? ""}
                      onChange={(val) => form.setFieldValue("modulePrices", { ...v.modulePrices, [m.id]: val })}
                      error={form.errors.modulePrices ? " " : undefined}
                    />
                  </Group>
                </Paper>
              ))}
            </SimpleGrid>
          </CatalogGate>
        </Stack>
      )}
    </Stack>
  );
};

export default PricingTab;