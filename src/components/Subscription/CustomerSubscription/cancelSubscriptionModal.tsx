import { useState } from "react";
import { Button, Checkbox, Group, Modal, Stack, Text, Textarea } from "@mantine/core";
import type { ApiSubscription } from "../../../types/subscription.types";

interface Props {
  subscription: ApiSubscription;
  loading: boolean;
  onConfirm: (reason: string, immediate: boolean) => void;
  onClose: () => void;
}

const CancelSubscriptionModal = ({ subscription, loading, onConfirm, onClose }: Props) => {
  const [reason, setReason] = useState("");
  const [immediate, setImmediate] = useState(false);
  const [error, setError] = useState("");

  const submit = () => {
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
          description="Unchecked: the subscription stays active until the end of the current period."
          checked={immediate}
          onChange={(e) => setImmediate(e.currentTarget.checked)}
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