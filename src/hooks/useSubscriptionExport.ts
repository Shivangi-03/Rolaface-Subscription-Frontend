import { useCallback, useRef, useState } from "react";
import dayjs from "dayjs";
import { getAllSubscriptions } from "../api/Subscription/subscriptionApi"; 
import { notifyError, notifySuccess } from "../utils/Alert";
import { formatDate } from "../views/Subscription/CustomerSubscription/subscription.constants"; 
import type { ApiSubscription } from "../types/subscription.types";

const EXPORT_PAGE_SIZE = 100;
const MAX_PAGES = 500;

const EXPORT_COLUMNS: { header: string; key: string; width: number; value: (r: ApiSubscription) => string | number }[] = [
  { header: "Subscription No", key: "name", width: 22, value: (r) => r.name ?? "" },
  { header: "Customer", key: "customer_name", width: 30, value: (r) => r.customer_name ?? "" },
  { header: "Customer ID", key: "customer", width: 18, value: (r) => r.customer ?? "" },
  { header: "Plan", key: "plan_name", width: 26, value: (r) => r.plan_name ?? "" },
  { header: "Billing", key: "billing_frequency", width: 16, value: (r) => r.billing_frequency ?? "" },
  { header: "Renewal Mode", key: "renewal_mode", width: 16, value: (r) => r.renewal_mode ?? "" },
  { header: "Period Start", key: "start", width: 16, value: (r) => formatDate(r.current_period_start) },
  { header: "Period End", key: "end", width: 16, value: (r) => formatDate(r.current_period_end) },
  { header: "Currency", key: "currency", width: 12, value: (r) => r.currency ?? "" },
  { header: "Total (incl. Tax)", key: "grand_total", width: 14, value: (r) => r.grand_total ?? 0 },
  { header: "Status", key: "status", width: 12, value: (r) => r.status ?? "" },
];

async function fetchAllSubscriptions(search: string): Promise<ApiSubscription[]> {
  const seen = new Set<string>();
  const all: ApiSubscription[] = [];
  let total = Infinity;

  for (let page = 1; page <= MAX_PAGES && all.length < total; page++) {
    // TODO: match the argument order of your real function
    const res = await getAllSubscriptions(page, EXPORT_PAGE_SIZE, search || undefined);
    const data = res?.data;
    if (!Array.isArray(data)) throw new Error("Unexpected response format from server");

    const t = Number(res?.pagination?.total);
    if (Number.isFinite(t) && t > 0) total = t;

    let added = 0;
    for (const row of data as ApiSubscription[]) {
      if (seen.has(row.name)) continue;
      seen.add(row.name);
      all.push(row);
      added++;
    }
    if (data.length === 0 || added === 0) break;
  }
  return all;
}

async function downloadXlsx(rows: ApiSubscription[], fileName: string) {
  const ExcelJS = (await import("exceljs")).default;
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Subscriptions");

  ws.columns = EXPORT_COLUMNS.map((c) => ({ header: c.header, key: c.key, width: c.width }));
  ws.getRow(1).font = { bold: true };
  ws.views = [{ state: "frozen", ySplit: 1 }];

  for (const r of rows) {
    ws.addRow(Object.fromEntries(EXPORT_COLUMNS.map((c) => [c.key, c.value(r)])));
  }

  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function useSubscriptionsExport(search: string) {
  const [exporting, setExporting] = useState(false);
  const running = useRef(false);

  const exportAll = useCallback(async () => {
    if (running.current) return;
    running.current = true;
    setExporting(true);
    try {
      const rows = await fetchAllSubscriptions(search.trim());
      if (rows.length === 0) throw new Error("There are no subscriptions to export.");
      await downloadXlsx(rows, `subscriptions_${dayjs().format("YYYY-MM-DD_HHmm")}.xlsx`);
      notifySuccess(`${rows.length} subscriptions exported successfully.`, "Export Complete");
    } catch (err) {
      notifyError(err, "Couldn't export subscriptions");
    } finally {
      running.current = false;
      setExporting(false);
    }
  }, [search]);

  return { exporting, exportAll };
}