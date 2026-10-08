import {
  Badge, Box, Button, Divider, Grid, Group, Modal, NumberInput, Paper, ScrollArea,
  ActionIcon, LoadingOverlay, Select, SimpleGrid, Stack, Text, TextInput, Textarea, ThemeIcon,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { IconCalendar, IconLock, IconMinus, IconUserCheck } from "@tabler/icons-react";
import SubscriptionSummary from "./CustomerSubscriptionSummary";
import { useModalStore } from "../../../store/modalstore";
import { useSubscriptionLookups } from "../../../hooks/useSubscriptionLooksups";
import { useSubscriptionForm } from "../../../hooks/useSubscriptionForm";
import { formatMoney } from "../../../views/Subscription/Plan/plan.constants";
import type { PlanDetail, SubscriptionDetail } from "../../../types/subscription.types";

const DATE_DISPLAY = "DD-MMM-YYYY";


const Label = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
      {label}
    </Text>
    {children}
  </div>
);

const PlanDetails = ({ plan, loading }: { plan: PlanDetail | null; loading: boolean }) => (
  <Paper withBorder p="sm" pos="relative">
    <LoadingOverlay visible={loading} />
    <Group gap="sm" mb="xs">
      <ThemeIcon variant="light" size={32} radius="md">
        <IconLock size={16} />
      </ThemeIcon>
      <Text fw={700} tt="uppercase">
        Plan Details
      </Text>
    </Group>
    <Divider mb="sm" />

    {!plan ? (
      <Text size="sm" c="dimmed">
        Select a plan to see its price, trial, renewal and entitled modules.
      </Text>
    ) : (
      <Stack gap="sm">
        <SimpleGrid cols={{ base: 1, sm: 3 }}>
          <Label label="Price">
            <Text fw={700} size="lg">
              {formatMoney(plan.base_price, plan.currency)}{" "}
              <Text span size="sm" c="dimmed" fw={400}>
                / {plan.billing_frequency}
              </Text>
            </Text>
          </Label>
          <Label label="Trial Period">
            <Text fw={600} c="blue">
              {plan.trial_enabled ? `${plan.trial_days} Days Free Trial` : "No Trial"}
            </Text>
          </Label>
          <Label label="Renewal Mode">
            <Text fw={600} c="green">
              {plan.renewal_mode === "Auto-renew" ? "Auto-renew" : `Fixed ${plan.billing_cycles} Cycles`}
            </Text>
          </Label>
        </SimpleGrid>

        <div>
          <Text size="sm" fw={500} mb={4}>
            Entitled Products & Modules
          </Text>
          <SimpleGrid cols={{ base: 1, sm: 2 }}>
            {plan.products.map((code) => {
              const mods = plan.modules.filter((m) => m.product === code);
              return (
                <Paper key={code} withBorder p="xs">
                  <Group justify="space-between" wrap="nowrap" mb={4}>
                    <Badge variant="light">{code}</Badge>
                    <Badge variant="light" color="blue">
                      {mods.length} Modules
                    </Badge>
                  </Group>
                  <Text size="xs" c="dimmed">
                    {mods.map((m) => m.module_name).join(", ")}
                  </Text>
                </Paper>
              );
            })}
          </SimpleGrid>
        </div>
      </Stack>
    )}
  </Paper>
);

interface Props {
  subscription: SubscriptionDetail | null;
  modalId: string;
  onClose: () => void;
}

const SubscriptionFormModal = ({ subscription, modalId, onClose }: Props) => {
  const { form, number, saving, plan, planLoading, setPlan, setStart, submit, requestClose } = useSubscriptionForm({
    subscription,
    onClose,
  });
  const { plans, customers } = useSubscriptionLookups();
  const minimized = useModalStore((s) => s.modals.find((m) => m.id === modalId)?.minimized ?? false);
  const minimizeModal = useModalStore((s) => s.minimizeModal);
  const v = form.values;

  const planOptions = plans.map((p) => ({ value: p.name, label: p.plan_name }));
  if (subscription && !planOptions.some((o) => o.value === subscription.plan)) {
    planOptions.push({ value: subscription.plan, label: subscription.plan_name });
  }
  const customerOptions = customers.map((c) => ({ value: c.id, label: `${c.name} (${c.id})` }));
  if (subscription && !customerOptions.some((o) => o.value === subscription.customer)) {
    customerOptions.push({ value: subscription.customer, label: `${subscription.customer_name} (${subscription.customer})` });
  }

  return (
    <Modal
      opened={!minimized}
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
        <Group gap="sm" wrap="nowrap" w="100%">
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
          <ActionIcon variant="subtle" c="white" ml="auto" aria-label="Minimize" onClick={() => minimizeModal(modalId)}>
            <IconMinus size={18} />
          </ActionIcon>
        </Group>
      }
    >
      <Grid p="md" gutter="md">
        <Grid.Col span={{ base: 12, md: 8 }}>
          <ScrollArea.Autosize mah="70vh" offsetScrollbars>
            <Stack gap="sm">
              {/* Customer · Plan · Subscription number (no card) */}
              <SimpleGrid cols={{ base: 1, sm: 3 }}>
                <Select
                  label="Customer"
                  required
                  searchable
                  placeholder="Select customer"
                  data={customerOptions}
                  disabled={!!subscription}
                  {...form.getInputProps("customerId")}
                />
                <Select
                  label="Choose Plan"
                  required
                  searchable
                  placeholder="Select plan"
                  disabled={!!subscription}
                  nothingFoundMessage="No active plans found"
                  data={planOptions}
                  value={v.planId || null}
                  onChange={setPlan}
                  error={form.errors.planId}
                />
                <TextInput label="Subscription Number" value={number || "Auto-generated"} disabled />
              </SimpleGrid>

              {/* Only this section keeps its card */}
              <PlanDetails plan={plan} loading={planLoading} />

              {/* Dates · Discount · Description (no card) */}
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
                label="Description"
                placeholder="Add any operational or commercial contract notes..."
                minRows={2}
                autosize
                maxLength={500}
                {...form.getInputProps("notes")}
              />
            </Stack>
          </ScrollArea.Autosize>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 4 }}>
          <SubscriptionSummary values={v} plan={plan} customers={customers} />
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