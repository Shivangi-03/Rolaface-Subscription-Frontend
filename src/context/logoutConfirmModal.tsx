import { Button, Group, Modal, Text, ThemeIcon } from "@mantine/core";
import { IconLogout } from "@tabler/icons-react";

interface Props {
  opened: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const LogoutConfirmModal = ({ opened, onClose, onConfirm }: Props) => (
  <Modal
    opened={opened}
    onClose={onClose}
    centered
    size="md"
    radius="lg"
    padding={0}
    styles={{
      header: { padding: "16px 20px", borderBottom: "1px solid var(--mantine-color-default-border)" },
      title: { flex: 1 },
    }}
    title={
      <Group gap="sm" wrap="nowrap">
        <ThemeIcon size={36} color="red" variant="filled" radius="md">
          <IconLogout size={18} />
        </ThemeIcon>
        <Text fw={700} size="lg">
          Confirm Logout
        </Text>
      </Group>
    }
  >
    <Text size="sm" c="dimmed" p="lg">
      Are you sure you want to logout?
    </Text>
    <Group justify="flex-end" gap="sm" p="md" style={{ borderTop: "1px solid var(--mantine-color-default-border)" }}>
      <Button variant="default" onClick={onClose}>
        Cancel
      </Button>
      <Button color="red" onClick={onConfirm}>
        Logout
      </Button>
    </Group>
  </Modal>
);

export default LogoutConfirmModal;