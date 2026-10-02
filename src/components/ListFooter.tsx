import { Group, Pagination, Select, Text } from "@mantine/core";

interface Props {
  total: number;
  page: number;
  pageSize: number;
  onPage: (p: number) => void;
  onPageSize: (s: number) => void;
}

const ListFooter = ({ total, page, pageSize, onPage, onPageSize }: Props) => (
  <Group justify="space-between" p="md" style={{ borderTop: "1px solid var(--mantine-color-default-border)" }}>
    <Text size="sm" c="dimmed">
      Total: {total}
    </Text>
    <Group gap="md">
      {total > pageSize && <Pagination size="sm" total={Math.ceil(total / pageSize)} value={page} onChange={onPage} />}
      <Group gap={6} wrap="nowrap">
        <Text size="sm" c="dimmed">
          Show:
        </Text>
        <Select
          w={84}
          size="xs"
          data={["10", "20", "50", "100"]}
          value={String(pageSize)}
          allowDeselect={false}
          onChange={(v) => v && onPageSize(Number(v))}
        />
      </Group>
    </Group>
  </Group>
);

export default ListFooter;