import { useEffect, useState } from "react";
import { useForm } from "@mantine/form";
import { modals } from "@mantine/modals";
import { TAB_OF_FIELD, CUSTOMER_TABS, defaultValues, validateCustomer } from "../views/Customer/customer.constants";
import type { CustomerFormValues, CustomerTab } from "../types/customer.types";

interface Options {
  initial?: CustomerFormValues;
  /** Should throw on failure (parent already shows the error); modal then stays open. */
  onSave: (values: CustomerFormValues) => Promise<void>;
  onClose: () => void;
}

export function useCustomerForm({ initial, onSave, onClose }: Options) {
  const form = useForm<CustomerFormValues>({ initialValues: initial ?? defaultValues(), validate: validateCustomer });
  const [tab, setTab] = useState<CustomerTab>("details");
  const [saving, setSaving] = useState(false);

  const dirty = form.isDirty();
  const tabIndex = CUSTOMER_TABS.findIndex((t) => t.value === tab);
  const isLast = tabIndex === CUSTOMER_TABS.length - 1;

  // warn on tab close / refresh
  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  const requestClose = () => {
    if (saving) return;
    if (!form.isDirty()) return onClose();
    modals.openConfirmModal({
      title: "Discard changes?",
      children: "You have unsaved changes. If you close now, they will be lost.",
      labels: { confirm: "Discard", cancel: "Keep editing" },
      confirmProps: { color: "red" },
      onConfirm: onClose,
    });
  };

  const submit = async () => {
    if (saving) return;
    const result = form.validate();
    if (result.hasErrors) {
      const first = Object.keys(result.errors)[0];
      if (first) setTab(TAB_OF_FIELD(first));
      return;
    }
    setSaving(true);
    try {
      await onSave(form.values);
    } catch {
      // error already shown by the parent; keep the modal open so nothing is lost
    } finally {
      setSaving(false);
    }
  };

  return {
    form,
    tab,
    setTab,
    isLast,
    saving,
    next: () => setTab(CUSTOMER_TABS[Math.min(tabIndex + 1, CUSTOMER_TABS.length - 1)].value),
    reset: () => {
      form.reset();
      setTab("details");
    },
    submit,
    requestClose,
  };
}