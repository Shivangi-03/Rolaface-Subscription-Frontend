import { Alert, Badge, Box, Button, Checkbox, Group, Paper, Stack, Text } from "@mantine/core";
import CatalogGate from "../Plan/Cataloggate";
import type { PlanCatalog, PlanForm, ProductCode } from "../../../types/plan.types";

interface Props {
  form: PlanForm;
  catalog: PlanCatalog;
}

const ModulesTab = ({ form, catalog }: Props) => {
  const { products, modules } = form.values;

  if (!products.length) {
    return <Alert color="blue">Select at least one product in Basic Information to choose modules.</Alert>;
  }

  const toggle = (id: string) =>
    form.setFieldValue("modules", modules.includes(id) ? modules.filter((m) => m !== id) : [...modules, id]);

  const setAll = (product: ProductCode, on: boolean) => {
    const ids = catalog.modules.filter((m) => m.product === product).map((m) => m.id);
    form.setFieldValue("modules", on ? Array.from(new Set([...modules, ...ids])) : modules.filter((m) => !ids.includes(m)));
  };

  return (
    <CatalogGate catalog={catalog} rows={4}>
      <Stack>
        {form.errors.modules && (
          <Text size="sm" c="red">
            {form.errors.modules}
          </Text>
        )}

        {catalog.products
          .filter((p) => products.includes(p.code))
          .map((p) => {
            const list = catalog.modules.filter((m) => m.product === p.code);
            const active = list.filter((m) => modules.includes(m.id)).length;
            return (
              <Paper key={p.code} withBorder>
                <Group justify="space-between" p="sm" style={{ borderBottom: "1px solid var(--mantine-color-default-border)" }}>
                  <Group gap="xs">
                    <Badge variant="light" color={p.color}>
                      {p.code}
                    </Badge>
                    <Text fw={600}>{p.name}</Text>
                  </Group>
                  <Group gap="xs">
                    <Text size="sm" c="dimmed">
                      {active} / {list.length} Modules Active
                    </Text>
                    <Button size="compact-sm" variant="default" disabled={!list.length} onClick={() => setAll(p.code, true)}>
                      Select All
                    </Button>
                    <Button size="compact-sm" variant="default" disabled={!list.length} onClick={() => setAll(p.code, false)}>
                      Clear All
                    </Button>
                  </Group>
                </Group>

                {list.map((m, i) => {
                  const subs = catalog.subModulesByModule[m.id] ?? [];
                  return (
                    <Box key={m.id} p="sm" style={i > 0 ? { borderTop: "1px solid var(--mantine-color-default-border)" } : undefined}>
                      <Group justify="space-between" mb={subs.length ? 6 : 0}>
                        <Checkbox label={m.name} checked={modules.includes(m.id)} onChange={() => toggle(m.id)} />
                        {modules.includes(m.id) && (
                          <Text size="xs" c="blue">
                            Included
                          </Text>
                        )}
                      </Group>
                      {subs.length > 0 && (
                        <Text size="xs" p="xs" bg="var(--mantine-color-default-hover)" style={{ borderRadius: 6 }}>
                          <b>Sub-Modules:</b> {subs.map((s) => s.name).join(" • ")}
                        </Text>
                      )}
                    </Box>
                  );
                })}
              </Paper>
            );
          })}
      </Stack>
    </CatalogGate>
  );
};

export default ModulesTab;