import { Suspense, lazy } from "react";
import type { ReactNode } from "react";
import { useSearchParams } from "react-router-dom";
import { Box, LoadingOverlay, Tabs } from "@mantine/core";
import { IconStack2, IconUserCheck } from "@tabler/icons-react";
import PageHeader from "../../components/PageHeader";

const Plans = lazy(() => import("./Plan/Plan"));
const Subscriptions = lazy(() => import("./CustomerSubscription/CustomerSubscription"));

type SubscriptionTab = "plans" | "subscriptions";

const TABS: { value: SubscriptionTab; label: string; icon: ReactNode }[] = [
  { value: "plans", label: "Plans", icon: <IconStack2 size={16} /> },
  { value: "subscriptions", label: "Subscriptions", icon: <IconUserCheck size={16} /> },
];

const isTab = (v: string | null): v is SubscriptionTab => v === "plans" || v === "subscriptions";

const Subscription = () => {
  const [params, setParams] = useSearchParams();
  const raw = params.get("tab");
  const tab: SubscriptionTab = isTab(raw) ? raw : "plans";

  return (
    <>
      <PageHeader
        icon={<IconStack2 size={24} />}
        title="Subscription"
        subtitle="Manage plans, pricing schedules and module entitlements"
      />

      <Tabs
        value={tab}
        onChange={(value) => {
          if (isTab(value)) setParams({ tab: value });
        }}
        variant="pills"
        mb="md"
      >
        <Tabs.List>
          {TABS.map((t) => (
            <Tabs.Tab key={t.value} value={t.value} leftSection={t.icon}>
              {t.label}
            </Tabs.Tab>
          ))}
        </Tabs.List>
      </Tabs>

      <Suspense
        fallback={
          <Box pos="relative" h={240}>
            <LoadingOverlay visible overlayProps={{ backgroundOpacity: 0 }} />
          </Box>
        }
      >
        {/* embedded = skip the page's own header, this wrapper already shows it */}
        {tab === "plans" ? <Plans embedded /> : <Subscriptions embedded />}
      </Suspense>
    </>
  );
};

export default Subscription;