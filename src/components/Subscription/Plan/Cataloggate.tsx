import type { ReactNode } from "react";
import { Skeleton, Stack } from "@mantine/core";
import AppAlert from "../../../utils/Alert";
import type { PlanCatalog } from "../../../types/plan.types";

interface Props {
  catalog: PlanCatalog;
  children: ReactNode;
  rows?: number;
  rowHeight?: number;
}

const CatalogGate = ({ catalog, children, rows = 3, rowHeight = 56 }: Props) => {
  if (catalog.status === "loading") {
    return (
      <Stack gap="xs" aria-busy="true">
        {Array.from({ length: rows }, (_, i) => (
          <Skeleton key={i} h={rowHeight} radius="md" />
        ))}
      </Stack>
    );
  }

  if (catalog.status === "error" && catalog.error) {
    return (
      <AppAlert
        variant="error"
        title={catalog.error.title}
        message={catalog.error.message}
        onRetry={catalog.reload}
      />
    );
  }

  return <>{children}</>;
};

export default CatalogGate;