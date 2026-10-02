import type { ReactNode } from "react";
import { Button, Center, Stack, Text, Title } from "@mantine/core";

interface Props {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: ReactNode;
}

const FullPageMessage = ({ title, message, actionLabel, onAction, icon }: Props) => (
  <Center h="100vh" p="md">
    <Stack align="center" gap="xs" ta="center" maw={420} role="alert">
      {icon}
      <Title order={2}>{title}</Title>
      <Text c="dimmed">{message}</Text>
      {actionLabel && onAction && (
        <Button mt="md" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </Stack>
  </Center>
);

export default FullPageMessage;