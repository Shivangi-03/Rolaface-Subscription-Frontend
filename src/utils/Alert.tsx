import type { ReactNode } from "react";
import { Alert, Box, Button, Group, Text, Stack, ActionIcon, ThemeIcon } from "@mantine/core";
import {
  IconAlertCircle,
  IconAlertTriangle,
  IconAlertOctagon,
  IconInfoCircle,
  IconCircleCheck,
  IconRefresh,
  IconX,
} from "@tabler/icons-react";
import { modals } from "@mantine/modals";

/* ==========================================================================
   1. FRAPPE ERROR PARSER (Extracts exact dynamic Frappe server error)
   ========================================================================== */
export const parseFrappeError = (err: any): string => {
  if (!err) return "An unknown error occurred.";
  if (typeof err === "string") return err.trim();

  const data = err?.response?.data;
  const cleanMessage = (msg: string) => {
    if (!msg) return "";
    return String(msg)
      .replace(/<[^>]*>?/gm, "")
      .replace(/\s+/g, " ")
      .trim();
  };

  // 1. Frappe _server_messages (JSON array of JSON string objects)
  if (data?._server_messages) {
    try {
      const messages = JSON.parse(data._server_messages);
      if (Array.isArray(messages) && messages.length > 0) {
        const msgObj = typeof messages[0] === "string" ? JSON.parse(messages[0]) : messages[0];
        if (msgObj?.message) {
          return cleanMessage(msgObj.message);
        }
      }
    } catch {
      // ignore JSON parse error, fall through
    }
  }

  // 2. data.message object or string
  if (typeof data?.message === "object" && data?.message !== null) {
    const nested = data.message as Record<string, unknown>;
    if (typeof nested.message === "string") {
      return cleanMessage(nested.message);
    }
  }
  if (typeof data?.message === "string" && data.message.trim()) {
    return cleanMessage(data.message);
  }

  // 3. Frappe exception
  if (data?.exception) {
    const parts = String(data.exception).split(":");
    if (parts.length > 1) {
      return cleanMessage(parts.slice(1).join(":"));
    }
    return cleanMessage(data.exception);
  }

  // 4. Fallback to Axios or standard Error message
  if (err?.message) return cleanMessage(err.message);
  return "An unexpected error occurred.";
};

/* ==========================================================================
   2.ALERT MODAL (openCommonModal)
   ========================================================================== */
export interface ModalButton {
  label: string;
  color?: string;
  variant?: "filled" | "light" | "outline" | "subtle" | "default";
  onClick?: () => void;
}

export interface CommonModalProps {
  heading: string;
  subtitle?: string;
  body: ReactNode;
  color?: string;
  icon?: ReactNode;
  buttons: ModalButton[];
  onClose?: () => void;
}

// Color mapping -> uses reusable CSS variables defined in index.css
const THEMES: Record<string, { icon: ReactNode; colorVar: string; rgbVar: string }> = {
  red: {
    icon: <IconAlertOctagon size={34} />,
    colorVar: "var(--color-danger)",
    rgbVar: "var(--color-danger-rgb)",
  },
  danger: {
    icon: <IconAlertOctagon size={34} />,
    colorVar: "var(--color-danger)",
    rgbVar: "var(--color-danger-rgb)",
  },
  orange: {
    icon: <IconAlertTriangle size={34} />,
    colorVar: "var(--color-warning)",
    rgbVar: "var(--color-warning-rgb)",
  },
  yellow: {
    icon: <IconAlertTriangle size={34} />,
    colorVar: "var(--color-warning)",
    rgbVar: "var(--color-warning-rgb)",
  },
  warning: {
    icon: <IconAlertTriangle size={34} />,
    colorVar: "var(--color-warning)",
    rgbVar: "var(--color-warning-rgb)",
  },
  blue: {
    icon: <IconInfoCircle size={34} />,
    colorVar: "var(--color-info)",
    rgbVar: "var(--color-info-rgb)",
  },
  info: {
    icon: <IconInfoCircle size={34} />,
    colorVar: "var(--color-info)",
    rgbVar: "var(--color-info-rgb)",
  },
  teal: {
    icon: <IconCircleCheck size={34} />,
    colorVar: "var(--color-success)",
    rgbVar: "var(--color-success-rgb)",
  },
  green: {
    icon: <IconCircleCheck size={34} />,
    colorVar: "var(--color-success)",
    rgbVar: "var(--color-success-rgb)",
  },
  success: {
    icon: <IconCircleCheck size={34} />,
    colorVar: "var(--color-success)",
    rgbVar: "var(--color-success-rgb)",
  },
};
const DEFAULT_THEME = {
  icon: <IconAlertCircle size={34} />,
  colorVar: "var(--color-neutral)",
  rgbVar: "var(--color-neutral-rgb)",
};

const toMantineColor = (c?: string) => {
  if (!c) return "blue";
  const lower = c.toLowerCase();
  if (lower === "danger") return "red";
  if (lower === "success") return "green";
  if (lower === "warning") return "yellow";
  if (lower === "info") return "blue";
  return c;
};

export const openCommonModal = ({
  heading,
  subtitle,
  body,
  color = "blue",
  icon,
  buttons,
  onClose,
}: CommonModalProps) => {
  const { icon: themeIcon, colorVar, rgbVar } = THEMES[color?.toLowerCase()] ?? DEFAULT_THEME;
  const mantineColor = toMantineColor(color);
  let modalId: string;

  modalId = modals.open({
    centered: true,
    zIndex: 10000,
    withCloseButton: false,
    size: "md",
    radius: "lg",
    padding: 0,
    overlayProps: { backgroundOpacity: 0.55, blur: 3 },
    styles: {
      body: { padding: 0 },
      content: { overflow: "hidden", borderTop: `4px solid ${colorVar}` },
    },
    onClose,
    children: (
      <Stack gap={0}>
        <Box
          pos="relative"
          pt={44}
          pb={24}
          style={{
            background: `linear-gradient(to bottom, rgba(${rgbVar}, 0.3) 0%, rgba(${rgbVar}, 0.15) 40%, rgba(${rgbVar}, 0) 100%)`,
          }}
        >
          <ActionIcon
            variant="subtle"
            color="gray"
            radius="xl"
            onClick={() => {
              modals.close(modalId);
              onClose?.();
            }}
            style={{ position: "absolute", top: 16, right: 16 }}
            aria-label="Close"
          >
            <IconX size={18} />
          </ActionIcon>

          <Box
            mx="auto"
            style={{
              width: 84,
              height: 84,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              clipPath: "polygon(25% 3%,75% 3%,100% 50%,75% 97%,25% 97%,0% 50%)",
              background: `rgba(${rgbVar}, 0.2)`,
              boxShadow: `0 0 32px 8px rgba(${rgbVar}, 0.25)`,
              color: colorVar,
            }}
          >
            {icon ?? themeIcon}
          </Box>
        </Box>

        <Stack align="center" gap="md" px="xl" pb="xl">
          <Stack gap={4} align="center">
            <Text fw={700} size="xl" ta="center">{heading}</Text>
            {subtitle && <Text size="sm" c="dimmed" ta="center">{subtitle}</Text>}
          </Stack>

          <Alert
            color={mantineColor}
            variant="light"
            radius="md"
            w="100%"
            icon={<IconAlertCircle size={20} />}
            styles={{
              root: {
                background: `rgba(${rgbVar}, 0.05)`,
                border: `1px solid rgba(${rgbVar}, 0.15)`,
              },
            }}
          >
            <Text size="sm">{body}</Text>
          </Alert>

          <Group justify="flex-end" w="100%" mt="sm">
            {buttons.map((btn, i) => {
              const btnVariant = btn.variant ?? "filled";
              const isDefaultOrOutline = btnVariant === "default" || btnVariant === "outline";
              const btnColor = btn.color ?? color;
              const isGreen = btnColor === "green" || btnColor === "success" || btnColor === "teal";
              const isRed = btnColor === "red" || btnColor === "danger";

              return (
                <Button
                  key={i}
                  color={toMantineColor(btnColor)}
                  variant={btnVariant}
                  radius="md"
                  style={
                    !isDefaultOrOutline && isGreen
                      ? { backgroundColor: "var(--color-success)", color: "#ffffff" }
                      : !isDefaultOrOutline && isRed
                      ? { backgroundColor: "var(--color-danger)", color: "#ffffff" }
                      : undefined
                  }
                  onClick={() => {
                    modals.close(modalId);
                    btn.onClick?.();
                  }}
                >
                  {btn.label}
                </Button>
              );
            })}
          </Group>
        </Stack>
      </Stack>
    ),
  });

  return modalId;
};

/* ==========================================================================
   3. NOTIFY CONVENIENCE HELPERS 
   ========================================================================== */
export function notifySuccess(message: string, heading = "Success") {
  return openCommonModal({
    heading,
    color: "green",
    icon: <IconCircleCheck size={36} />,
    body: message,
    buttons: [{ label: "Ok", variant: "filled", color: "green" }],
  });
}

export function notifyError(err: unknown, heading = "Something went wrong") {
  return openCommonModal({
    heading,
    color: "red",
    icon: <IconAlertOctagon size={36} />,
    body: parseFrappeError(err),
    buttons: [{ label: "Close", variant: "filled", color: "red" }],
  });
}

export function notifyValidationError(message: string, heading = "Missing information") {
  return openCommonModal({
    heading,
    color: "yellow",
    icon: <IconAlertTriangle size={36} />,
    body: message,
    buttons: [{ label: "Close", variant: "filled", color: "yellow" }],
  });
}

export function notifyInfo(message: string, heading = "Information") {
  return openCommonModal({
    heading,
    color: "blue",
    icon: <IconInfoCircle size={36} />,
    body: message,
    buttons: [{ label: "Ok", variant: "filled", color: "blue" }],
  });
}


/* ==========================================================================
   4. INLINE PAGE ALERT (AppAlert)
   ========================================================================== */
export type AppAlertVariant = "error" | "warning" | "info" | "success" | "danger";

interface AppAlertProps {
  variant?: AppAlertVariant;
  /** Text is supplied by the caller (e.g. from the API response). */
  title?: string;
  message: ReactNode;
  onRetry?: () => void;
  retryLabel?: string;
  retrying?: boolean;
  onClose?: () => void;
  mb?: string | number;
}

export const AppAlert = ({
  variant = "error",
  title,
  message,
  onRetry,
  retryLabel = "Retry",
  retrying = false,
  onClose,
  mb,
}: AppAlertProps) => {
  const { icon, colorVar, rgbVar } = THEMES[variant?.toLowerCase()] ?? DEFAULT_THEME;
  const color = variant === "error" ? "danger" : variant;

  return (
    <Alert
      role={variant === "error" || variant === "danger" || variant === "warning" ? "alert" : "status"}
      variant="light"
      color={toMantineColor(color)}
      radius="md"
      mb={mb}
      withCloseButton={!!onClose}
      onClose={onClose}
      icon={
        <ThemeIcon variant="light" color={toMantineColor(color)} radius="xl" size={32}>
          {icon}
        </ThemeIcon>
      }
      styles={{
        root: {
          background: `rgba(${rgbVar}, 0.05)`,
          border: `1px solid rgba(${rgbVar}, 0.15)`,
          borderLeft: `4px solid ${colorVar}`,
          boxShadow: "0 1px 3px rgba(15, 23, 42, 0.04)",
          padding: "var(--mantine-spacing-md)",
        },
        icon: { marginInlineEnd: "var(--mantine-spacing-md)", alignSelf: "flex-start" },
        title: { fontWeight: 700, fontSize: "var(--mantine-font-size-sm)", color: colorVar },
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