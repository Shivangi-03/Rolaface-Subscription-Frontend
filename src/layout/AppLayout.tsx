import { Suspense, useState } from "react";
import { Outlet } from "react-router-dom";
import { AppShell, Box, LoadingOverlay } from "@mantine/core";
import Sidebar from "./Sidebar";

const AppLayout = () => {
  const [open, setOpen] = useState(true);

  return (
    <AppShell navbar={{ width: open ? 256 : 72, breakpoint: 0 }} padding="md" transitionDuration={300}>
      <AppShell.Navbar px="xs">
        <Sidebar open={open} setOpen={setOpen} />
      </AppShell.Navbar>

      <AppShell.Main>
        {/* Suspense yahan, taaki chunk load hote waqt sidebar dikhta rahe */}
        <Suspense
          fallback={
            <Box pos="relative" mih={300}>
              <LoadingOverlay visible overlayProps={{ backgroundOpacity: 0 }} />
            </Box>
          }
        >
          <Outlet />
        </Suspense>
      </AppShell.Main>
    </AppShell>
  );
};

export default AppLayout;