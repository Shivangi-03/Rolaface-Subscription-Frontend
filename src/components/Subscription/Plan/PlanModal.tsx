import { useEffect } from "react";
import { ActionIcon, Box, Button, Grid, Group, Modal, ScrollArea, Tabs, Text, ThemeIcon } from "@mantine/core";
import { IconBox, IconInfoCircle, IconMinus, IconRefresh, IconStack2, IconWallet, type Icon } from "@tabler/icons-react";
import { useModalStore } from "../../../store/modalstore";
import PlanSummary from "./PlanSummaryPanel";
import BasicInfoTab from "./PlanBasicInfoTab";
import ModulesTab from "./PlanModulesTab";
import PricingTab from "./PlanPricingTab";
import TrialTab from "./PlanTrialRenewalTab";
import { usePlanForm } from "../../../hooks/usePlanForm";
import { usePlanCatalog } from "../../../hooks/usePlanCatalog";
import { PLAN_TABS } from "../../../views/Subscription/Plan/plan.constants";
import type { Plan, PlanTab } from "../../../types/plan.types";

const TAB_ICONS: Record<PlanTab, Icon> = {
  basic: IconInfoCircle,
  modules: IconBox,
  pricing: IconWallet,
  trial: IconRefresh,
};

interface Props {
   modalId: string;
  plan: Plan | null;

  onClose: () => void;
}

const PlanFormModal = ({ plan, modalId, onClose }: Props) => {
  const catalog = usePlanCatalog();
  const minimized = useModalStore((s) => s.modals.find((m) => m.id === modalId)?.minimized ?? false);
  const minimizeModal = useModalStore((s) => s.minimizeModal);
  const { form, tab, setTab, isLast, saving, next, reset, submit, requestClose } = usePlanForm({
     initial: plan?.values,
    onClose,
    isEdit: !!plan,
    planId: plan?.id,
  });

 
  useEffect(() => {
    if (!plan || catalog.status !== "success") return;
    const productCodes = new Set(catalog.products.map((p) => p.code));
    const moduleIds = new Set(catalog.modules.map((m) => m.id));
    const v = form.values;

    const products = v.products.filter((p) => productCodes.has(p));
    const modules = v.modules.filter((m) => moduleIds.has(m));
    if (products.length === v.products.length && modules.length === v.modules.length) return;

    const modulePrices = Object.fromEntries(Object.entries(v.modulePrices).filter(([id]) => moduleIds.has(id)));
    const cleaned = { ...v, products, modules, modulePrices };
    form.setInitialValues(cleaned);
    form.setValues(cleaned);
  }, [catalog.status, catalog.products, catalog.modules, plan]);

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
            <IconStack2 size={22} />
          </ThemeIcon>
          <div>
            <Text fw={700} size="lg" lh={1.2}>
              {plan ? "Edit Plan" : "Add Plan"}
            </Text>
            <Text size="sm" opacity={0.85}>
                           Set up products, modules, pricing, billing, and renewal rules.
            </Text>
          </div>
          <ActionIcon variant="subtle" c="white" ml="auto" aria-label="Minimize" onClick={() => minimizeModal(modalId)}>
            <IconMinus size={18} />
          </ActionIcon>
        </Group>
      }
    >
      <Tabs value={tab} onChange={(v) => v && setTab(v as PlanTab)} px="lg" pt="xs">
        <Tabs.List>
          {PLAN_TABS.map((t) => {
            const TabIcon = TAB_ICONS[t.value];
            return (
              <Tabs.Tab key={t.value} value={t.value} leftSection={<TabIcon size={16} />}>
                {t.label}
              </Tabs.Tab>
            );
          })}
        </Tabs.List>
      </Tabs>

     <Grid p="md" gutter="md">
        <Grid.Col span={{ base: 12, md: 8 }}>
                    <ScrollArea.Autosize mah="calc(100vh - 360px)" mih={200} type="auto" offsetScrollbars>
            {tab === "basic" && <BasicInfoTab form={form} catalog={catalog} />}
            {tab === "modules" && <ModulesTab form={form} catalog={catalog} />}
            {tab === "pricing" && <PricingTab form={form} catalog={catalog} />}
            {tab === "trial" && <TrialTab form={form} />}
                   </ScrollArea.Autosize>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 4 }}>
          <PlanSummary values={form.values} catalog={catalog} />
        </Grid.Col>
      </Grid>

      <Box p="md" style={{ borderTop: "1px solid var(--mantine-color-default-border)" }}>
        <Group justify="space-between">
          <Button variant="default" onClick={requestClose} disabled={saving}>
            Cancel
          </Button>
          <Group gap="sm">
            <Button color="red" onClick={reset} disabled={saving}>
              Reset
            </Button>
            {!isLast && (
              <Button variant="default" onClick={next}>
                Next
              </Button>
            )}
            <Button onClick={submit} loading={saving} disabled={catalog.status !== "success"}>
              {plan ? "Save Changes" : "Create Plan"}
            </Button>
          </Group>
        </Group>
      </Box>
    </Modal>
  );
};

export default PlanFormModal;