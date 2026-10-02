import type { ReactNode } from "react";
import { Group, Tabs, Text, ThemeIcon, Title } from "@mantine/core";
import { IconStack2, IconUserCheck } from "@tabler/icons-react";
import { useLocation, useNavigate } from "react-router-dom";

interface Props {
  icon: ReactNode;
  title: string;
  subtitle: string;
}

const PageHeader = ({ icon, title, subtitle }: Props) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  return (
    <>
      <Group gap="sm" mb="md" wrap="nowrap">
        <ThemeIcon size={44} variant="light" radius="md">
          {icon}
        </ThemeIcon>
        <div>
          <Title order={3}>{title}</Title>
          <Text size="sm" c="dimmed">
            {subtitle}
          </Text>
        </div>
      </Group>

      <Tabs
        variant="pills"
        mb="md"
        value={pathname.startsWith("/subscriptions") ? "/subscriptions" : "/plans"}
        onChange={(v) => v && navigate(v)}
      >
        <Tabs.List>
          <Tabs.Tab value="/plans" leftSection={<IconStack2 size={16} />}>
            Plans
          </Tabs.Tab>
          <Tabs.Tab value="/subscriptions" leftSection={<IconUserCheck size={16} />}>
            Subscriptions
          </Tabs.Tab>
        </Tabs.List>
      </Tabs>
    </>
  );
};

export default PageHeader;