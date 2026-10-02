import {
  Badge, Box, Button, Divider, Grid, Group, Modal, NumberInput, Paper, ScrollArea,
  Select, SimpleGrid, Stack, Text, TextInput, Textarea, ThemeIcon,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { IconCalendar, IconLock, IconUserCheck } from "@tabler/icons-react";
import SubscriptionSummary from "./CustomerSubscriptionSummary";
import { useSubscriptionForm } from "../../../hooks/useSubscriptionForm";
import { BILLING_SUFFIX, formatMoney } from "../../../views/Subscription/Plan/plan.constants";
import type { Plan, PlanCatalog } from "../../../types/plan.types";
import {
  CUSTOMERS, activePlans, entitlements, findPlan, renewalText, trialText,
} from "../../../views/Subscription/CustomerSubscription/subscription.constants";
import type { Subscription, SubscriptionFormValues } from "../../../types/subscription.types";

const DATE_DISPLAY = "DD-MMM-YYYY";

type Catalog = Pick<PlanCatalog, "products" | "modules">;

const EMPTY_PLANS: Plan[] = [];
const EMPTY_CATALOG: Catalog = { products: [], modules: [] };

const Label = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
      {label}
    </Text>
    {children}
  </div>
);

const PlanDetails = ({ plan, catalog }: { plan: Plan | undefined; catalog: Catalog }) => (
  <Paper withBorder p="md">
    <Group gap="sm" mb="sm">
      <ThemeIcon variant="light" size={36} radius="md">
        <IconLock size={18} />
      </ThemeIcon>
      <Text fw={700} tt="uppercase">
        Plan Details
      </Text>
    </Group>
    <Divider mb="md" />

    {!plan ? (
      <Text size="sm" c="dimmed">
        Select a plan to see its price, trial, renewal and entitled modules.
      </Text>
    ) : (
      <Stack gap="md">
        <SimpleGrid cols={{ base: 1, sm: 3 }}>
          <Label label="Price">
            <Text fw={700} size="lg">
              {formatMoney(plan.price, plan.currency)}{" "}
              <Text span size="sm" c="dimmed" fw={400}>
                {BILLING_SUFFIX[plan.billingFrequency]}
              </Text>
            </Text>
          </Label>
          <Label label="Trial Period">
            <Text fw={600} c="blue">
              {trialText(plan)}
            </Text>
          </Label>
          <Label label="Renewal Mode">
            <Text fw={600} c="green">
              {renewalText(plan)}
            </Text>
          </Label>
        </SimpleGrid>

        <div>
          <Text size="sm" fw={500} mb={6}>
            Entitled Products & Module Counts
          </Text>
          <SimpleGrid cols={{ base: 1, sm: 2 }}>
            {entitlements(plan, catalog.products, catalog.modules).map((e) => (
              <Paper key={e.code} withBorder p="sm">
                <Group justify="space-between" wrap="nowrap">
                  <Group gap="xs" wrap="nowrap">
                    <Badge variant="light" color={e.color}>
                      {e.code}
                    </Badge>
                    <Text size="sm">{e.name}</Text>
                  </Group>
                  <Badge variant="light" color="blue">
                    {e.selected} / {e.total} Modules
                  </Badge>
                </Group>
              </Paper>
            ))}
          </SimpleGrid>
        </div>
      </Stack>
    )}
  </Paper>
);

interface Props {
  subscription: Subscription | null; 
  numbers: string[];
  plans?: Plan[];
  catalog?: Catalog; 
  onSave: (values: SubscriptionFormValues, number: string) => void;
  onClose: () => void;
}

const SubscriptionFormModal = ({
  subscription,
  numbers,
  plans = EMPTY_PLANS,
  catalog = EMPTY_CATALOG,
  onSave,
  onClose,
}: Props) => {
  const { form, number, saving, setPlan, setStart, submit, requestClose } = useSubscriptionForm({
    subscription,
    numbers,
    onSave,
    onClose,
  });
  const v = form.values;

  const active = activePlans(plans);
  const current = findPlan(plans, v.planId);
  const planOptions = (current && !active.includes(current) ? [...active, current] : active).map((p) => ({
    value: p.id,
    label: p.name,
  }));

  return (
    <Modal
      opened
      onClose={requestClose}
      centered
      size="70rem"
      padding={0}
      radius="lg"
      closeOnClickOutside={false}
      closeButtonProps={{ c: "white", variant: "subtle" }}
      styles={{
        header: { background: "var(--mantine-primary-color-filled)", color: "white", padding: "16px 20px" },
        title: { flex: 1 },
      }}
      title={
        <Group gap="sm" wrap="nowrap">
          <ThemeIcon size={40} variant="white" color="gray" radius="md">
            <IconUserCheck size={22} />
          </ThemeIcon>
          <div>
            <Text fw={700} size="lg" lh={1.2}>
              {subscription ? "Edit Subscription" : "Add Subscription"}
            </Text>
            <Text size="sm" opacity={0.85}>
              Assign customer & plan.
            </Text>
          </div>
        </Group>
      }
    >
      <Grid p="lg" gutter="lg">
        <Grid.Col span={{ base: 12, md: 8 }}>
          <ScrollArea.Autosize mah="65vh" offsetScrollbars>
            <Stack gap="md">
              <Paper withBorder p="md">
                <SimpleGrid cols={{ base: 1, sm: 3 }}>
                  <Select
                    label="Customer"
                    required
                    searchable
                    placeholder="Select customer"
                    data={CUSTOMERS.map((c) => ({ value: c.id, label: `${c.name} (${c.company})` }))}
                    {...form.getInputProps("customerId")}
                  />
                  <Select
                    label="Choose Plan"
                    required
                    searchable
                    placeholder="Select plan"
                    nothingFoundMessage="No active plans found"
                    data={planOptions}
                    value={v.planId || null}
                    onChange={setPlan}
                    error={form.errors.planId}
                  />
                  <TextInput label="Subscription Number" value={number} disabled />
                </SimpleGrid>
              </Paper>

              <PlanDetails plan={current} catalog={catalog} />

              <Paper withBorder p="md">
                <Stack gap="md">
                  <SimpleGrid cols={{ base: 1, sm: 3 }}>
                    <DateInput
                      label="Start Date"
                      required
                      valueFormat={DATE_DISPLAY}
                      rightSection={<IconCalendar size={16} />}
                      value={v.startDate || null}
                      onChange={setStart}
                      error={form.errors.startDate}
                    />
                    <DateInput
                      label="Expiry / Renewal Date"
                      required
                      valueFormat={DATE_DISPLAY}
                      rightSection={<IconCalendar size={16} />}
                      minDate={v.startDate || undefined}
                      value={v.expiryDate || null}
                      onChange={(d) => form.setFieldValue("expiryDate", d ?? "")}
                      error={form.errors.expiryDate}
                    />
                    <NumberInput
                      label="Discount Amount"
                      placeholder="0"
                      min={0}
                      decimalScale={2}
                      {...form.getInputProps("discount")}
                    />
                  </SimpleGrid>
                  <Textarea
                    label="Subscription Notes / Commercial Terms"
                    placeholder="Add any operational or commercial contract notes..."
                    minRows={4}
                    autosize
                    maxLength={500}
                    {...form.getInputProps("notes")}
                  />
                </Stack>
              </Paper>
            </Stack>
          </ScrollArea.Autosize>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 4 }}>
          <SubscriptionSummary values={v} plans={plans} />
        </Grid.Col>
      </Grid>

      <Box p="md" style={{ borderTop: "1px solid var(--mantine-color-default-border)" }}>
        <Group justify="space-between">
          <Button variant="default" onClick={requestClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={submit} loading={saving}>
            {subscription ? "Save Changes" : "Create Subscription"}
          </Button>
        </Group>
      </Box>
    </Modal>
  );
};

export default SubscriptionFormModal;