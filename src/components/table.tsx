import { Fragment, type ReactNode } from "react";
import { Box, Button, Checkbox, Group, Paper, ScrollArea, Skeleton, Table, Text, TextInput } from "@mantine/core";
import { IconChevronDown, IconChevronUp, IconPlus, IconSearch, IconSelector } from "@tabler/icons-react";
import ListFooter from "../components/ListFooter";

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => ReactNode;
  width?: number | string;
  align?: "left" | "center" | "right";
  sortable?: boolean;
  truncate?: boolean;
}

export interface SortState {
  sortBy: string;
  sortOrder: "asc" | "desc";
}

interface Props<T> {
  columns: Column<T>[];
  data: T[];
  rowKey: (row: T) => string;
  loading?: boolean;
  emptyMessage?: string;
  height?: string;
  minWidth?: number;

  showToolbar?: boolean;
  searchValue?: string;
  searchPlaceholder?: string;
  onSearch?: (q: string) => void;
  filters?: ReactNode;
  enableAdd?: boolean;
  addLabel?: string;
  onAdd?: () => void;
  primaryAction?: ReactNode;

  sortBy?: string;
  sortOrder?: "asc" | "desc";
  onSortChange?: (sort: SortState) => void;

  onRowClick?: (row: T) => void;
  onRowDoubleClick?: (row: T) => void;

  selectable?: boolean;
  isRowSelected?: (row: T) => boolean;
  isRowSelectable?: (row: T) => boolean;
  onRowSelect?: (row: T, checked: boolean) => void;
  onSelectAll?: (rows: T[], checked: boolean) => void;

  page?: number;
  pageSize?: number;
  totalItems?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
}

const SKELETON_WIDTHS = ["75%", "50%", "83%", "66%", "80%"];

const DataTable = <T,>({
  columns,
  data,
  rowKey,
  loading = false,
  emptyMessage = "No records found.",
   height = "calc(100vh - 100px)",
  minWidth = 900,
  showToolbar = true,
  searchValue = "",
  searchPlaceholder = "Search...",
  onSearch,
  filters,
  enableAdd = false,
  addLabel = "Add",
  onAdd,
  primaryAction,
  sortBy,
  sortOrder,
  onSortChange,
  onRowClick,
  onRowDoubleClick,
  selectable = false,
  isRowSelected,
  isRowSelectable,
  onRowSelect,
  onSelectAll,
  page = 1,
  pageSize = 10,
  totalItems = 0,
  onPageChange,
  onPageSizeChange,
}: Props<T>) => {
  const selectableRows = selectable ? data.filter((r) => (isRowSelectable ? isRowSelectable(r) : true)) : [];
  const selectedCount = selectableRows.filter((r) => isRowSelected?.(r)).length;
  const allSelected = selectableRows.length > 0 && selectedCount === selectableRows.length;
  const someSelected = selectedCount > 0 && !allSelected;
  const colSpan = columns.length + (selectable ? 1 : 0);

  const handleSort = (key: string) => {
    if (!onSortChange) return;
    onSortChange({ sortBy: key, sortOrder: sortBy === key && sortOrder === "asc" ? "desc" : "asc" });
  };

  const sortIcon = (key: string) => {
    if (sortBy !== key) return <IconSelector size={14} opacity={0.5} />;
    return sortOrder === "asc" ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />;
  };

  return (
    <Paper withBorder style={{ height, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {showToolbar && (
        <Group p="md" justify="space-between" wrap="wrap" style={{ flexShrink: 0 }}>
          <TextInput
            w={{ base: "100%", sm: 320 }}
            placeholder={searchPlaceholder}
            leftSection={<IconSearch size={16} />}
            value={searchValue}
            onChange={(e) => onSearch?.(e.currentTarget.value)}
          />
          <Group gap="sm">
            {filters}
            {enableAdd && (
              <Button leftSection={<IconPlus size={16} />} onClick={onAdd}>
                {addLabel}
              </Button>
            )}
            {primaryAction}
          </Group>
        </Group>
      )}

      <Box style={{ flex: 1, minHeight: 0 }}>
        <ScrollArea h="100%" type="auto">
          <Table stickyHeader highlightOnHover={!!onRowClick} verticalSpacing="sm" style={{ minWidth, tableLayout: "fixed" }}>
            <Table.Thead style={{ background: "var(--mantine-color-gray-0)" }}>
              <Table.Tr>
                {selectable && (
                  <Table.Th w={40}>
                    <Checkbox
                      aria-label="Select all rows on this page"
                      checked={allSelected}
                      indeterminate={someSelected}
                      disabled={selectableRows.length === 0}
                      onChange={(e) => onSelectAll?.(selectableRows, e.currentTarget.checked)}
                    />
                  </Table.Th>
                )}
                {columns.map((col) => {
                  const sortable = !!col.sortable && !!onSortChange;
                  return (
                    <Table.Th
                      key={col.key}
                      w={col.width}
                      ta={col.align}
                      onClick={sortable ? () => handleSort(col.key) : undefined}
                      style={{
                        cursor: sortable ? "pointer" : undefined,
                        userSelect: sortable ? "none" : undefined,
                        whiteSpace: "nowrap",
                        textTransform: "uppercase",
                        fontSize: "var(--mantine-font-size-xs)",
                      }}
                    >
                      <Group gap={4} wrap="nowrap" justify={col.align === "right" ? "flex-end" : col.align === "center" ? "center" : "flex-start"}>
                        {col.header}
                        {sortable && sortIcon(col.key)}
                      </Group>
                    </Table.Th>
                  );
                })}
              </Table.Tr>
            </Table.Thead>

            <Table.Tbody>
              {loading ? (
                Array.from({ length: pageSize }).map((_, r) => (
                  <Table.Tr key={r}>
                    {Array.from({ length: colSpan }).map((__, c) => (
                      <Table.Td key={c}>
                        <Skeleton h={12} w={SKELETON_WIDTHS[(r + c) % SKELETON_WIDTHS.length]} />
                      </Table.Td>
                    ))}
                  </Table.Tr>
                ))
              ) : data.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={colSpan}>
                    <Text ta="center" c="dimmed" py={100}>
                      {emptyMessage}
                    </Text>
                  </Table.Td>
                </Table.Tr>
              ) : (
                data.map((row) => (
                  <Fragment key={rowKey(row)}>
                    <Table.Tr
                      onClick={() => onRowClick?.(row)}
                      onDoubleClick={() => onRowDoubleClick?.(row)}
                      style={{ cursor: onRowClick ? "pointer" : undefined }}
                    >
                      {selectable && (
                        <Table.Td onClick={(e) => e.stopPropagation()} onDoubleClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            aria-label="Select row"
                            checked={!!isRowSelected?.(row)}
                            disabled={isRowSelectable ? !isRowSelectable(row) : false}
                            onChange={(e) => onRowSelect?.(row, e.currentTarget.checked)}
                          />
                        </Table.Td>
                      )}
                      {columns.map((col) => {
                        const raw = (row as Record<string, unknown>)[col.key];
                        const content = col.render ? col.render(row) : raw === null || raw === undefined || raw === "" ? "-" : String(raw);
                        return (
                          <Table.Td
                            key={col.key}
                            ta={col.align}
                            style={col.truncate ? { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } : { wordBreak: "break-word" }}
                          >
                            {content}
                          </Table.Td>
                        );
                      })}
                    </Table.Tr>
                  </Fragment>
                ))
              )}
            </Table.Tbody>
          </Table>
        </ScrollArea>
      </Box>

      <ListFooter
        total={totalItems}
        page={page}
        pageSize={pageSize}
        onPage={onPageChange ?? (() => {})}
        onPageSize={onPageSizeChange ?? (() => {})}
      />
    </Paper>
  );
};

export default DataTable;