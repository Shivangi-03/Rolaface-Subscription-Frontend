import React, { lazy, Suspense, useEffect, useState } from "react";
import {
  Route,
  Navigate,
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
  Outlet,
  useRouteError,
} from "react-router-dom";
import { Box, LoadingOverlay } from "@mantine/core";

import { AuthProvider } from "../context/AuthContext";
import ProtectedRoute from "../components/ProtectedRoute";
import FullPageMessage from "../components/FullPageMessage";
import AppLayout from "../layout/AppLayout";
import Login from "../views/Login";

const CustomerModule = lazy(() => import("../views/Customer/Customer"));
const SubscriptionModule = lazy(() => import("../views/Subscription/Subscription"));

const RELOAD_KEY = "chunk-reload-at";
const RELOAD_COOLDOWN_MS = 10_000;

const shouldAutoReload = (): boolean => {
  try {
    const last = Number(sessionStorage.getItem(RELOAD_KEY) ?? 0);
    if (Date.now() - last < RELOAD_COOLDOWN_MS) return false;
    sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
    return true;
  } catch {
    return false;
  }
};

const CHUNK_ERROR_PATTERNS = [
  "Failed to fetch dynamically imported module",
  "Importing a module script failed",
  "error loading dynamically imported module",
];

const GlobalErrorBoundary: React.FC = () => {
  const error = useRouteError();
  const message = error instanceof Error ? error.message : "";
  const isChunkError = CHUNK_ERROR_PATTERNS.some((p) => message.includes(p));
  const [autoReloading, setAutoReloading] = useState(false);

  useEffect(() => {
    console.error("Route error:", error);
    if (isChunkError && shouldAutoReload()) {
      setAutoReloading(true);
      window.location.reload();
    }
  }, [error, isChunkError]);

  const reload = () => window.location.reload();

  if (autoReloading) {
    return <FullPageMessage title="Updating…" message="Updating application to the latest version..." />;
  }

  if (isChunkError) {
    return (
      <FullPageMessage
        title="Update in progress"
        message="We're deploying a new version. Please try again in a moment."
        actionLabel="Try Again"
        onAction={reload}
      />
    );
  }

  return (
    <FullPageMessage
      title="Oops! Something went wrong."
      message="We encountered an unexpected error."
      actionLabel="Refresh Page"
      onAction={reload}
    />
  );
};

const RootLayout = () => (
  <AuthProvider>
    <Outlet />
  </AuthProvider>
);

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<RootLayout />}>
      <Route errorElement={<GlobalErrorBoundary />}>
        <Route path="/login" element={<Login />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/customers" element={<CustomerModule />} />
            <Route path="/subscription" element={<SubscriptionModule />} />
            <Route path="*" element={<Navigate to="/customers" replace />} />
          </Route>
        </Route>
      </Route>
    </Route>,
  ),
);

const AppRoutes: React.FC = () => (
  <Suspense
    fallback={
      <Box pos="relative" h="100vh">
        <LoadingOverlay visible overlayProps={{ backgroundOpacity: 0 }} />
      </Box>
    }
  >
    <RouterProvider router={router} />
  </Suspense>
);

export default AppRoutes;