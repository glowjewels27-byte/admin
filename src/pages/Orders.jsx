import { useEffect, useState } from "react";
import api from "../utils/api.js";
import AdminLayout from "../components/AdminLayout.jsx";

const statuses = ["Pending", "Shipped", "Delivered", "Cancelled"];

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const load = async () => {
    const { data } = await api.get("/orders");
    setOrders(data);
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (id, status) => {
    await api.put(`/orders/${id}/status`, { status });
    load();
  };

  const openOrder = async (orderId) => {
    setLoadingDetail(true);
    try {
      const { data } = await api.get(`/orders/${orderId}`);
      setSelectedOrder(data);
    } finally {
      setLoadingDetail(false);
    }
  };

  return (
    <AdminLayout>
      <div className="glass rounded-2xl p-6">
        <h2 className="font-serif text-2xl">Orders</h2>
        <div className="mt-4 space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="border border-white/10 rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-sm text-white/70">
                <span>#{order._id.slice(-6)}</span>
                <span>{order.user?.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <p>Total: ₹{order.totalAmount}</p>
                <div className="flex items-center gap-3">
                  <button onClick={() => openOrder(order._id)} className="text-xs uppercase tracking-[0.2em] border border-white/20 rounded-lg px-3 py-1">
                    View
                  </button>
                  <select
                    value={order.status}
                    onChange={(e) => updateStatus(order._id, e.target.value)}
                    className="bg-white/10 border border-white/10 rounded-lg px-3 py-1 text-sm"
                  >
                    {statuses.map((status) => (
                      <option key={status} value={status} className="text-black">
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {(selectedOrder || loadingDetail) && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl glass rounded-2xl p-6 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-2xl">Order Detail</h3>
              <button onClick={() => setSelectedOrder(null)} className="text-xs uppercase tracking-[0.2em]">
                Close
              </button>
            </div>

            {loadingDetail && <p className="mt-4 text-sm text-white/60">Loading...</p>}

            {!loadingDetail && selectedOrder && (
              <div className="mt-4 space-y-5">
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div className="border border-white/10 rounded-xl p-4">
                    <p className="text-white/60">Order ID</p>
                    <p>#{selectedOrder._id.slice(-10)}</p>
                  </div>
                  <div className="border border-white/10 rounded-xl p-4">
                    <p className="text-white/60">Customer</p>
                    <p>{selectedOrder.user?.name || "—"}</p>
                    <p className="text-white/70">{selectedOrder.user?.email || "—"}</p>
                  </div>
                  <div className="border border-white/10 rounded-xl p-4">
                    <p className="text-white/60">Payment</p>
                    <p>{selectedOrder.paymentMethod}</p>
                    <p className="text-white/70">{selectedOrder.paymentStatus}</p>
                  </div>
                  <div className="border border-white/10 rounded-xl p-4">
                    <p className="text-white/60">Status</p>
                    <p>{selectedOrder.status}</p>
                    <p className="text-white/70">₹{Number(selectedOrder.totalAmount).toLocaleString("en-IN")}</p>
                  </div>
                </div>

                <div className="border border-white/10 rounded-xl p-4">
                  <p className="text-white/60 text-sm">Shipping Address</p>
                  <p className="mt-1">{selectedOrder.shippingAddress?.fullName || "—"}</p>
                  <p className="text-white/80">{selectedOrder.shippingAddress?.line1 || ""}</p>
                  <p className="text-white/80">{selectedOrder.shippingAddress?.line2 || ""}</p>
                  <p className="text-white/80">
                    {selectedOrder.shippingAddress?.city || ""} {selectedOrder.shippingAddress?.state || ""} {selectedOrder.shippingAddress?.postalCode || ""}
                  </p>
                  <p className="text-white/80">{selectedOrder.shippingAddress?.phone || ""}</p>
                </div>

                <div className="space-y-3">
                  <p className="text-sm text-white/60">Items</p>
                  {selectedOrder.products?.map((item, idx) => (
                    <div key={`${item.product}-${idx}`} className="border border-white/10 rounded-xl p-3 flex items-center justify-between text-sm">
                      <div>
                        <p>{item.name}</p>
                        <p className="text-white/70">Qty: {item.qty}</p>
                      </div>
                      <p>₹{Number(item.price * item.qty).toLocaleString("en-IN")}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
