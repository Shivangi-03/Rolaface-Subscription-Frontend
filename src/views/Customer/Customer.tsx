import { ActionIcon, Badge, Button, Group, LoadingOverlay, Paper, Table, Text, TextInput, Tooltip } from "@mantine/core";
import { IconBan, IconCircleCheck, IconEdit, IconPlus, IconSearch, IconTrash, IconUsers } from "@tabler/icons-react";
import PageHeader from "../../components/PageHeader";
import ListFooter from "../../components/ListFooter";
import CustomerModal from "../../components/Customer/CustomerModal";
import { useCustomers } from "../../hooks/useCustomer";
import AppAlert from "../../utils/Alert";


const COLUMNS = ["Customer ID", "Name", "Email", "Phone", "Currency", "Status"];

const Customers = () => {
  const c = useCustomers();

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

      <Paper withBorder pos="relative">
        <LoadingOverlay visible={c.loading} zIndex={5} overlayProps={{ backgroundOpacity: 0.4 }} />

        <Group p="md" justify="space-between">
          <TextInput
            w={{ base: "100%", sm: 320 }}
            placeholder="Search customers..."
            leftSection={<IconSearch size={16} />}
            value={c.search}
            onChange={(e) => c.setSearch(e.currentTarget.value)}
          />
          <Button leftSection={<IconPlus size={16} />} onClick={c.openCreate}>
            Add Customer
          </Button>
        </Group>

        <Table.ScrollContainer minWidth={900}>
          <Table>
            <Table.Thead>
              <Table.Tr>
                {COLUMNS.map((label) => (
                  <Table.Th key={label}>{label}</Table.Th>
                ))}
                <Table.Th ta="right">Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {c.rows.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={COLUMNS.length + 1}>
                    <Text ta="center" c="dimmed" py="xl">
                      {c.loading ? "Loading..." : "No customers found"}
                    </Text>
                  </Table.Td>
                </Table.Tr>
              ) : (
                c.rows.map((row) => {
                  const active = row.status === "Active";
                  return (
                    <Table.Tr key={row.id}>
                      <Table.Td>
                        <Text size="sm" fw={500}>
                          {row.id}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm" fw={600}>
                          {row.name}
                        </Text>
                      </Table.Td>
                      <Table.Td>{row.email || "-"}</Table.Td>
                      <Table.Td>{row.mobile || "-"}</Table.Td>
                      <Table.Td>{row.currency || "-"}</Table.Td>
                      <Table.Td>
                        <Badge variant="light" color={active ? "green" : "gray"}>
                          {row.status ?? "-"}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
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
                          <Tooltip label={active ? "Disable" : "Enable"}>
                            <ActionIcon
                              variant="subtle"
                              color={active ? "orange" : "green"}
                              aria-label={`${active ? "Disable" : "Enable"} ${row.name}`}
                              onClick={() => c.toggleStatus(row)}
                            >
                              {active ? <IconBan size={18} /> : <IconCircleCheck size={18} />}
                            </ActionIcon>
                          </Tooltip>
                          <Tooltip label="Delete">
                            <ActionIcon
                              variant="subtle"
                              color="red"
                              aria-label={`Delete ${row.name}`}
                              onClick={() => c.remove(row)}
                            >
                              <IconTrash size={18} />
                            </ActionIcon>
                          </Tooltip>
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  );
                })
              )}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>

        <ListFooter
          total={c.totalItems}
          page={c.page}
          pageSize={c.pageSize}
          onPage={c.setPage}
          onPageSize={c.setPageSize}
        />
      </Paper>

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