import { Navigate, useLocation } from "react-router-dom";
import { Alert, Box, Button, Center, Divider, Modal, Paper, PasswordInput, Stack, Text, TextInput, Title } from "@mantine/core";
import { IconArrowRight, IconLock, IconMail, IconShieldCheck } from "@tabler/icons-react";
import { useAuth } from "../hooks/useAuth";
import { useLogin } from "../hooks/useLogin";

const DEFAULT_REDIRECT = "/customers";

const getSafeRedirect = (from?: string): string =>
  from && from.startsWith("/") && !from.startsWith("//") && !from.startsWith("/login") ? from : DEFAULT_REDIRECT;

const glass = {
  background: "linear-gradient(160deg, rgba(235,242,255,0.92) 0%, rgba(218,232,252,0.88) 100%)",
  backdropFilter: "blur(40px) saturate(150%)",
  WebkitBackdropFilter: "blur(40px) saturate(150%)",
  border: "1px solid rgba(255,255,255,0.80)",
  boxShadow: "inset 0 1px 0 rgba(255,255,255,1), 0 8px 32px rgba(100,140,200,0.15), 0 32px 64px rgba(80,120,180,0.12)",
};

const Login = () => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const from = getSafeRedirect((location.state as { from?: string } | null)?.from);

  const {
    email, setEmail, password, setPassword,
    error, handleSubmit, isSubmitting,
    forgotOpen, setForgotOpen, forgotEmail, setForgotEmail,
    forgotStatus, forgotMessage, handleForgotPassword, closeForgotModal,
  } = useLogin();

  if (!loading && user) return <Navigate to={from} replace />;

  return (
    <Box
      mih="100vh"
      style={{
        backgroundImage: "url(/LoginPage.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundColor: "var(--mantine-color-blue-0)",
      }}
    >
      <Center mih="100vh" p="md" pr={{ base: "md", md: "6%" }} style={{ justifyContent: "flex-end" }}>
        <Paper w="100%" maw={400} radius={24} px={36} py={40} style={glass}>
          <Title order={2} ta="center" c="#0f1f3d" mb={8}>
            Welcome Back
          </Title>
          <Text size="sm" ta="center" c="#5a7199" mb="xl">
            Sign in to continue to your enterprise workspace and manage operations seamlessly.
          </Text>

          {error && (
            <Alert color="red" variant="light" radius="lg" mb="md" role="alert">
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <Stack gap="md">
              <TextInput
                label="Email Address"
                placeholder="name@company.com"
                autoComplete="username"
                leftSection={<IconMail size={16} />}
                size="md"
                radius="lg"
                value={email}
                onChange={(e) => setEmail(e.currentTarget.value)}
                styles={{ label: { fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" } }}
              />

              <div>
                <PasswordInput
                  label="Password"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  leftSection={<IconLock size={16} />}
                  size="md"
                  radius="lg"
                  value={password}
                  onChange={(e) => setPassword(e.currentTarget.value)}
                  styles={{ label: { fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" } }}
                />
                <Text ta="right" mt={6}>
                  <Text component="button" type="button" size="xs" fw={600} c="blue.7" onClick={() => setForgotOpen(true)}
                    style={{ background: "none", border: 0, cursor: "pointer", padding: 0 }}>
                    Forgot Password?
                  </Text>
                </Text>
              </div>

              <Button
                type="submit"
                size="md"
                radius="lg"
                fullWidth
                loading={isSubmitting}
                variant="gradient"
                gradient={{ from: "#1d4ed8", to: "#3b82f6", deg: 135 }}
                rightSection={<IconArrowRight size={16} />}
              >
                Log In
              </Button>
            </Stack>
          </form>

          <Divider mt="xl" mb="md" />
          <Stack align="center" gap={4}>
            <IconShieldCheck size={18} color="#8aaccc" />
            <Text size="xs" ta="center" c="#8aaccc">
              Secure access to your organization's critical data and operations.
            </Text>
          </Stack>
        </Paper>
      </Center>

      <Modal
        opened={forgotOpen}
        onClose={closeForgotModal}
        title="Reset Password"
        centered
        radius="lg"
        size={400}
        overlayProps={{ backgroundOpacity: 0.2, blur: 6 }}
      >
        <Text size="sm" c="dimmed" mb="md">
          Enter your email address to receive a reset link.
        </Text>

        {forgotStatus === "success" && (
          <Alert color="green" variant="light" mb="md">
            {forgotMessage}
          </Alert>
        )}
        {forgotStatus === "error" && (
          <Alert color="red" variant="light" mb="md">
            {forgotMessage}
          </Alert>
        )}

        {forgotStatus !== "success" && (
          <Stack>
            <TextInput
              placeholder="Enter your email"
              radius="lg"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.currentTarget.value)}
              onKeyDown={(e) => e.key === "Enter" && void handleForgotPassword()}
            />
            <Button radius="lg" fullWidth loading={forgotStatus === "loading"} onClick={() => void handleForgotPassword()}>
              Send Link
            </Button>
          </Stack>
        )}
      </Modal>
    </Box>
  );
};

export default Login;