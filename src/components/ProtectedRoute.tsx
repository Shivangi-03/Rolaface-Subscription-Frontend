import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Box, LoadingOverlay } from "@mantine/core";
import { useAuth } from "../hooks/useAuth";
import FullPageMessage from "./FullPageMessage";

const ALLOWED_ROLES = ["System Manager"];

const ProtectedRoute = () => {
  const { user, loading, logout } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <Box pos="relative" h="100vh">
        <LoadingOverlay visible overlayProps={{ backgroundOpacity: 0 }} />
      </Box>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  }

  if (!user.roles?.some((role) => ALLOWED_ROLES.includes(role))) {
    return (
      <FullPageMessage
        title="Access denied"
        message="Your account doesn't have permission to use this admin panel."
        actionLabel="Sign out"
        onAction={() => void logout()}
      />
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;