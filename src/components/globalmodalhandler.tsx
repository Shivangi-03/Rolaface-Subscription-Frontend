import { Suspense, lazy } from "react";
import { useModalStore } from "../../src/store/modalstore";
import type { Plan } from "../../src/types/plan.types";
import type { SubscriptionDetail } from "../../src/types/subscription.types";

const PlanFormModal = lazy(() => import("../../src/components/Subscription/Plan/PlanModal"));
const SubscriptionFormModal = lazy(() => import("../components/Subscription/CustomerSubscription/CustomerSubscriptionModal"));

const GlobalModalHandler = () => {
  const modals = useModalStore((s) => s.modals);
  const closeModal = useModalStore((s) => s.closeModal);

  return (
    <>
      {modals.map((m) =>
        m.type === "subscription" ? (
          <Suspense key={m.id} fallback={null}>
            <SubscriptionFormModal
              modalId={m.id}
              subscription={m.isEdit ? (m.initialData as SubscriptionDetail) : null}
              onClose={() => closeModal(m.id)}
            />
          </Suspense>
               ) : m.type === "plan" ? (
          <Suspense key={m.id} fallback={null}>
            <PlanFormModal
              modalId={m.id}
              plan={m.isEdit ? (m.initialData as Plan) : null}
              onClose={() => closeModal(m.id)}
            />
          </Suspense>
        ) : null,
      )}
    </>
  );
};

export default GlobalModalHandler;