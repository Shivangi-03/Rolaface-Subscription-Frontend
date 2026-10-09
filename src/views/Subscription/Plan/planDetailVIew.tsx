import {  useEffect, useMemo, useState, type ReactNode } from "react";
import {
  ActionIcon, Badge, Box, Button, Center, Group, Loader, Paper, Progress,
  SimpleGrid, Stack, Text, ThemeIcon,
} from "@mantine/core";
import {
  IconX, IconPencil, IconCash,
    IconFileText, IconPackage, IconCalendar, IconCheck, 
} from "@tabler/icons-react";
import { getPlanById } from "../../../api/planAPi"; 
import { formatMoney } from "./plan.constants";

interface PlanModule {
  name: string;
  product: string;
  price: number;
  module_name: string;
  module: string;
  currency: string;
}

interface PlanDetail {
  name: string;
  plan_name: string;
  description?: string;
  products: string[];
  billing_cycles: number;
  billing_frequency: string;
  user_limit: number;
  status: string;
  setup_fee: number;
  pricing_model: string;
  trial_enabled: number;
  trial_days: number;
  currency: string;
  base_price: number;
  renewal_mode: string;
  creation: string;
  modified: string;
  modules: PlanModule[];
}

interface Props {
  planId: string | number;
  onBack: () => void;
  onEdit?: () => void;
}

const PRODUCT_COLORS = ["blue", "grape", "teal", "orange", "pink", "cyan"];
const BORDER = "1px solid var(--mantine-color-default-border)";

const fmtDate = (raw?: string | null): string => {
  if (!raw) return "—";
  const d = new Date(raw.replace(" ", "T"));
  return isNaN(d.getTime())
    ? raw
    : d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

const Label = ({ children }: { children: ReactNode }) => (
  <Text size="10px" fw={700} c="dimmed" tt="uppercase" lts="0.06em">
    {children}
  </Text>
);

const KpiCard = ({
  icon, label, value, color,
}: { icon: ReactNode; label: string; value?: string | null; color: string }) => (
  <Paper
    withBorder
    radius="lg"
    p="md"
    style={{ transition: "transform .15s, box-shadow .15s", cursor: "default" }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = "translateY(-2px)";
      e.currentTarget.style.boxShadow = "var(--mantine-shadow-md)";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = "none";
      e.currentTarget.style.boxShadow = "none";
    }}
  >
    <Group gap="sm" wrap="nowrap">
      <ThemeIcon variant="light" color={color} size={42} radius="md">
        {icon}
      </ThemeIcon>
      <Box miw={0}>
        <Label>{label}</Label>
        <Text size="sm" fw={700} truncate>{value || "—"}</Text>
      </Box>
    </Group>
  </Paper>
);

const SectionTitle = ({ icon, title, right }: { icon: ReactNode; title: string; right?: ReactNode }) => (
  <Group justify="space-between" px="md" py="sm" style={{ borderBottom: BORDER }}>
    <Group gap="xs">
      {icon}
      <Text size="xs" fw={700} tt="uppercase" lts="0.06em">{title}</Text>
    </Group>
    {right}
  </Group>
);

const DataRow = ({ label, value, mono }: { label: string; value?: string | null; mono?: boolean }) => (
  <Group justify="space-between" wrap="nowrap" px="md" py="xs" style={{ borderBottom: BORDER }}>
    <Label>{label}</Label>
    <Text size="sm" fw={600} ff={mono ? "monospace" : undefined} ta="right" truncate>
      {value || "—"}
    </Text>
  </Group>
);

const PlanDetailView = ({ planId, onBack, onEdit }: Props) => {
  const [plan, setPlan] = useState<PlanDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getPlanById(planId)
      .then((res: any) => setPlan(res?.data ?? res ?? null))
      .catch((e: any) => setError(e?.message ?? "Failed to load plan"))
      .finally(() => setLoading(false));
  }, [planId]);

  const modulesByProduct = useMemo(() => {
    const map: Record<string, PlanModule[]> = {};
    (plan?.modules ?? []).forEach((m) => {
      (map[m.product] ??= []).push(m);
    });
    return map;
  }, [plan]);

  if (loading) {
    return (
      <Center h={300}>
        <Loader size="sm" />
      </Center>
    );
  }

  if (error || !plan) {
    return (
      <Center h={300}>
        <Stack align="center" gap="xs">
          <Text size="sm" c="dimmed">{error ?? "Plan not found"}</Text>
          <Button variant="default" size="xs" onClick={onBack}>Back</Button>
        </Stack>
      </Center>
    );
  }

  const isActive = plan.status?.toLowerCase() === "active";
  const trialText = plan.trial_enabled ? `${plan.trial_days} Days` : "None";
  const totalModules = plan.modules?.length ?? 0;

  return (
    <Box style={{ background: "var(--mantine-color-gray-0)", minHeight: "calc(100vh - 80px)" }}>
      {/* HEADER */}
      <Paper
        withBorder
        radius="lg"
        mx="md"
        mt="md"
        px="md"
        py="sm"
        style={{ background: "white" }}
      >
        <Group justify="space-between" align="center" wrap="nowrap">
          <Group gap="sm" wrap="nowrap">
            <ActionIcon variant="default" size="lg" radius="md" onClick={onBack} aria-label="Close">
              <IconX size={16} />
            </ActionIcon>

            <ThemeIcon
              variant="default"
              size={40}
              radius="xl"
              style={{ border: "1.5px solid var(--mantine-primary-color-filled)" }}
            >
              <Text fw={700} size="sm" c="var(--mantine-primary-color-filled)">
                {(plan.plan_name ?? "?").charAt(0).toUpperCase()}
              </Text>
            </ThemeIcon>

            <Box>
              <Group gap="xs" mb={2}>
                <Text fw={700} size="md">{plan.plan_name}</Text>
                <Badge variant="light" color={isActive ? "green" : "gray"} size="sm">
                  {plan.status}
                </Badge>
              </Group>
              <Group gap="md">
                <Group gap={4}>
                  <IconCalendar size={13} color="var(--mantine-color-dimmed)" />
                  <Text size="xs" c="dimmed">Added {fmtDate(plan.creation)}</Text>
                </Group>
              </Group>
            </Box>
          </Group>

          <Group gap="lg" wrap="nowrap">
            <Box
              ta="right"
              visibleFrom="sm"
              pl="lg"
              style={{ borderLeft: BORDER }}
            >
              
            </Box>
            {onEdit && (
              <Button variant="default" size="xs" leftSection={<IconPencil size={14} />} onClick={onEdit}>
                Edit
              </Button>
            )}
          </Group>
        </Group>
      </Paper>

      <Stack gap="md" p="md">
     

         {/* PLAN DETAILS + PRICE DETAILS (side by side) */}
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md" style={{ alignItems: "start" }}>
          <Paper withBorder radius="lg" style={{ overflow: "hidden" }}>
            <SectionTitle icon={<IconFileText size={15} color="var(--mantine-color-blue-6)" />} title="Plan Details" />
            <DataRow label="Plan Name" value={plan.plan_name} />
            <DataRow label="Description" value={plan.description || "—"} />
            <DataRow label="Currency" value={plan.currency} />
            <DataRow label="Status" value={plan.status} />
          </Paper>

          <Paper withBorder radius="lg" style={{ overflow: "hidden" }}>
            <SectionTitle icon={<IconCash size={15} color="var(--mantine-color-teal-6)" />} title="Price Details" />
            <DataRow label="Base Price" value={`${formatMoney(plan.base_price, plan.currency)} / ${plan.billing_frequency}`} />
            <DataRow label="Setup Fee" value={formatMoney(plan.setup_fee, plan.currency)} />
            <DataRow label="Pricing Model" value={plan.pricing_model} />
            <DataRow label="User Limit" value={String(plan.user_limit)} />
            <DataRow label="Trial" value={trialText} />
          </Paper>
        </SimpleGrid>

        {/* MODULES */}
        <Paper withBorder radius="lg" style={{ overflow: "hidden" }}>
          <SectionTitle
            icon={<IconPackage size={15} color="var(--mantine-color-teal-6)" />}
            title="Included Modules"
            right={<Badge variant="light" color="teal">{totalModules} total</Badge>}
          />
          <Stack gap="lg" p="md">
            {totalModules === 0 && (
              <Text size="sm" c="dimmed" fs="italic">No modules assigned</Text>
            )}
            {Object.entries(modulesByProduct).map(([product, mods], idx) => {
              const color = PRODUCT_COLORS[idx % PRODUCT_COLORS.length];
              const share = totalModules ? (mods.length / totalModules) * 100 : 0;
              return (
                <Box key={product}>
                  <Group justify="space-between" mb={6}>
                    <Group gap="xs">
                      <Badge color={color} variant="filled" radius="sm">{product}</Badge>
                      <Text size="xs" c="dimmed" fw={600}>
                        {mods.length} module{mods.length > 1 ? "s" : ""}
                      </Text>
                    </Group>
                  </Group>
                  <Progress value={share} color={color} size={3} mb="sm" />
                                    <SimpleGrid cols={{ base: 2, sm: 3, lg: 4, xl: 6 }} spacing="xs">
                    {mods.map((m) => (
                      <Paper
                                              radius="md"
                        p="xs"
                        withBorder
                        style={{
                          borderLeft: `3px solid var(--mantine-color-${color}-6)`,
                          transition: "box-shadow .15s",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "var(--mantine-shadow-sm)")}
                        onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
                      >
                        <Group justify="space-between" wrap="nowrap">
                                                    <Group gap="xs" wrap="nowrap" miw={0}>
                            <ThemeIcon variant="light" color={color} size={22} radius="xl">
                              <IconCheck size={12} />
                            </ThemeIcon>
                            <Box miw={0}>
                              <Text size="xs" fw={600} truncate>{m.module_name}</Text>
                              <Text size="9px" c="dimmed" ff="monospace" truncate>{m.module}</Text>
                            </Box>
                          </Group>
                          
                        </Group>
                      </Paper>
                    ))}
                  </SimpleGrid>
                </Box>
              );
            })}
          </Stack>
        </Paper>
      </Stack>
    </Box>
  );
};

export default PlanDetailView;