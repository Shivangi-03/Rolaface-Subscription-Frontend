import { useEffect, useState } from "react";
import { useForm } from "@mantine/form";
import { createCustomer, updateCustomerByCustomerCode } from "../api/customerApi";
import { notifyError, notifySuccess, openCommonModal } from "../utils/Alert";
import { REFRESH_KEYS, useDataRefreshStore } from "../../src/store/datarefreshstore";
import {
  TAB_OF_FIELD,
  CUSTOMER_TABS,
  buildCreatePayload,
  buildUpdatePayload,
  defaultValues,
  validateCustomer,
} from "../views/Customer/customer.constants";
import type { CustomerDetail, CustomerFormValues, CustomerTab } from "../types/customer.types";

interface Options {
  initial?: CustomerFormValues;
  customer?: CustomerDetail | null;
  /** View mode: no unsaved-changes warnings, submit is blocked. */
  readOnly?: boolean;
  onClose: () => void;
}

export function useCustomerForm({ initial, customer, readOnly = false, onClose }: Options) {
  const form = useForm<CustomerFormValues>({ initialValues: initial ?? defaultValues(), validate: validateCustomer });
  const [tab, setTab] = useState<CustomerTab>("details");
  const [saving, setSaving] = useState(false);

  const dirty = !readOnly && form.isDirty();
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
    if (readOnly || !form.isDirty()) return onClose();
    openCommonModal({
      heading: "Discard Changes",
      subtitle: "You have unsaved changes.",
      body: "If you close now, your unsaved changes will be lost.",
      color: "red",
      buttons: [
        { label: "Keep editing", variant: "default" },
        { label: "Discard", color: "red", onClick: onClose },
      ],
    });
  };

  const submit = async () => {
    if (saving || readOnly) return;
    const result = form.validate();
    if (result.hasErrors) {
      const first = Object.keys(result.errors)[0];
      if (first) setTab(TAB_OF_FIELD(first));
      return;
    }
    setSaving(true);
    try {
      const v = form.values;
      if (customer) {
        await updateCustomerByCustomerCode(customer.id, buildUpdatePayload(v, customer));
        notifySuccess(`Customer ${v.name.trim()} has been updated successfully.`, "Customer Updated");
      } else {
        const res = await createCustomer(buildCreatePayload(v));
        const newId = res?.message?.data?.customerId as string | undefined;
        notifySuccess(
          newId
            ? `Customer ${v.name.trim()} (${newId}) has been created successfully.`
            : `Customer ${v.name.trim()} has been created successfully.`,
          "Customer Created",
        );
      }
      useDataRefreshStore.getState().triggerRefresh(REFRESH_KEYS.CUSTOMER_LIST);
      onClose();
    } catch (err) {
      notifyError(err, "Couldn't save customer");
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
    next: () => {
      const nextTab = CUSTOMER_TABS[Math.min(tabIndex + 1, CUSTOMER_TABS.length - 1)];
      if (nextTab) setTab(nextTab.value);
    },
    reset: () => {
      form.reset();
      setTab("details");
    },
    submit,
    requestClose,
  };
}