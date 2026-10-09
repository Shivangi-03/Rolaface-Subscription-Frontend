import { useState } from "react";
import { Button, Checkbox, Group, Modal, Stack, Text, Textarea } from "@mantine/core";
import type { ApiSubscription } from "../../../types/subscription.types";
import { formatDate } from "../../../views/Subscription/CustomerSubscription/subscription.constants";

interface Props {
  subscription: ApiSubscription;
  loading: boolean;
  onConfirm: (reason: string, immediate: boolean) => void;
  onClose: () => void;
}

const CancelSubscriptionModal = ({ subscription, loading, onConfirm, onClose }: Props) => {
  const [reason, setReason] = useState("");
  const [immediateChecked, setImmediateChecked] = useState(false);
  const [error, setError] = useState("");

  const status = subscription.status?.toLowerCase();

  // Backend allows "cancel at period end" only for an Active subscription with no cancellation scheduled yet.
  // Trialing / Scheduled, or an already scheduled cancellation -> only "cancel immediately" is possible.
  const onlyImmediate = status === "trialing" || status === "scheduled" || !!subscription.cancel_scheduled;
  const immediate = onlyImmediate || immediateChecked;

  const hint = subscription.cancel_scheduled
    ? `Cancellation is already scheduled for ${formatDate(subscription.cancelled_on ?? "")}. You can only cancel immediately now.`
    : onlyImmediate
      ? "Trial / scheduled subscriptions can only be cancelled immediately."
      : "Unchecked: the subscription stays active until the end of the current period.";

  const submit = () => {
    if (loading) return;
    if (!reason.trim()) return setError("Reason is required");
    onConfirm(reason.trim(), immediate);
  };

  return (
    <Modal opened onClose={loading ? () => {} : onClose} centered title={`Cancel ${subscription.name}`} closeOnClickOutside={false}>
      <Stack gap="md">
        <Text size="sm" c="dimmed">
          {subscription.customer_name} · {subscription.plan_name}
        </Text>
        <Textarea
          label="Reason"
          required
          minRows={3}
          autosize
          maxLength={500}
          value={reason}
          error={error}
          onChange={(e) => {
            setReason(e.currentTarget.value);
            setError("");
          }}
        />
        <Checkbox
          label="Cancel immediately"
          description={hint}
          checked={immediate}
          disabled={onlyImmediate || loading}
          onChange={(e) => setImmediateChecked(e.currentTarget.checked)}
        />
        <Group justify="flex-end">
          <Button variant="default" onClick={onClose} disabled={loading}>
            Keep subscription
          </Button>
          <Button color="red" onClick={submit} loading={loading}>
            Cancel subscription
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

export default CancelSubscriptionModal;