import type { ReactNode } from "react";
import { ActionIcon, Box, Button, Group, Modal, ScrollArea, Tabs, Text, ThemeIcon } from "@mantine/core";
import { IconMinus } from "@tabler/icons-react";
import type { BoxProps, ModalProps } from "@mantine/core";

export interface AppModalTab<T extends string = string> {
  value: T;
  label: string;
  icon?: ReactNode;
}


export interface AppModalFooterProps {
  onCancel: () => void;
  cancelLabel?: string;
  onReset?: () => void;
  resetLabel?: string;
  onNext?: () => void;
  nextLabel?: string;
  onSubmit?: () => void | Promise<unknown>;
  submitLabel?: string;
  saving?: boolean;
  submitDisabled?: boolean;
  /** extra content shown on the left, next to Cancel */
  leftExtra?: ReactNode;
}

export const AppModalFooter = ({
  onCancel,
  cancelLabel = "Cancel",
  onReset,
  resetLabel = "Reset",
  onNext,
  nextLabel = "Next",
  onSubmit,
  submitLabel = "Save",
  saving = false,
  submitDisabled = false,
  leftExtra,
}: AppModalFooterProps) => (
  <Group justify="space-between">
    <Group gap="sm">
      <Button variant="default" onClick={onCancel} disabled={saving}>
        {cancelLabel}
      </Button>
      {leftExtra}
    </Group>

    <Group gap="sm">
      {onReset && (
        <Button color="red" onClick={onReset} disabled={saving}>
          {resetLabel}
        </Button>
      )}
      {onNext && (
        <Button variant="default" onClick={onNext} disabled={saving}>
          {nextLabel}
        </Button>
      )}
      {onSubmit && (
        <Button onClick={() => void onSubmit()} loading={saving} disabled={submitDisabled}>
          {submitLabel}
        </Button>
      )}
    </Group>
  </Group>
);

export interface AppModalProps<T extends string = string> {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
   onClose: () => void;
  onMinimize?: () => void;
  opened?: boolean;
  size?: ModalProps["size"];
  fullScreen?: boolean;
  closeOnClickOutside?: boolean;

  tabs?: AppModalTab<T>[];
  activeTab?: T;
  onTabChange?: (tab: T) => void;

  footer?: ReactNode;

  scroll?: boolean;
  bodyMaxHeight?: string | number;
  bodyPadding?: BoxProps["p"];

  children: ReactNode;
}

const AppModal = <T extends string = string>({
  title,
  subtitle,
  icon,
  onClose,
  onMinimize,
  opened = true,
  size = "70rem",
  fullScreen,
  closeOnClickOutside = false,
  tabs,
  activeTab,
  onTabChange,
  footer,
  scroll = true,
  bodyMaxHeight = "60vh",
  bodyPadding = "lg",
  children,
}: AppModalProps<T>) => (
  <Modal
    opened={opened}
    onClose={onClose}
    centered
    size={size}
    fullScreen={fullScreen}
    padding={0}
    radius="lg"
    closeOnClickOutside={closeOnClickOutside}
    closeButtonProps={{ c: "var(--app-modal-header-fg)" }}
    styles={{
      header: {
        background: "var(--app-modal-header-bg)",
        color: "var(--app-modal-header-fg)",
        padding: "16px 20px",
      },
      title: { flex: 1 },
      body: { background: "var(--app-modal-body-bg)" },
    }}
    title={
      <Group gap="sm" wrap="nowrap" w="100%">
        {icon && (
          <ThemeIcon size={40} variant="white" color="gray" radius="md">
            {icon}
          </ThemeIcon>
        )}
        <div>
          <Text fw={700} size="lg" lh={1.2}>
            {title}
          </Text>
          {subtitle && (
            <Text size="sm" opacity={0.85}>
              {subtitle}
            </Text>
          )}
       </div>
        {onMinimize && (
          <ActionIcon variant="subtle" ml="auto" c="var(--app-modal-header-fg)" aria-label="Minimize" onClick={onMinimize}>
            <IconMinus size={18} />
          </ActionIcon>
        )}
      </Group>
    }
  >
    {tabs && tabs.length > 0 && (
      <Tabs value={activeTab ?? null} onChange={(t) => t && onTabChange?.(t as T)} px="lg" pt="xs">
        <Tabs.List>
          {tabs.map((t) => (
            <Tabs.Tab key={t.value} value={t.value} leftSection={t.icon}>
              {t.label}
            </Tabs.Tab>
          ))}
        </Tabs.List>
      </Tabs>
    )}

    <Box p={bodyPadding}>
      {scroll ? (
        <ScrollArea.Autosize mah={bodyMaxHeight} offsetScrollbars>
          {children}
        </ScrollArea.Autosize>
      ) : (
        children
      )}
    </Box>

    {footer && (
      <Box
        p="md"
        style={{ borderTop: "1px solid var(--app-border)", background: "var(--app-modal-footer-bg)" }}
      >
        {footer}
      </Box>
    )}
  </Modal>
);

export default AppModal;