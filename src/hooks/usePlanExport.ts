import { useCallback, useRef, useState } from "react";
import dayjs from "dayjs";
import { getAllPlans } from "../api/planAPi"; 
import { notifyError, notifySuccess } from "../utils/Alert";
type ApiPlan = {
  name: string;
  plan_name: string;
  plan_code: string;
  status: string;
  products: string[];
  pricing_model: string;
  billing_frequency: string;
  currency: string;
  base_price: number;
};

const EXPORT_PAGE_SIZE = 100;
const MAX_PAGES = 500; // safety cap against runaway loops

const EXPORT_COLUMNS: { header: string; key: string; width: number; value: (r: ApiPlan) => string | number }[] = [
  { header: "Plan Name", key: "plan_name", width: 30, value: (r) => r.plan_name ?? "" },
  { header: "Plan Code", key: "plan_code", width: 20, value: (r) => r.plan_code ?? "" },
  { header: "Products", key: "products", width: 24, value: (r) => (r.products ?? []).join(", ") },
  { header: "Billing", key: "billing_frequency", width: 16, value: (r) => r.billing_frequency ?? "" },
  { header: "Pricing Model", key: "pricing_model", width: 18, value: (r) => r.pricing_model ?? "" },
  { header: "Currency", key: "currency", width: 12, value: (r) => r.currency ?? "" },
  { header: "Price", key: "base_price", width: 14, value: (r) => r.base_price ?? 0 },
  { header: "Status", key: "status", width: 12, value: (r) => r.status ?? "" },
];

async function fetchAllPlans(search: string): Promise<ApiPlan[]> {
  const seen = new Set<string>();
  const all: ApiPlan[] = [];
  let total = Infinity;

  for (let page = 1; page <= MAX_PAGES && all.length < total; page++) {
    // TODO: match the argument order of your real function
    const res = await getAllPlans(page, EXPORT_PAGE_SIZE, search || undefined);
    const data = res?.data;
    if (!Array.isArray(data)) throw new Error("Unexpected response format from server");

    const t = Number(res?.pagination?.total);
    if (Number.isFinite(t) && t > 0) total = t;

    let added = 0;
        for (const row of data as ApiPlan[]) {
      if (seen.has(row.name)) continue;
      seen.add(row.name);
      all.push(row);
      added++;
    }
    if (data.length === 0 || added === 0) break;
  }
  return all;
}

async function downloadXlsx(rows: ApiPlan[], fileName: string) {
  const ExcelJS = (await import("exceljs")).default;
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Plans");

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

export function usePlansExport(search: string) {
  const [exporting, setExporting] = useState(false);
  const running = useRef(false);

  const exportAll = useCallback(async () => {
    if (running.current) return;
    running.current = true;
    setExporting(true);
    try {
      const rows = await fetchAllPlans(search.trim());
      if (rows.length === 0) throw new Error("There are no plans to export.");
      await downloadXlsx(rows, `plans_${dayjs().format("YYYY-MM-DD_HHmm")}.xlsx`);
      notifySuccess(`${rows.length} plans exported successfully.`, "Export Complete");
    } catch (err) {
      notifyError(err, "Couldn't export plans");
    } finally {
      running.current = false;
      setExporting(false);
    }
  }, [search]);

  return { exporting, exportAll };
}