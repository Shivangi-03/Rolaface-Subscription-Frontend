import type { ReactNode } from "react";
import { Alert, Box, Button, Group, Text, Stack, ActionIcon } from "@mantine/core";
import { IconAlertTriangle, IconCheck, IconInfoCircle, IconRefresh, IconX } from "@tabler/icons-react";
import { modals } from "@mantine/modals";

/* ==========================================================================
   1. FRAPPE ERROR PARSER
   ========================================================================== */
export const parseFrappeError = (err: any): string => {
  if (!err) return "An unknown error occurred.";
  if (typeof err === "string") return err.trim();

  const data = err?.response?.data;
  const clean = (msg: unknown) =>
    typeof msg === "string" ? msg.replace(/<[^>]*>?/gm, "").replace(/\s+/g, " ").trim() : "";

  if (data?._server_messages) {
    try {
      const parsed = JSON.parse(data._server_messages);
      const first = typeof parsed[0] === "string" ? JSON.parse(parsed[0]) : parsed[0];
      if (first?.message) return clean(first.message);
    } catch {}
  }
  if (typeof data?.message === "object" && data?.message?.message) return clean(data.message.message);
  if (typeof data?.message === "string" && data.message.trim()) return clean(data.message);
  if (data?.exception) return clean(String(data.exception).split(":").pop());
  if (err?.message) return clean(err.message);
  return "An unexpected error occurred.";
};

/* ==========================================================================
   2. ALERT MODAL (openCommonModal)
   ========================================================================== */
export interface ModalButton {
  label: string;
  color?: string;
  variant?: "filled" | "outline" | "default";
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

type ColorKey = "red" | "green" | "yellow" | "blue";

const NORMALIZE_COLOR: Record<string, ColorKey> = {
  danger: "red",
  red: "red",
  error: "red",
  success: "green",
  green: "green",
  teal: "green",
  warning: "yellow",
  yellow: "yellow",
  orange: "yellow",
  info: "blue",
  blue: "blue",
};

const THEMES: Record<ColorKey, {
  icon: ReactNode;
  primary: string;
  bgTint: string;
  shadow: string;
}> = {
  red: {
    icon: <IconX size={30} color="#dc2626" stroke={2.6} />,
    primary: "#dc2626",
    bgTint: "#fee2e2",
    shadow: "0 4px 14px rgba(220, 38, 38, 0.3)",
  },
  green: {
    icon: <IconCheck size={32} color="#16a34a" stroke={2.8} />,
    primary: "#16a34a",
    bgTint: "#dcfce7",
    shadow: "0 4px 14px rgba(22, 163, 74, 0.3)",
  },
  yellow: {
    icon: <IconAlertTriangle size={30} color="#d97706" stroke={2.4} />,
    primary: "#d97706",
    bgTint: "#fef3c7",
    shadow: "0 4px 14px rgba(217, 119, 6, 0.3)",
  },
  blue: {
    icon: <IconInfoCircle size={30} color="#2563eb" stroke={2.4} />,
    primary: "#2563eb",
    bgTint: "#dbeafe",
    shadow: "0 4px 14px rgba(37, 99, 235, 0.3)",
  },
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
  const cKey = NORMALIZE_COLOR[color?.toLowerCase()] ?? "blue";
  const theme = THEMES[cKey];
  let modalId: string;

  modalId = modals.open({
    centered: true,
    zIndex: 10000,
    withCloseButton: false,
    size: 450,
    radius: 26,
    padding: 0,
    overlayProps: { backgroundOpacity: 0.45, blur: 4 },
    trapFocus: false,
    returnFocus: false,
    styles: {
      body: { padding: 0 },
      content: {
        overflow: "hidden",
        borderRadius: 26,
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.22)",
      },
    },
    onClose,
    children: (
      <Box style={{ backgroundColor: "#ffffff" }}>
        {/* Curved Pastel Top Banner with centered circular badge */}
        <Box
          style={{
            height: 110,
            backgroundColor: theme.bgTint,
            borderBottomLeftRadius: "50% 28px",
            borderBottomRightRadius: "50% 28px",
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Top-Right "X" Cut Button */}
          <ActionIcon
            variant="subtle"
            color="gray"
            radius="xl"
            size={28}
            tabIndex={-1}
            focusRing="never"
            onClick={() => {
              modals.close(modalId);
              onClose?.();
            }}
            aria-label="Close"
            style={{
              position: "absolute",
              top: 14,
              right: 16,
              color: "#374151",
            }}
          >
            <IconX size={18} stroke={2.5} />
          </ActionIcon>

          {/* Central Circular Badge with colored ring */}
          <Box
            style={{
              width: 66,
              height: 66,
              borderRadius: "50%",
              backgroundColor: "#ffffff",
              border: `2.5px solid ${theme.primary}`,
              boxShadow: "0 4px 14px rgba(0, 0, 0, 0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginTop: 35,
            }}
          >
            {icon ?? theme.icon}
          </Box>
        </Box>

        {/* Content Area */}
        <Stack align="center" gap={0} px={32} pt={26} pb={26}>
          {/* Centered Heading in Theme Color */}
          <Text
            fw={700}
            ta="center"
            style={{
              fontSize: "1.2rem",
              color: theme.primary,
              lineHeight: 1.3,
            }}
          >
            {heading}
          </Text>

          {subtitle && (
            <Text size="xs" fw={500} c="dimmed" ta="center" mt={4}>
              {subtitle}
            </Text>
          )}

          {/* Centered Message Body */}
          <Box mt={8} mb={22}>
            {typeof body === "string" ? (
              <Text
                size="sm"
                ta="center"
                style={{
                  color: "#4b5563",
                  lineHeight: 1.55,
                  maxWidth: 360,
                  wordBreak: "break-word",
                }}
              >
                {body}
              </Text>
            ) : (
              body
            )}
          </Box>

          {/* Centered Action Buttons */}
          <Group justify="center" gap="md">
            {buttons.map((btn, i) => {
              const isSecondary =
                buttons.length > 1 &&
                i === 0 &&
                (btn.variant === "default" ||
                  !btn.color ||
                  btn.label.toLowerCase() === "cancel" ||
                  btn.label.toLowerCase() === "keep editing");

              const bKey = NORMALIZE_COLOR[(btn.color ?? color)?.toLowerCase()] ?? cKey;
              const bTheme = THEMES[bKey];

              if (isSecondary) {
                return (
                  <Button
                    key={i}
                    variant="default"
                    radius="xl"
                    size="sm"
                    px={30}
                    h={40}
                    style={{
                      fontWeight: 600,
                      borderColor: "#d1d5db",
                      color: "#475569",
                      backgroundColor: "#ffffff",
                    }}
                    onClick={() => {
                      modals.close(modalId);
                      btn.onClick?.();
                    }}
                  >
                    {btn.label}
                  </Button>
                );
              }

              return (
                <Button
                  key={i}
                  radius="xl"
                  size="sm"
                  px={38}
                  h={40}
                  style={{
                    fontWeight: 600,
                    backgroundColor: bTheme.primary,
                    color: "#ffffff",
                    border: "none",
                    boxShadow: bTheme.shadow,
                  }}
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
      </Box>
    ),
  });

  return modalId;
};

/* ==========================================================================
   3. NOTIFY CONVENIENCE HELPERS 
   ========================================================================== */
export const notifySuccess = (message: string, heading = "Success") =>
  openCommonModal({
    heading,
    color: "green",
    body: message,
    buttons: [{ label: "Ok", color: "green" }],
  });

export const notifyError = (err: unknown, heading = "Action failed") =>
  openCommonModal({
    heading,
    color: "red",
    body: parseFrappeError(err),
    buttons: [{ label: "Close", color: "red" }],
  });

export const notifyValidationError = (message: string, heading = "Missing information") =>
  openCommonModal({
    heading,
    color: "yellow",
    body: message,
    buttons: [{ label: "Close", color: "yellow" }],
  });

export const notifyInfo = (message: string, heading = "Did you know?") =>
  openCommonModal({
    heading,
    color: "blue",
    body: message,
    buttons: [{ label: "Alright", color: "blue" }],
  });

/* ==========================================================================
   4. INLINE PAGE ALERT (AppAlert)
   ========================================================================== */
export type AppAlertVariant = "error" | "warning" | "info" | "success" | "danger";

interface AppAlertProps {
  variant?: AppAlertVariant;
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
  const cKey = NORMALIZE_COLOR[variant?.toLowerCase()] ?? "blue";
  const theme = THEMES[cKey];

  return (
    <Alert
      role={cKey === "red" || cKey === "yellow" ? "alert" : "status"}
      variant="light"
      color={cKey}
      radius="md"
      mb={mb}
      withCloseButton={!!onClose}
      onClose={onClose}
      icon={theme.icon}
      styles={{
        root: {
          background: theme.bgTint,
          border: `1px solid ${theme.primary}22`,
          borderLeft: `4px solid ${theme.primary}`,
          padding: "var(--mantine-spacing-md)",
        },
        title: { fontWeight: 700, color: theme.primary },
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
              color={cKey}
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