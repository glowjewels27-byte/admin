import { useEffect, useState } from "react";
import api from "../utils/api.js";
import AdminLayout from "../components/AdminLayout.jsx";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    const load = async () => {
      const [{ data: statsData }, { data: ordersData }] = await Promise.all([api.get("/admin/stats"), api.get("/orders")]);
      setStats(statsData);
      setRecentOrders(ordersData.slice(0, 6));
    };
    load();
  }, []);

  const cards = [
    { key: "totalOrders", label: "Total Orders", value: stats?.totalOrders ?? "—" },
    { key: "totalProducts", label: "Total Products", value: stats?.totalProducts ?? "—" },
    { key: "totalRevenue", label: "Total Revenue", value: stats ? `₹${Number(stats.totalRevenue).toLocaleString("en-IN")}` : "—" },
    { key: "totalUsers", label: "Total Users", value: stats?.totalUsers ?? "—" }
  ];

  return (
    <AdminLayout>
      <div className="grid md:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div key={card.key} className="glass rounded-2xl p-5">
            <p className="text-xs uppercase tracking-[0.3em] text-white/60">{card.label}</p>
            <h3 className="text-2xl font-serif mt-2">{card.value}</h3>
          </div>
        ))}
      </div>

      <div className="glass rounded-2xl p-6 mt-6">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-2xl">Recent Orders</h2>
          <span className="text-xs uppercase tracking-[0.25em] text-white/60">Latest 6</span>
        </div>
        <div className="mt-4 space-y-3">
          {recentOrders.length === 0 && <p className="text-sm text-white/60">No recent orders yet.</p>}
          {recentOrders.map((order) => (
            <div key={order._id} className="border border-white/10 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Order #{order._id.slice(-6)}</p>
                <p className="text-xs text-white/60">{order.user?.email || "Guest"} • {order.status}</p>
              </div>
              <p className="text-sm">₹{Number(order.totalAmount).toLocaleString("en-IN")}</p>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
