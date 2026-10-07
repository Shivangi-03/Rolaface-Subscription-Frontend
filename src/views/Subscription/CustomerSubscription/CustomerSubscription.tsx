import type { ReactNode } from "react";
import { ActionIcon, Badge, Button, Checkbox, Group, Menu, Select, Text } from "@mantine/core";
import { IconBan, IconChevronDown, IconColumns3, IconDotsVertical, IconEdit, IconStack2 } from "@tabler/icons-react";
import { notifyInfo } from "../../../utils/Alert";
import PageHeader from "../../../components/PageHeader";
import DataTable, { type Column } from "../../../components/table";
import CancelSubscriptionModal from "../../../components/Subscription/CustomerSubscription/cancelSubscriptionModal";
import SubscriptionFormModal from "../../../components/Subscription/CustomerSubscription/CustomerSubscriptionModal";
import { useSubscriptions } from "../../../hooks/useSubscriptions";
import { formatMoney } from "../../../views/Subscription/Plan/plan.constants";
import { COLUMNS, STATUS_OPTIONS, formatDate, statusColor } from "./subscription.constants";
import type { ApiSubscription, SubscriptionColumnKey } from "../../../types/subscription.types";

const CELLS: Record<SubscriptionColumnKey, (s: ApiSubscription) => ReactNode> = {
  number: (s) => (
    <Text size="sm" fw={600} ff="monospace">
          {s.name}
    </Text>
  ),
  customer: (s) => (
    <>
      <Text fw={600}>{s.customer_name}</Text>
      <Text size="xs" c="dimmed">
        {s.customer}
      </Text>
    </>
  ),
  plan: (s) => (
    <>
      <Text size="sm">{s.plan_name}</Text>
      <Text size="xs" c="dimmed">
        {s.billing_frequency} · {s.renewal_mode}
      </Text>
    </>
  ),
  period: (s) => (
    <>
      <Text size="sm">{formatDate(s.current_period_start)}</Text>
      <Text size="xs" c="dimmed">
        to {formatDate(s.current_period_end)}
      </Text>
    </>
  ),
  total: (s) => <Text fw={700}>{formatMoney(s.grand_total, s.currency)}</Text>,
  status: (s) => (
    <Badge variant="light" color={statusColor(s.status)} tt="capitalize">
      {s.status}
    </Badge>
  ),
};

const Subscriptions = ({ embedded = false }: { embedded?: boolean }) => {
  const { list, numbers, plans, customers, editing, visible, toggleColumn, openCreate, openEdit, opening, closeModal, save, cancelTarget, cancelling, openCancel, closeCancel, confirmCancel } = useSubscriptions();
  const columns: Column<ApiSubscription>[] = [
    ...COLUMNS.filter((c) => visible.includes(c.key)).map((c) => ({
      key: c.key,
      header: c.label,
      render: CELLS[c.key],
    })),
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (s) =>
                s.status.toLowerCase() !== "cancelled" ? (
                      <Group gap={4} justify="flex-end" wrap="nowrap">
            <ActionIcon
              variant="subtle"
              loading={opening === s.name}
              onClick={() => openEdit(s)}
              aria-label={`Edit ${s.name}`}
            >
              <IconEdit size={18} />
            </ActionIcon>
            <Menu position="bottom-end" withinPortal>
              <Menu.Target>
                <ActionIcon variant="subtle" aria-label={`More actions for ${s.name}`}>
                  <IconDotsVertical size={18} />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item color="red" leftSection={<IconBan size={16} />} onClick={() => openCancel(s)}>
                  Cancel
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        ) : null,
    },
  ];

  return (
    <>
       {!embedded && (
        <PageHeader
          icon={<IconStack2 size={24} />}
          title="Subscription"
          subtitle="Manage plans, pricing schedules and module entitlements"
        />
      )}
            <DataTable<ApiSubscription>
        columns={columns}
        data={list.rows}
        rowKey={(s) => s.name}
        loading={list.loading}
        emptyMessage="No subscriptions found"
        height="calc(100vh - 160px)"
        searchValue={list.filters.search}
        searchPlaceholder="Search by subscription no., customer, or plan..."
        onSearch={(q) => list.setFilter({ search: q })}
        enableAdd
        addLabel="Add Subscription"
        onAdd={openCreate}
        filters={
          <>
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
            <Button
              variant="default"
              onClick={() => notifyInfo("Export will be available soon", "Export")}
            >
              Export
            </Button>
          </>
        }
        page={list.page}
        pageSize={list.pageSize}
        totalItems={list.total}
        onPageChange={list.setPage}
        onPageSizeChange={list.setPageSize}
      />

            {cancelTarget && (
        <CancelSubscriptionModal
          key={cancelTarget.name}
          subscription={cancelTarget}
          loading={cancelling}
          onConfirm={confirmCancel}
          onClose={closeCancel}
        />
      )}

      {editing && (
        <SubscriptionFormModal
                    key={editing === "new" ? "new" : editing.name}
          subscription={editing === "new" ? null : editing}
                   numbers={numbers}
          plans={plans}
          customers={customers}
          onSave={save}
          onClose={closeModal}
        />
      )}
    </>
  );
};

export default Subscriptions;