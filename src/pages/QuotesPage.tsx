import { useState } from "react";
import { useGetQuotesQuery, useUpdateQuoteStatusMutation } from "@/store/adminApi";
import { TableSkeleton } from "@/components/Skeleton";
import Pagination from "@/components/Pagination";
import { useToast, getErrorMessage } from "@/components/Toast";

const statuses = ["new", "contacted", "quoted", "won", "lost"];

const STORES = [
  ["powerline", "Powerline Devices"],
  ["serverembassy", "Server Embassy"],
  ["", "All Enterprise Channels"],
] as const;

function StoreBadge({ store }: { store?: string }) {
  const s = (store || "powerline").toLowerCase();
  if (s.includes("powerline") || s === "pl") {
    return (
      <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-xs font-semibold text-[#0066cc] border border-blue-200">
        Power Line Devices
      </span>
    );
  }
  if (s.includes("serverembassy") || s === "se") {
    return (
      <span className="inline-flex items-center rounded-md bg-slate-50 px-2 py-0.5 text-xs font-semibold text-slate-700 border border-slate-200">
        Server Embassy
      </span>
    );
  }
  if (s.includes("lucky") || s.includes("scoop")) {
    return (
      <span className="inline-flex items-center rounded-md bg-pink-50 px-2 py-0.5 text-xs font-semibold text-pink-700 border border-pink-200">
        Lucky Scoop
      </span>
    );
  }
  return <span className="text-xs text-muted font-medium">{store || "Default"}</span>;
}

export default function QuotesPage() {
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [store, setStore] = useState("");
  const { data, isLoading } = useGetQuotesQuery({
    page,
    store: store || undefined,
  });
  const quotes = Array.isArray(data) ? data : (data?.items ?? []);
  const totalPages = data?.totalPages ?? 1;
  const [updateStatus] = useUpdateQuoteStatusMutation();

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-navy">Quotes / RFQ</h1>
          <p className="text-sm text-muted">Inbound bulk-quote and enterprise RFQ form submissions.</p>
        </div>
        <select
          value={store}
          onChange={(e) => {
            setStore(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-line bg-white px-3 py-2 text-sm font-medium text-navy shadow-xs"
        >
          {STORES.map(([val, label]) => (
            <option key={val} value={val}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <TableSkeleton cols={7} rows={5} className="mt-6" />
      ) : (
        <div className="mt-6 overflow-hidden rounded-2xl bg-white ring-1 ring-line">
          <table className="w-full text-sm">
            <thead className="bg-page text-left text-muted">
              <tr>
                <th className="px-4 py-3">Website</th>
                <th className="px-4 py-3">Name / Contact</th>
                <th className="px-4 py-3">Company</th>
                <th className="px-4 py-3">Part #</th>
                <th className="px-4 py-3">Qty</th>
                <th className="px-4 py-3">Target</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {quotes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-sm text-muted">
                    No quote requests match this filter.
                  </td>
                </tr>
              ) : (
                quotes.map((quote) => (
                  <tr key={quote.id} className="border-t border-line hover:bg-slate-50/50 transition">
                    <td className="px-4 py-3">
                      <StoreBadge store={quote.store} />
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-navy">{quote.name}</p>
                      <p className="text-xs text-muted">{quote.email}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{quote.company || "—"}</td>
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-navy">{quote.partNumber || "—"}</td>
                    <td className="px-4 py-3">{quote.quantity ?? "—"}</td>
                    <td className="px-4 py-3 font-semibold text-navy">
                      {quote.targetPrice != null ? `$${quote.targetPrice}` : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        className="rounded-lg border border-line px-2 py-1 text-xs"
                        value={quote.status}
                        onChange={async (e) => {
                          try {
                            await updateStatus({ id: quote.id, status: e.target.value }).unwrap();
                            toast("Quote status updated", "success");
                          } catch (err) {
                            toast(getErrorMessage(err, "Could not update quote status."), "error");
                          }
                        }}
                      >
                        {statuses.map((s) => (
                          <option key={s} value={s}>
                            {s.charAt(0).toUpperCase() + s.slice(1)}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <Pagination page={page} totalPages={totalPages} total={data?.total ?? 0} onChange={setPage} label="quotes" />
        </div>
      )}
    </div>
  );
}
