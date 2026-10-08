import { useCallback, useRef, useState } from "react";
import dayjs from "dayjs";
import { getAllCustomers } from "../api/customerApi";
import { notifyError, notifySuccess } from "../utils/Alert";
import type { CustomerSummary } from "../types/customer.types";

const EXPORT_PAGE_SIZE = 100;
const MAX_PAGES = 500; // safety cap against runaway loops

const EXPORT_COLUMNS: { header: string; key: string; width: number; value: (r: CustomerSummary) => string }[] = [
  { header: "Customer ID", key: "id", width: 18, value: (r) => r.id ?? "" },
  { header: "Name", key: "name", width: 30, value: (r) => r.name ?? "" },
  { header: "Email", key: "email", width: 34, value: (r) => r.email ?? "" },
  { header: "Phone", key: "mobile", width: 20, value: (r) => r.mobile ?? "" },
  { header: "Currency", key: "currency", width: 12, value: (r) => r.currency ?? "" },
  { header: "Status", key: "status", width: 12, value: (r) => r.status ?? "" },
];

// Fetches every page for the given search. Stops when the total is reached,
// a page is empty, or a page brings no new rows (server ignoring `page`).
async function fetchAllCustomers(search: string): Promise<CustomerSummary[]> {
  const seen = new Set<string>();
  const all: CustomerSummary[] = [];
  let total = Infinity;

  for (let page = 1; page <= MAX_PAGES && all.length < total; page++) {
    const res = await getAllCustomers(page, EXPORT_PAGE_SIZE, undefined, search || undefined);
    const data = res?.data;
    if (!Array.isArray(data)) throw new Error("Unexpected response format from server");

    const t = Number(res?.pagination?.total);
    if (Number.isFinite(t) && t > 0) total = t;

    let added = 0;
    for (const row of data as CustomerSummary[]) {
      if (seen.has(row.id)) continue;
      seen.add(row.id);
      all.push(row);
      added++;
    }
    if (data.length === 0 || added === 0) break;
  }
  return all;
}

async function downloadXlsx(rows: CustomerSummary[], fileName: string) {
  const ExcelJS = (await import("exceljs")).default;
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Customers");

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

export function useCustomerExport(search: string) {
  const [exporting, setExporting] = useState(false);
  const running = useRef(false);

  const exportAll = useCallback(async () => {
    if (running.current) return; 
    running.current = true;
    setExporting(true);
    try {
      const rows = await fetchAllCustomers(search.trim());
      if (rows.length === 0) throw new Error("There are no customers to export.");
      await downloadXlsx(rows, `customers_${dayjs().format("YYYY-MM-DD_HHmm")}.xlsx`);
      notifySuccess(`${rows.length} customers exported successfully.`, "Export Complete");
    } catch (err) {
      notifyError(err, "Couldn't export customers");
    } finally {
      running.current = false;
      setExporting(false);
    }
  }, [search]);

  return { exporting, exportAll };
}