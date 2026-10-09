import { Badge, Group, Stack } from "@mantine/core";
import type { ProductCode, ProductDef } from "../types/plan.types";

interface Props {
  products: ProductCode[];
  catalog?: ProductDef[];
  perLine?: number; // default 2
}

const ProductBadges = ({ products, catalog = [], perLine = 2 }: Props) => {
  const rows: ProductCode[][] = [];
  for (let i = 0; i < products.length; i += perLine) {
    rows.push(products.slice(i, i + perLine));
  }

  return (
    <Stack gap={4}>
      {rows.map((row, i) => (
        <Group key={i} gap={6} wrap="nowrap">
          {row.map((code) => {
            const def = catalog.find((p) => p.code === code);
            return (
              <Badge key={code} variant="light" color={def?.color ?? "gray"} title={def?.name}>
                {code}
              </Badge>
            );
          })}
        </Group>
      ))}
    </Stack>
  );
};

export default ProductBadges;