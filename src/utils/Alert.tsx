import type { ReactNode } from "react";
import { Alert, Box, Button, Group, Text, ThemeIcon } from "@mantine/core";
import { IconAlertCircle, IconAlertTriangle, IconCircleCheck, IconInfoCircle, IconRefresh } from "@tabler/icons-react";

export type AppAlertVariant = "error" | "warning" | "info" | "success";

const VARIANTS: Record<AppAlertVariant, { color: string; Icon: typeof IconAlertCircle }> = {
  error: { color: "red", Icon: IconAlertCircle },
  warning: { color: "yellow", Icon: IconAlertTriangle },
  info: { color: "blue", Icon: IconInfoCircle },
  success: { color: "green", Icon: IconCircleCheck },
};

interface AppAlertProps {
  variant?: AppAlertVariant;
  /** Text is supplied by the caller (e.g. from the API response). Nothing is hardcoded here. */
  title?: string;
  message: ReactNode;
  onRetry?: () => void;
  retryLabel?: string;
  retrying?: boolean;
  onClose?: () => void;
  mb?: string | number;
}

const AppAlert = ({
  variant = "error",
  title,
  message,
  onRetry,
  retryLabel = "Retry",
  retrying = false,
  onClose,
  mb,
}: AppAlertProps) => {
  const { color, Icon } = VARIANTS[variant];

  return (
    <Alert
      role={variant === "error" || variant === "warning" ? "alert" : "status"}
      variant="light"
      color={color}
      radius="md"
      mb={mb}
      withCloseButton={!!onClose}
      onClose={onClose}
      icon={
        <ThemeIcon variant="light" color={color} radius="xl" size={32}>
          <Icon size={18} stroke={2} />
        </ThemeIcon>
      }
      styles={{
        root: {
          borderLeft: `4px solid var(--mantine-color-${color}-6)`,
          boxShadow: "var(--mantine-shadow-xs)",
          padding: "var(--mantine-spacing-md)",
        },
        icon: { marginInlineEnd: "var(--mantine-spacing-md)", alignSelf: "flex-start" },
        title: { fontWeight: 700, fontSize: "var(--mantine-font-size-sm)" },
        message: { fontSize: "var(--mantine-font-size-sm)" },
      }}
      title={title}
    >
      <Box>
        <Text size="sm" style={{ whiteSpace: "pre-line", overflowWrap: "anywhere" }}>
          {message}
        </Text>
        {onRetry && (
          <Group mt="sm">
            <Button
              size="compact-sm"
              variant="light"
              color={color}
              leftSection={<IconRefresh size={14} />}
              loading={retrying}
              onClick={onRetry}
            >
              {retryLabel}
            </Button>
          </Group>
        )}
      </Box>
    </Alert>
  );
};

export default AppAlert;