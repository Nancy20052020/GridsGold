"use client";

import Link from "next/link";
import { Package, Truck } from "lucide-react";
import { CustomerShell } from "../../components/CustomerShell";
import { useStore, formatINR } from "../../lib/store";

export default function OrdersPage() {
  const { orders } = useStore();

  return (
    <CustomerShell>
      <section className="portal-page">
        <div className="portal-page-head">
          <div>
            <h1>My Orders</h1>
            <p>Reservations and purchases, with delivery status.</p>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="empty-state">
            <span className="portal-placeholder-icon"><Package size={24} /></span>
            <h2>No orders yet</h2>
            <p>Reserve a piece from the collection to see it here.</p>
            <Link className="portal-btn" href="/portal/catalog">Browse Collection</Link>
          </div>
        ) : (
          <div className="portal-orders">
            {orders.map((order) => (
              <article className="portal-order" key={order.id}>
                <span className="portal-order-icon">
                  {order.status === "Delivered" ? <Package size={18} /> : <Truck size={18} />}
                </span>
                <div>
                  <strong>{order.name}</strong>
                  <small>{formatINR(order.amount)} · {order.date}</small>
                </div>
                <span className={`status-pill ${order.status === "Delivered" ? "success" : order.status === "Reserved" ? "warning" : "warning"}`}>{order.status}</span>
                <Link href={`/portal/product/${order.itemId}`} className="portal-btn ghost small">View</Link>
              </article>
            ))}
          </div>
        )}
      </section>
    </CustomerShell>
  );
}
