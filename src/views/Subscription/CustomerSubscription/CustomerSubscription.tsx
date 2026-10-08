import type { ReactNode } from "react";
import { ActionIcon, Badge, Button, Group, Menu, Text } from "@mantine/core";
import { IconBan, IconDotsVertical, IconEdit, IconStack2 } from "@tabler/icons-react";
import { notifyInfo } from "../../../utils/Alert";
import PageHeader from "../../../components/PageHeader";
import DataTable, { type Column } from "../../../components/table";
import CancelSubscriptionModal from "../../../components/Subscription/CustomerSubscription/cancelSubscriptionModal";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

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

const Subscriptions = ({ embedded = false }: { embedded?: boolean }) => {
const { list, openCreate, openEdit, opening, cancelTarget, cancelling, openCancel, closeCancel, confirmCancel } = useSubscriptions();
  const columns: Column<ApiSubscription>[] = [
        ...COLUMNS.map((c) => ({
      key: c.key,
      header: c.label,
      render: CELLS[c.key],
    })),
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (s) =>
               (
                      <Group gap={4} justify="flex-end" wrap="nowrap">
            <ActionIcon
              variant="subtle"
              loading={opening === s.name}
              disabled={isCancelled(s)}
              onClick={() => openEdit(s)}
              aria-label={`Edit ${s.name}`}
            >
              <IconEdit size={18} />
            </ActionIcon>
            <Menu position="bottom-end" withinPortal>
              <Menu.Target>
               <ActionIcon variant="subtle" disabled={isCancelled(s)} aria-label={`More actions for ${s.name}`}>
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
       ),
    },
  ];

  const handleExport = () => {
    const rows = list.rows;
    if (!rows.length) {
      notifyInfo("No subscriptions to export", "Export");
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(
      rows.map((s) => ({
        "Subscription No": s.name,
        Customer: s.customer_name,
        "Customer ID": s.customer,
        Plan: s.plan_name,
        Billing: s.billing_frequency,
        "Renewal Mode": s.renewal_mode,
        "Period Start": formatDate(s.current_period_start),
        "Period End": formatDate(s.current_period_end),
        Currency: s.currency,
        Total: s.grand_total,
        Status: s.status,
      })),
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Subscriptions");

    saveAs(
      new Blob([XLSX.write(workbook, { bookType: "xlsx", type: "array" })], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }),
      "Subscriptions.xlsx",
    );
  };

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
          <Button variant="default" onClick={handleExport}>
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