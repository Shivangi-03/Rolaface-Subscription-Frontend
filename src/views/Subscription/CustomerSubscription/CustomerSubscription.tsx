import type { ReactNode } from "react";
import { ActionIcon, Badge, Button, Checkbox, Group, Menu, Paper, Select, Table, Text, TextInput } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconChevronDown, IconColumns3, IconEdit, IconSearch, IconStack2 } from "@tabler/icons-react";
import PageHeader from "../../../components/PageHeader";
import ListFooter from "../../../components/ListFooter";
import ProductBadges from "../../../components/ProductBadges";
import SubscriptionFormModal from "../../../components/Subscription/CustomerSubscription/CustomerSubscriptionModal";
import { useSubscriptions } from "../../../hooks/useSubscriptions";
import { formatMoney } from "../../../views/Subscription/Plan/plan.constants";
import { COLUMNS, STATUS_COLOR, STATUS_OPTIONS, findCustomer, findPlan, formatDate } from "./subscription.constants";
import type { Subscription, SubscriptionColumnKey } from "../../../types/subscription.types";

const CELLS: Record<SubscriptionColumnKey, (s: Subscription) => ReactNode> = {
  number: (s) => (
    <Text size="sm" fw={600} ff="monospace">
      {s.number}
    </Text>
  ),
  customer: (s) => {
    const c = findCustomer(s.values.customerId);
    return (
      <>
        <Text fw={600}>{c?.name ?? "-"}</Text>
        <Text size="xs" c="dimmed">
          {c?.company}
        </Text>
      </>
    );
  },
  plan: (s) => {
    const p = findPlan(s.values.planId);
    return (
      <>
        <Text size="sm" mb={4}>
          {p?.name ?? "-"}
        </Text>
        {p && <ProductBadges products={p.products} />}
      </>
    );
  },
  period: (s) => (
    <>
      <Text size="sm">{formatDate(s.values.startDate)}</Text>
      <Text size="xs" c="dimmed">
        to {formatDate(s.values.expiryDate)}
      </Text>
    </>
  ),
  total: (s) => <Text fw={700}>{formatMoney(s.total, findPlan(s.values.planId)?.currency ?? "USD")}</Text>,
  status: (s) => (
    <Badge variant="light" color={STATUS_COLOR[s.status]} tt="capitalize">
      {s.status}
    </Badge>
  ),
};

const Subscriptions = ({ embedded = false }: { embedded?: boolean }) => {
  const { list, numbers, editing, visible, toggleColumn, openCreate, openEdit, closeModal, save } = useSubscriptions();
  const columns = COLUMNS.filter((c) => visible.includes(c.key));

  return (
    <>
       {!embedded && (
        <PageHeader
          icon={<IconStack2 size={24} />}
          title="Subscription"
          subtitle="Manage plans, pricing schedules and module entitlements"
        />
      )}
      
      <Paper withBorder>
        <Group p="md" justify="space-between">
          <TextInput
            w={{ base: "100%", sm: 340 }}
            placeholder="Search by subscription no., customer, or plan..."
            leftSection={<IconSearch size={16} />}
            value={list.filters.search}
            onChange={(e) => list.setFilter({ search: e.currentTarget.value })}
          />

          <Group gap="sm">
            <Select
              w={130}
              aria-label="Status"
              allowDeselect={false}
              value={list.filters.status}
              onChange={(v) => list.setFilter({ status: v ?? "all" })}
              data={STATUS_OPTIONS}
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

            <Button onClick={openCreate}>Add Subscription</Button>
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
                      No subscriptions found
                    </Text>
                  </Table.Td>
                </Table.Tr>
              ) : (
                list.rows.map((s) => (
                  <Table.Tr key={s.id}>
                    {columns.map((c) => (
                      <Table.Td key={c.key}>{CELLS[c.key](s)}</Table.Td>
                    ))}
                    <Table.Td ta="right">
                      {s.status !== "cancelled" && (
                        <ActionIcon variant="subtle" onClick={() => openEdit(s)} aria-label={`Edit ${s.number}`}>
                          <IconEdit size={18} />
                        </ActionIcon>
                      )}
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
        <SubscriptionFormModal
          key={editing === "new" ? "new" : editing.id}
          subscription={editing === "new" ? null : editing}
          numbers={numbers}
          onSave={save}
          onClose={closeModal}
        />
      )}
    </>
  );
};

export default Subscriptions;