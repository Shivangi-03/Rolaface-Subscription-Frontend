import { useMemo } from "react";
import type { ReactNode } from "react";
import { ActionIcon, Alert, Badge, Button, Checkbox, Group, Menu, Paper, Select, Table, Text, TextInput } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconChevronDown, IconColumns3, IconEdit, IconSearch, IconStack2 } from "@tabler/icons-react";
import PageHeader from "../../../components/PageHeader";
import ListFooter from "../../../components/ListFooter";
import ProductBadges from "../../../components/ProductBadges";
import PlanFormModal from "../../../components/Subscription/Plan/PlanModal";
import { usePlans } from "../../../hooks/usePlans";
import { usePlanCatalog } from "../../../hooks/usePlanCatalog";
import { BILLING_LABEL, BILLING_SUFFIX, COLUMNS, PRICING_LABEL, formatMoney } from "./plan.constants";
import type { ColumnKey, Plan, ProductDef } from "../../../types/plan.types";
import AppAlert from "../../../utils/Alert";

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
    <Badge variant="light" color={p.status === "active" ? "green" : "yellow"}>
      {p.status === "active" ? "Active" : "Draft"}
    </Badge>
  ),
};

const Plans = ({ embedded = false }: { embedded?: boolean }) => {
  const { list, editing, visible, toggleColumn, openCreate, openEdit, closeModal, save } = usePlans();
  const catalog = usePlanCatalog(); 
  const columns = COLUMNS.filter((c) => visible.includes(c.key));

  const productOptions = useMemo(
    () => [
      { value: "all", label: "All Products" },
      ...catalog.products.map((p) => ({ value: p.code, label: p.name || p.code })),
    ],
    [catalog.products],
  );

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

      <Paper withBorder>
        <Group p="md" justify="space-between">
          <TextInput
            w={{ base: "100%", sm: 320 }}
            placeholder="Search by plan name, plan code, or module..."
            leftSection={<IconSearch size={16} />}
            value={list.filters.search}
            onChange={(e) => list.setFilter({ search: e.currentTarget.value })}
          />

          <Group gap="sm">
            <Select
              w={170}
              aria-label="Product"
              allowDeselect={false}
              value={list.filters.product}
              onChange={(v) => list.setFilter({ product: v ?? "all" })}
              data={productOptions}
              disabled={catalog.status === "loading"}
            />
            <Select
              w={120}
              aria-label="Status"
              allowDeselect={false}
              value={list.filters.status}
              onChange={(v) => list.setFilter({ status: v ?? "all" })}
              data={[
                { value: "all", label: "All Status" },
                { value: "active", label: "Active" },
                { value: "draft", label: "Draft" },
              ]}
            />

            <Menu closeOnItemClick={false} position="bottom-end">
              <Menu.Target>
                <Button variant="default" leftSection={<IconColumns3 size={16} />} rightSection={<IconChevronDown size={14} />}>
                  Columns ({visible.length})
                </Button>
              </Menu.Target>
              <Menu.Dropdown>
                {COLUMNS.map((c) => (
                  <Menu.Item
                    key={c.key}
                    onClick={() => toggleColumn(c.key)}
                    leftSection={<Checkbox size="xs" checked={visible.includes(c.key)} readOnly tabIndex={-1} />}
                  >
                    {c.label}
                  </Menu.Item>
                ))}
              </Menu.Dropdown>
            </Menu>

            <Button onClick={openCreate}>Add Plan</Button>
            <Button
              variant="default"
              onClick={() => notifications.show({ title: "Export", message: "Export will be available soon" })}
            >
              Export
            </Button>
          </Group>
        </Group>

        <Table.ScrollContainer minWidth={900}>
          <Table>
            <Table.Thead>
              <Table.Tr>
                {columns.map((c) => (
                  <Table.Th key={c.key}>{c.label}</Table.Th>
                ))}
                <Table.Th ta="right">Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {list.rows.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={columns.length + 1}>
                    <Text ta="center" c="dimmed" py="xl">
                      No plans found
                    </Text>
                  </Table.Td>
                </Table.Tr>
              ) : (
                list.rows.map((plan) => (
                  <Table.Tr key={plan.id}>
                    {columns.map((c) => (
                      <Table.Td key={c.key}>{CELLS[c.key](plan, catalog.products)}</Table.Td>
                    ))}
                    <Table.Td ta="right">
                      <ActionIcon variant="subtle" onClick={() => openEdit(plan)} aria-label={`Edit ${plan.name}`}>
                        <IconEdit size={18} />
                      </ActionIcon>
                    </Table.Td>
                  </Table.Tr>
                ))
              )}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>

        <ListFooter
          total={list.total}
          page={list.page}
          pageSize={list.pageSize}
          onPage={list.setPage}
          onPageSize={list.setPageSize}
        />
      </Paper>

      {editing && (
        <PlanFormModal
          key={editing === "new" ? "new" : editing.id}
          plan={editing === "new" ? null : editing}
          onSave={save}
          onClose={closeModal}
        />
      )}
    </>
  );
};

export default Plans;