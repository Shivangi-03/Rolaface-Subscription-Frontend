import { Box, Divider, Group, Paper, Stack, Text } from "@mantine/core";
import { BILLING_LABEL, BILLING_SUFFIX, formatMoney } from "../../../views/Subscription/Plan/plan.constants";
import { GST_RATE, calcTotals, findCustomer, findPlan, formatDate, renewalText, trialText } from "../../../views/Subscription/CustomerSubscription/subscription.constants";
import type { Plan } from "../../../types/plan.types";
import type { SubscriptionFormValues } from "../../../types/subscription.types";

const EMPTY_PLANS: Plan[] = [];

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
  plans?: Plan[];
}

const SubscriptionSummary = ({ values: v, plans = EMPTY_PLANS }: Props) => {
  const customer = findCustomer(v.customerId);
  const plan = findPlan(plans, v.planId);
  const currency = plan?.currency ?? "USD";
  const t = calcTotals(plan, v.discount);
  const money = (n: number) => formatMoney(n, currency);

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
          <Text fw={600}>{plan?.name ?? "Not selected"}</Text>
        </div>

        <Divider />

        <div>
          <Heading>Billing</Heading>
          <Text fw={600}>
            {plan ? `${BILLING_LABEL[plan.billingFrequency]} • ${money(plan.price)} ${BILLING_SUFFIX[plan.billingFrequency]}` : "-"}
          </Text>
        </div>
        <Row label="Start Date:" value={formatDate(v.startDate)} />
        <Row label="Expiry Date:" value={formatDate(v.expiryDate)} />
        <Row label="Trial:" value={plan ? trialText(plan) : "-"} />
        <Row label="Renewal:" value={plan ? renewalText(plan) : "-"} />

        <Divider />

        <Row label="Subtotal:" value={money(t.subtotal)} />
        <Row label="Discount:" value={money(t.discount)} />
        <Row label={`Tax (${Math.round(GST_RATE * 100)}% GST):`} value={money(t.tax)} />

        <Divider />

        <Group justify="space-between">
          <Text fw={700}>TOTAL:</Text>
          <Text fw={700} size="xl" c="blue.8">
            {money(t.total)}
          </Text>
        </Group>
      </Stack>
    </Paper>
  );
};

export default SubscriptionSummary;