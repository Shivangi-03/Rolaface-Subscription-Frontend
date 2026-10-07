import "@fontsource-variable/inter";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/dates/styles.css";
import "./index.css";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { MantineProvider, createTheme } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";
import AppRoutes from "./routes/AppRoutes";

const theme = createTheme({
  fontFamily: '"Inter Variable", system-ui, sans-serif',
  defaultRadius: "md",
  primaryColor: "brand",
  primaryShade: 6,
  colors: {
    brand: [
      "#eef2ff", "#e0e7ff", "#c7d2fe", "#a5b4fc", "#818cf8",
      "#6366f1", "#4f46e5", "#4338ca", "#3730a3", "#312e81",
    ],
  },
  components: {
  Paper: { defaultProps: { radius: "lg" } },
Modal: { defaultProps: { centered: true } },
  Badge: { defaultProps: { radius: "sm" } },
  Button: { defaultProps: { fw: 600 } },
  Table: { defaultProps: { verticalSpacing: "md", highlightOnHover: true } },
},
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MantineProvider theme={theme} defaultColorScheme="light">
     <ModalsProvider modalProps={{ centered: true }}>
        <Notifications position="top-right" limit={5} />
        <AppRoutes />
      </ModalsProvider>
    </MantineProvider>
  </StrictMode>,
);