import { useState } from "react";
import { Link } from "react-router-dom";
import { formatMoney, titleCaseStatus } from "@/lib/format";
import { useGetOrdersQuery } from "@/store/adminApi";
import { TableSkeleton } from "@/components/Skeleton";
import Pagination from "@/components/Pagination";

const STATUSES = [
  ["", "All statuses"],
  ["pending", "Pending"],
  ["processing", "Processing"],
  ["shipped", "Shipped"],
  ["delivered", "Delivered"],
  ["cancelled", "Cancelled"],
  ["refunded", "Refunded"],
] as const;

const STORES = [
  ["powerline", "Powerline Devices"],
  ["serverembassy", "Server Embassy"],
  ["", "All Enterprise Channels"],
] as const;

function StoreBadge({ store }: { store?: string }) {
  const s = (store || "serverembassy").toLowerCase();
  if (s.includes("serverembassy") || s === "se") {
    return (
      <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-xs font-semibold text-[#0066cc] border border-blue-200">
        Server Embassy
      </span>
    );
  }
  if (s.includes("powerline")) {
    return (
      <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700 border border-amber-200">
        Powerline
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
  return (
    <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 border border-slate-200">
      {store || "Default"}
    </span>
  );
}

export default function OrdersPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [store, setStore] = useState("powerline");
  const { data, isLoading } = useGetOrdersQuery({
    page,
    status: status || undefined,
    store: store || undefined,
  });

  const orders = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;

  if (isLoading && !data) return <TableSkeleton cols={6} rows={6} className="mt-6" />;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-navy">Orders</h1>
          <p className="text-sm text-muted">
            {data ? `${data.total} orders · page ${data.page} of ${totalPages}` : "Loading…"}
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          {/* Store / Channel Selector */}
          <select
            value={store}
            onChange={(e) => {
              setStore(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-line bg-white px-3 py-2 text-sm font-medium text-navy shadow-xs"
          >
            {STORES.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>

          {/* Status Selector */}
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-line bg-white px-3 py-2 text-sm shadow-xs"
          >
            {STATUSES.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl bg-white ring-1 ring-line">
        <table className="w-full text-sm">
          <thead className="bg-page text-left text-muted">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Website</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Total</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted">
                  No orders match this filter.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="border-t border-line hover:bg-slate-50/50 transition">
                  <td className="px-4 py-3 font-medium">
                    <Link to={`/orders/${order.id}`} className="hover:text-brand font-semibold text-navy">
                      {order.orderNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <StoreBadge store={order.store} />
                  </td>
                  <td className="px-4 py-3 text-slate-600">{order.email}</td>
                  <td className="px-4 py-3 text-slate-500">
                    {order.placedAt
                      ? new Date(order.placedAt).toLocaleDateString()
                      : order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString()
                        : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex rounded-full px-2 py-0.5 text-xs font-medium bg-slate-100 text-slate-800">
                      {titleCaseStatus(order.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-navy">{formatMoney(order.total)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <Pagination
          page={page}
          totalPages={totalPages}
          total={data?.total ?? 0}
          onChange={(p) => setPage(p)}
          label="orders"
        />
      </div>
    </div>
  );
}
