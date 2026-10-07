import { lazy } from "react";
import type { SubscriptionDetail } from "../../../types/subscription.types";
import type { ModalRenderFn } from "./registryTypes";

const SubscriptionFormModal = lazy(
  () => import("../../Subscription/CustomerSubscription/CustomerSubscriptionModal"),
);

export const subscriptionModalsRegistry: Record<string, ModalRenderFn> = {
  subscription: (modal, _context, { handleClose }) => (
    <SubscriptionFormModal
      key={modal.id}
      modalId={modal.id}
      subscription={modal.isEdit ? (modal.initialData as SubscriptionDetail) : null}
      onClose={handleClose}
    />
  ),
};