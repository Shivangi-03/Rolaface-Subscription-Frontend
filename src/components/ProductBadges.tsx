import { Badge, Group } from "@mantine/core";
import type { ProductCode, ProductDef } from "../types/plan.types";

interface Props {
  products: ProductCode[];
  catalog?: ProductDef[]; 
}

const ProductBadges = ({ products, catalog = [] }: Props) => (
  <Group gap={6} wrap="nowrap">
    {products.map((code) => {
      const def = catalog.find((p) => p.code === code);
      return (
        <Badge key={code} variant="light" color={def?.color ?? "gray"} title={def?.name}>
          {code}
        </Badge>
      );
    })}
  </Group>
);

export default ProductBadges;