import { ActionIcon, Group, Paper, Text } from "@mantine/core";
import { IconX } from "@tabler/icons-react";
import { useModalStore } from "../../../src/store/modalstore";

const ModalTaskbar = () => {
  const modals = useModalStore((s) => s.modals);
  const restoreModal = useModalStore((s) => s.restoreModal);
  const closeModal = useModalStore((s) => s.closeModal);
  const minimized = modals.filter((m) => m.minimized).sort((a, b) => a.openedAt - b.openedAt);

  if (!minimized.length) return null;

  return (
    <Group gap="xs" style={{ position: "fixed", bottom: 12, right: 12, zIndex: 1800 }}>
      {minimized.map((m) => (
        <Paper
          key={m.id}
          withBorder
          shadow="md"
          radius="md"
          px="sm"
          py={6}
          style={{ cursor: "pointer" }}
          onClick={() => restoreModal(m.id)}
        >
          <Group gap="xs" wrap="nowrap">
            <Text size="sm" fw={500}>
              {m.title}
            </Text>
            <ActionIcon
              size="xs"
              variant="subtle"
              color="red"
              aria-label={`Close ${m.title}`}
              onClick={(e) => {
                e.stopPropagation();
                closeModal(m.id);
              }}
            >
              <IconX size={12} />
            </ActionIcon>
          </Group>
        </Paper>
      ))}
    </Group>
  );
};

export default ModalTaskbar;