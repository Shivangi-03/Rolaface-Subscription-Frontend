import { useState, type FormEvent } from "react";
import { useAuth } from "./useAuth";

type ForgotStatus = "idle" | "loading" | "success" | "error";

const requestPasswordReset = async (_email: string): Promise<void> => {
  throw new Error("NOT_CONFIGURED");
};

export function useLogin() {
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotStatus, setForgotStatus] = useState<ForgotStatus>("idle");
  const [forgotMessage, setForgotMessage] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!email.trim() || !password) {
      setError("Email and password are required");
      return;
    }

    setError("");
    setIsSubmitting(true);
    try {
      await login(email.trim(), password);
    } catch (err) {
      setError(
        err instanceof Error && err.message === "LOGIN_FAILED"
          ? "Invalid email or password"
          : "Login failed. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    if (forgotStatus === "loading") return;
    if (!forgotEmail.trim()) {
      setForgotStatus("error");
      setForgotMessage("Please enter your email");
      return;
    }
    setForgotStatus("loading");
    try {
      await requestPasswordReset(forgotEmail.trim());
      setForgotStatus("success");
      setForgotMessage("Reset link sent. Please check your email.");
    } catch (err) {
      setForgotStatus("error");
      setForgotMessage(
        err instanceof Error && err.message === "NOT_CONFIGURED"
          ? "Password reset is not available yet. Please contact your administrator."
          : "Could not send reset link. Please try again.",
      );
    }
  };

  const closeForgotModal = () => {
    setForgotOpen(false);
    setForgotEmail("");
    setForgotStatus("idle");
    setForgotMessage("");
  };

  return {
    email, setEmail,
    password, setPassword,
    showPassword, setShowPassword,
    error, handleSubmit, isSubmitting,
    forgotOpen, setForgotOpen,
    forgotEmail, setForgotEmail,
    forgotStatus, forgotMessage,
    handleForgotPassword, closeForgotModal,
  };
}