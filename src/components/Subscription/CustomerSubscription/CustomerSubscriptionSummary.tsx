import { Box, Divider, Group, Paper, Stack, Text } from "@mantine/core";
import { formatMoney, num } from "../../../views/Subscription/Plan/plan.constants";
import { formatDate } from "../../../views/Subscription/CustomerSubscription/subscription.constants";
import type { CustomerOption, PlanDetail, SubscriptionFormValues } from "../../../types/subscription.types";

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

const Heading = ({ children }: { children: string }) => (
  <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
    {children}
  </Text>
);

interface Props {
  values: SubscriptionFormValues;
plan: PlanDetail | null;
customers: CustomerOption[];
}

const SubscriptionSummary = ({ values: v, plan, customers }: Props) => {
const customer = customers.find((c) => c.id === v.customerId);
const subtotal = plan?.base_price ?? 0;
const discount = Math.min(Math.max(num(v.discount), 0), subtotal);
const total = subtotal - discount;
const money = (n: number) => formatMoney(n, plan?.currency);

  return (
    <Paper withBorder style={{ overflow: "hidden" }}>
      <Box p="md" bg="var(--mantine-primary-color-filled)" c="white">
        <Text fw={700} size="lg">
          Subscription Summary
        </Text>
      </Box>

      <Stack p="md" gap="sm">
        <div>
          <Heading>Customer</Heading>
          <Text fw={600}>{customer?.name ?? "Not selected"}</Text>
        </div>
        <div>
          <Heading>Plan</Heading>
          <Text fw={600}>{plan?.plan_name ?? "Not selected"}</Text>
        </div>

        <Divider />


        <Row label="Start Date:" value={formatDate(v.startDate)} />
        <Row label="Expiry Date:" value={formatDate(v.expiryDate)} />
      <Row label="Trial:" value={plan ? (plan.trial_enabled ? `${plan.trial_days} Days Free Trial` : "No Trial") : "-"} />

        <Divider />

       <Row label="Subtotal:" value={money(subtotal)} />
<Row label="Discount:" value={money(discount)} />

        <Divider />

        <Group justify="space-between">
          <Text fw={700}>TOTAL:</Text>
          <Text fw={700} size="xl" c="blue.8">
           {money(total)}
          </Text>
        </Group>
      </Stack>
    </Paper>
  );
};

export default SubscriptionSummary;