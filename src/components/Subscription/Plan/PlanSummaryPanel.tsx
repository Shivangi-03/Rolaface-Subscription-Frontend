import { useMemo } from "react";
import { Badge, Box, Divider, Group, Paper, Stack, Text } from "@mantine/core";
import ProductBadges from "../../ProductBadges";
import { BILLING_SUFFIX, PRICING_LABEL, calcRate, formatMoney, generateCode, num } from "../../../views/Subscription/Plan/plan.constants";
import type { ModuleDef, PlanFormValues, ProductDef } from "../../../types/plan.types";

const Row = ({ label, value }: { label: string; value: string }) => (
  <Group justify="space-between">
    <Text size="sm" c="dimmed">
      {label}
    </Text>
    <Text size="sm" fw={500}>
      {value}
    </Text>
  </Group>
);

type Catalog = { products: ProductDef[]; modules: ModuleDef[] };
const EMPTY_CATALOG: Catalog = { products: [], modules: [] }; 
interface Props {
  values: PlanFormValues;
  catalog?: Catalog; 
}

const PlanSummary = ({ values: v, catalog = EMPTY_CATALOG }: Props) => {
  const code = v.code.trim() || generateCode(v.products);
  const rate = calcRate(v);

  const counts = useMemo(() => {
    const selectedIds = new Set(v.modules);
    const map: Record<string, { total: number; selected: number }> = {};
    for (const m of catalog.modules) {
      const c = (map[m.product] ??= { total: 0, selected: 0 });
      c.total += 1;
      if (selectedIds.has(m.id)) c.selected += 1;
    }
    return map;
  }, [catalog.modules, v.modules]);

  return (
    <Paper withBorder style={{ overflow: "hidden" }}>
      <Box p="md" bg="var(--mantine-primary-color-filled)" c="white">
        <Group justify="space-between" mb="xs">
          <Badge variant="white" color="gray">
            Summary
          </Badge>
          <Badge variant="light" color={v.status === "active" ? "green" : "yellow"}>
            {v.status === "active" ? "Active" : "Draft"}
          </Badge>
        </Group>
        <Text fw={700} size="lg" truncate>
          {v.name.trim() || "Untitled Plan"}
        </Text>
        {v.products.length > 0 && (
          <Group gap="xs" mt={6}>
            <ProductBadges products={v.products} catalog={catalog.products} />
            <Text size="xs" ff="monospace">
              #{code}
            </Text>
          </Group>
        )}
      </Box>

      <Stack p="md" gap="sm">
        <div>
          <Text size="sm" c="dimmed">
            Estimated rate
          </Text>
          <Text fw={700} size="xl">
            {formatMoney(rate, v.currency )}{" "}
            <Text span size="sm" c="dimmed" fw={400}>
              {BILLING_SUFFIX[v.billingFrequency]}
            </Text>
          </Text>
          <Text size="sm">Setup fee: {formatMoney(num(v.setupFee), v.currency)}</Text>
        </div>

        <Group justify="space-between">
          <Text size="sm" c="dimmed">
            Selected products
          </Text>
          <Text size="sm" c="blue">
            {v.modules.length} modules total
          </Text>
        </Group>

        {catalog.products.map((p) => {
          const { total = 0, selected = 0 } = counts[p.code] ?? {};
          const on = v.products.includes(p.code);
          return (
            <Group key={p.code} justify="space-between" p="xs" bg="gray.0" style={{ borderRadius: 8 }}>
              <Badge variant="light" color={p.color}>
                {p.code}
              </Badge>
              <Text size="sm" c={on ? "blue" : "dimmed"}>
                {on ? `${selected} / ${total} Modules` : "Not selected"}
              </Text>
            </Group>
          );
        })}

        <Divider />
        <Row label="User Limit" value={v.userLimit === "" ? "Not set" : String(v.userLimit)} />
        <Row label="Trial Period" value={v.freeTrial ? `${num(v.trialDays)} Days` : "No Trial"} />
        <Row label="Renewal Mode" value={v.renewalMode === "auto" ? "Auto-renew" : `Fixed (${num(v.cycles)} cycles)`} />
        <Row label="Pricing Model" value={PRICING_LABEL[v.pricingModel]} />
      </Stack>
    </Paper>
  );
};

export default PlanSummary;