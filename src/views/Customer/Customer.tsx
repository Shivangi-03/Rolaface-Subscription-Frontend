import { ActionIcon, Badge, Group, Text, Tooltip } from "@mantine/core";
import { IconBan, IconCircleCheck, IconEdit, IconTrash, IconUsers } from "@tabler/icons-react";
import PageHeader from "../../components/PageHeader";
import DataTable, { type Column } from "../../components/table";
import CustomerModal from "../../components/Customer/CustomerModal";
import { useCustomers } from "../../hooks/useCustomer";
import AppAlert from "../../utils/Alert";



const Customers = () => {
  const c = useCustomers();

  type Row = (typeof c.rows)[number];

  const columns: Column<Row>[] = [
    { key: "id", header: "Customer ID", width: 130, render: (r) => <Text size="sm" fw={500}>{r.id}</Text> },
    { key: "name", header: "Name", width: 220, render: (r) => <Text size="sm" fw={600}>{r.name}</Text> },
    { key: "email", header: "Email", width: 240, truncate: true, render: (r) => r.email || "-" },
    { key: "mobile", header: "Phone", width: 170, render: (r) => r.mobile || "-" },
    { key: "currency", header: "Currency", width: 110, render: (r) => r.currency || "-" },
    {
      key: "status",
      header: "Status",
      width: 110,
      render: (r) => (
        <Badge variant="light" color={r.status === "Active" ? "green" : "gray"}>
          {r.status ?? "-"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      width: 140,
      align: "right",
      render: (row) => {
        const active = row.status === "Active";
        return (
          <Group gap={4} justify="flex-end" wrap="nowrap">
            <Tooltip label="Edit">
              <ActionIcon
                variant="subtle"
                aria-label={`Edit ${row.name}`}
                loading={c.busyId === row.id}
                onClick={() => c.openEdit(row.id)}
              >
                <IconEdit size={18} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label={active ? "Inactive" : "Active"}>
              <ActionIcon
                variant="subtle"
                color={active ? "orange" : "green"}
                aria-label={`${active ? "Inactive" : "Active"} ${row.name}`}
                onClick={() => c.toggleStatus(row)}
              >
                {active ? <IconBan size={18} /> : <IconCircleCheck size={18} />}
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Delete">
              <ActionIcon variant="subtle" color="red" aria-label={`Delete ${row.name}`} onClick={() => c.remove(row)}>
                <IconTrash size={18} />
              </ActionIcon>
            </Tooltip>
          </Group>
        );
      },
    },
  ];

  return (
    <>
      <PageHeader
        icon={<IconUsers size={24} />}
        title="Customers"
        subtitle="Manage customers, contact details and addresses"
      />
      {c.error && (
        <AppAlert title="Couldn't load customers" message={c.error} onRetry={c.reload} retrying={c.loading} mb="md" />
      )}

        <DataTable
        columns={columns}
        data={c.rows}
        rowKey={(r) => r.id}
               loading={c.loading}
        height="calc(100vh - 100px)"
        emptyMessage="No customers found"
        searchValue={c.search}
        searchPlaceholder="Search customers..."
        onSearch={c.setSearch}
        enableAdd
        addLabel="Add Customer"
        onAdd={c.openCreate}
        page={c.page}
        pageSize={c.pageSize}
        totalItems={c.totalItems}
        onPageChange={c.setPage}
        onPageSizeChange={c.setPageSize}
      />

      {c.editing && (
        <CustomerModal
          key={c.editing === "new" ? "new" : c.editing.id}
          customer={c.editing === "new" ? null : c.editing}
          onSave={c.save}
          onClose={c.closeModal}
        />
      )}
    </>
  );
};

export default Customers;