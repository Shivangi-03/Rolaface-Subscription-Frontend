
import type { ReactNode } from "react";
import { ActionIcon, Badge, Button, Group, Menu, Text } from "@mantine/core";
import { IconDots, IconDownload, IconEdit, IconStack2 } from "@tabler/icons-react";
import PageHeader from "../../../components/PageHeader";
import DataTable, { type Column } from "../../../components/table";
import ProductBadges from "../../../components/ProductBadges";
import { usePlans } from "../../../hooks/usePlans";
import { usePlanCatalog } from "../../../hooks/usePlanCatalog";
import { BILLING_LABEL, BILLING_SUFFIX, COLUMNS, PRICING_LABEL, formatMoney } from "./plan.constants";
import type { ColumnKey, Plan, ProductDef } from "../../../types/plan.types";
import AppAlert from "../../../utils/Alert";
import { usePlansExport } from "../../../hooks/usePlanExport";

const CELLS: Record<ColumnKey, (p: Plan, products: ProductDef[]) => ReactNode> = {
  name: (p) => (
    <>
      <Text fw={600}>{p.name}</Text>
      <Text size="xs" c="dimmed" ff="monospace">
        #{p.code}
      </Text>
    </>
  ),
  product: (p, products) => <ProductBadges products={p.products} catalog={products} />,
  billing: (p) => (
    <>
      <Text size="sm">{BILLING_LABEL[p.billingFrequency]}</Text>
      <Text size="xs" c="dimmed">
        {PRICING_LABEL[p.pricingModel]}
      </Text>
    </>
  ),
  price: (p) => (
    <Text fw={700}>
      {formatMoney(p.price, p.currency)}{" "}
      <Text span size="xs" c="dimmed" fw={400}>
        {BILLING_SUFFIX[p.billingFrequency]}
      </Text>
    </Text>
  ),
  trial: (p) => <Text size="sm">{p.trialDays ? `${p.trialDays} Days` : "None"}</Text>,
  status: (p) => (
  <Badge
    variant="light"
    color={p.status === "active" ? "green" : p.status === "inactive" ? "gray" : "yellow"}
  >
    {p.status}
  </Badge>
),
};

const Plans = ({ embedded = false }: { embedded?: boolean }) => {
const { list, openCreate, openEdit, busyId, changeStatus, loading } = usePlans();
  const catalog = usePlanCatalog(); 
  const columns: Column<Plan>[] = [
    ...COLUMNS.map((c) => ({
      key: c.key,
      header: c.label,
      render: (p: Plan) => CELLS[c.key](p, catalog.products),
    })),
    {
      key: "actions",
      header: "Actions",
      width: 120,
      align: "right",
      render: (plan: Plan) => (
        <Group gap={4} justify="flex-end" wrap="nowrap">
          <ActionIcon variant="subtle" loading={busyId === plan.id} onClick={() => openEdit(plan)} aria-label={`Edit ${plan.name}`}>
            <IconEdit size={18} />
          </ActionIcon>
          <Menu position="bottom-end" withinPortal>
            <Menu.Target>
              <ActionIcon variant="subtle" color="gray" aria-label={`More actions for ${plan.name}`}>
                <IconDots size={18} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item color={plan.status === "active" ? "orange" : "green"} onClick={() => changeStatus(plan)}>
                {plan.status === "active" ? "Set Inactive" : "Set Active"}
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      ),
    },
  ];

  const exp = usePlansExport(list.filters.search);
  return (
    <>
      {!embedded && (
  <PageHeader
    icon={<IconStack2 size={24} />}
    title="Subscription"
    subtitle="Manage plans, pricing schedules and module entitlements"
  />
)}

     {catalog.status === "error" && (
  <AppAlert title="Couldn't load products" message={catalog.error?.message ?? "Something went wrong."} onRetry={catalog.reload} mb="md" />
)}

      <DataTable
        columns={columns}
        data={list.rows}
        rowKey={(r) => r.id}
        loading={loading}
        height="calc(100vh - 160px)"
        minWidth={900}
        emptyMessage="No plans found"
        searchValue={list.filters.search}
        searchPlaceholder="Search by plan name, plan code, or module..."
        onSearch={(q) => list.setFilter({ search: q })}
        enableAdd
        addLabel="Add Plan"
        onAdd={openCreate}
        primaryAction={
                  <Button
            variant="default"
            leftSection={<IconDownload size={16} />}
            onClick={exp.exportAll}
            loading={exp.exporting}
            disabled={loading || list.total === 0}
          >
            Export
          </Button>
        }
        page={list.page}
        pageSize={list.pageSize}
        totalItems={list.total}
        onPageChange={list.setPage}
        onPageSizeChange={list.setPageSize}
      />
    
    </>
  );
};

export default Plans;