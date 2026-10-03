import { ActionIcon, Avatar, Box, Divider, Group, NavLink, Stack, Text, Tooltip } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconLogout, IconMenu2, IconStack2, IconUsers } from "@tabler/icons-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import LogoutConfirmModal from "../context/logoutConfirmModal";

const iconProps = { size: 18, stroke: 1.75 };

const menuItems = [
  { name: "Customers", to: "/customers", icon: <IconUsers {...iconProps} /> },
  { name: "Subscription", to: "/subscription", icon: <IconStack2 {...iconProps} /> },
];

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const isActivePath = (pathname: string, to: string) => pathname === to || pathname.startsWith(`${to}/`);

const Sidebar = ({ open, setOpen }: SidebarProps) => {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const [confirmOpen, { open: openConfirm, close: closeConfirm }] = useDisclosure(false);

  const username = user?.fullName || user?.username || "User";
  const initials =
    username
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";

  return (
    <>
      <Group justify={open ? "space-between" : "center"} h={56} px={open ? "xs" : 0} wrap="nowrap">
        {open && (
          <Text fw={900} size="xl" c="brand" truncate>
            ERP Admin
          </Text>
        )}
        <ActionIcon
          variant="subtle"
          color="gray"
          size="lg"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Collapse sidebar" : "Expand sidebar"}
          aria-expanded={open}
        >
          <IconMenu2 size={18} />
        </ActionIcon>
      </Group>
      <Divider />

      <Stack component="nav" gap={4} py="sm" style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>
        {menuItems.map((item) => {
          const active = isActivePath(pathname, item.to);

          if (!open) {
            return (
              <Tooltip key={item.to} label={item.name} position="right" withArrow>
                <ActionIcon
                  component={Link}
                  to={item.to}
                  variant={active ? "light" : "subtle"}
                  color={active ? "brand" : "gray"}
                  size={40}
                  mx="auto"
                  aria-label={item.name}
                  aria-current={active ? "page" : undefined}
                >
                  {item.icon}
                </ActionIcon>
              </Tooltip>
            );
          }

          return (
            <NavLink
              key={item.to}
              component={Link}
              to={item.to}
              label={item.name}
              leftSection={item.icon}
              active={active}
              aria-current={active ? "page" : undefined}
              variant="light"
              styles={{ root: { borderRadius: "var(--mantine-radius-md)" }, label: { fontWeight: 600 } }}
            />
          );
        })}
      </Stack>

      <Divider />
      <Box py="sm">
        <Group
          gap="xs"
          justify={open ? "space-between" : "center"}
          wrap="nowrap"
          style={{ flexDirection: open ? "row" : "column" }}
        >
          <Tooltip label={username} position="right" disabled={open}>
            <Avatar color="brand" variant="filled" radius="xl" size={36}>
              {initials}
            </Avatar>
          </Tooltip>

          {open && (
            <Box style={{ flex: 1, minWidth: 0 }}>
              <Text size="sm" fw={700} truncate>
                {username}
              </Text>
              <Text size="10px" fw={800} tt="uppercase" c="dimmed" truncate>
                {user?.username}
              </Text>
            </Box>
          )}

          <Tooltip label="Logout" position="right">
            <ActionIcon variant="subtle" color="red" size="lg" onClick={openConfirm} aria-label="Logout">
              <IconLogout size={16} />
            </ActionIcon>
          </Tooltip>
        </Group>
           </Box>

      <LogoutConfirmModal
        opened={confirmOpen}
        onClose={closeConfirm}
        onConfirm={() => {
          closeConfirm();
          void logout();
        }}
      />
    </>
  );
};

export default Sidebar;