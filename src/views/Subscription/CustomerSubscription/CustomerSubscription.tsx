import type { ReactNode } from "react";
import { ActionIcon, Badge, Button, Group, Menu, Text } from "@mantine/core";
import { IconBan, IconCircleCheck, IconDotsVertical, IconDownload, IconEdit, IconStack2, IconTrash } from "@tabler/icons-react";
import PageHeader from "../../../components/PageHeader";
import DataTable, { type Column } from "../../../components/table";
import CancelSubscriptionModal from "../../../components/Subscription/CustomerSubscription/cancelSubscriptionModal";
import { useSubscriptionsExport } from "../../../hooks/useSubscriptionExport";

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

const isCancelled = (s: ApiSubscription) => s.status.toLowerCase() === "cancelled";
const isDraft = (s: ApiSubscription) => s.status?.toLowerCase() === "draft";

const Subscriptions = ({ embedded = false }: { embedded?: boolean }) => {
  const { list, openCreate, openEdit, opening, submittingId, openSubmit, cancelTarget, cancelling, openCancel, closeCancel, confirmCancel, remove, deletingId } = useSubscriptions();
  const columns: Column<ApiSubscription>[] = [
    ...COLUMNS.map((c) => ({
      key: c.key,
      header: c.label,
      render: CELLS[c.key],
    })),
    {
      key: "actions",
           header: "Actions",
      width: 150,
      align: "right",
      render: (s) =>
      (
        <Group gap={4} justify="flex-end" wrap="nowrap">
          <ActionIcon
            variant="subtle"
            loading={opening === s.name}
            disabled={!isDraft(s)}
            onClick={() => openEdit(s)}
            aria-label={`Edit ${s.name}`}
          >
                      <IconEdit size={18} />
          </ActionIcon>
          <ActionIcon
            variant="subtle"
            color="red"
            loading={deletingId === s.name}
            disabled={!(isDraft(s) || isCancelled(s))}
            onClick={() => remove(s)}
            aria-label={`Delete ${s.name}`}
          >
            <IconTrash size={18} />
          </ActionIcon>
          <Menu position="bottom-end" withinPortal>
            <Menu.Target>
              <ActionIcon
                variant="subtle"
                loading={submittingId === s.name}
                disabled={isCancelled(s)}
                aria-label={`More actions for ${s.name}`}
              >
                <IconDotsVertical size={18} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              {isDraft(s) ? (
                <Menu.Item color="green" leftSection={<IconCircleCheck size={16} />} onClick={() => openSubmit(s)}>
                  Submit
                </Menu.Item>
              ) : (
                <Menu.Item color="red" leftSection={<IconBan size={16} />} onClick={() => openCancel(s)}>
                  Cancel
                </Menu.Item>
              )}
            </Menu.Dropdown>
          </Menu>
        </Group>
      ),
    },
  ];

  const exp = useSubscriptionsExport(list.filters.search);

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
        primaryAction={
          <Button
            variant="default"
            leftSection={<IconDownload size={16} />}
            onClick={exp.exportAll}
            loading={exp.exporting}
            disabled={list.loading || list.total === 0}
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

      {cancelTarget && (
        <CancelSubscriptionModal
          key={cancelTarget.name}
          subscription={cancelTarget}
          loading={cancelling}
          onConfirm={confirmCancel}
          onClose={closeCancel}
        />
      )}
    </>
  );
};

export default Subscriptions;