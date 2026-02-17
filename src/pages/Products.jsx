import { useEffect, useState } from "react";
import api from "../utils/api.js";
import AdminLayout from "../components/AdminLayout.jsx";

const initialForm = {
  name: "",
  category: "",
  type: "",
  price: "",
  discountedPrice: "",
  discount: "",
  description: "",
  images: "",
  stock: "",
  tags: "",
  isActive: true
};

export default function Products() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    const { data } = await api.get("/admin/products");
    setProducts(data);
  };

  useEffect(() => {
    load();
  }, []);

  const filesToDataUrls = async (fileList) => {
    const files = Array.from(fileList || []);
    const conversions = files.map(
      (file) =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        })
    );
    return Promise.all(conversions);
  };

  const onLocalImagePick = async (e) => {
    const pickedFiles = e.target.files;
    if (!pickedFiles?.length) return;
    const uploaded = await filesToDataUrls(pickedFiles);
    setForm((prev) => {
      const existing = prev.images
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      return {
        ...prev,
        images: [...existing, ...uploaded].join(", ")
      };
    });
    e.target.value = "";
  };

  const submit = async (e) => {
    e.preventDefault();
    const price = Number(form.price);
    const discountedPrice = Number(form.discountedPrice || 0);
    let discount = Number(form.discount || 0);

    if (!price || price <= 0) return;
    if (discountedPrice > 0 && discountedPrice < price) {
      discount = Math.round(((price - discountedPrice) / price) * 100);
    }

    const payload = {
      name: form.name.trim(),
      category: form.category.trim(),
      type: form.type.trim(),
      price,
      discount,
      description: form.description.trim(),
      stock: Number(form.stock),
      images: form.images
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      tags: form.tags
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      isActive: Boolean(form.isActive)
    };

    setSubmitting(true);
    try {
      if (editingId) await api.put(`/products/${editingId}`, payload);
      else await api.post("/products", payload);
      setForm(initialForm);
      setEditingId(null);
      load();
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (product) => {
    const discountedPrice = Math.round(product.price * (1 - (product.discount || 0) / 100));
    setEditingId(product._id);
    setForm({
      name: product.name,
      category: product.category,
      type: product.type,
      price: product.price,
      discountedPrice: discountedPrice < product.price ? discountedPrice : "",
      discount: product.discount,
      description: product.description,
      images: product.images?.join(", "),
      stock: product.stock,
      tags: product.tags?.join(", ") || "",
      isActive: product.isActive
    });
  };

  const remove = async (id) => {
    await api.delete(`/products/${id}`);
    load();
  };

  return (
    <AdminLayout>
      <div className="grid lg:grid-cols-[1fr_380px] gap-6">
        <div className="glass rounded-2xl p-6">
          <h2 className="font-serif text-2xl">Inventory</h2>
          <div className="mt-4 space-y-4">
            {products.map((product) => (
              <div key={product._id} className="border border-white/10 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">{product.name}</p>
                  <p className="text-xs text-white/60">
                    {product.category} • ₹{product.price}
                    {product.discount > 0 && ` • ${product.discount}% off`}
                    {!product.isActive && " • Hidden"}
                  </p>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => startEdit(product)} className="text-xs uppercase tracking-[0.2em]">
                    Edit
                  </button>
                  <button onClick={() => remove(product._id)} className="text-xs uppercase tracking-[0.2em] text-red-300">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={submit} className="glass rounded-2xl p-6 space-y-3">
          <h3 className="font-serif text-xl">{editingId ? "Edit Product" : "Add Product"}</h3>
          <input
            placeholder="Name"
            className="w-full rounded-lg bg-white/10 border border-white/10 px-3 py-2 text-sm"
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              placeholder="Category"
              className="w-full rounded-lg bg-white/10 border border-white/10 px-3 py-2 text-sm"
              value={form.category}
              onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
            />
            <input
              placeholder="Type"
              className="w-full rounded-lg bg-white/10 border border-white/10 px-3 py-2 text-sm"
              value={form.type}
              onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              min="1"
              placeholder="Price"
              className="w-full rounded-lg bg-white/10 border border-white/10 px-3 py-2 text-sm"
              value={form.price}
              onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
            />
            <input
              type="number"
              min="0"
              placeholder="Discounted Price"
              className="w-full rounded-lg bg-white/10 border border-white/10 px-3 py-2 text-sm"
              value={form.discountedPrice}
              onChange={(e) => setForm((prev) => ({ ...prev, discountedPrice: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              min="0"
              max="99"
              placeholder="Discount % (optional)"
              className="w-full rounded-lg bg-white/10 border border-white/10 px-3 py-2 text-sm"
              value={form.discount}
              onChange={(e) => setForm((prev) => ({ ...prev, discount: e.target.value }))}
            />
            <input
              type="number"
              min="0"
              placeholder="Stock"
              className="w-full rounded-lg bg-white/10 border border-white/10 px-3 py-2 text-sm"
              value={form.stock}
              onChange={(e) => setForm((prev) => ({ ...prev, stock: e.target.value }))}
            />
          </div>
          <input
            placeholder="Images (comma-separated URLs)"
            className="w-full rounded-lg bg-white/10 border border-white/10 px-3 py-2 text-sm"
            value={form.images}
            onChange={(e) => setForm((prev) => ({ ...prev, images: e.target.value }))}
          />
          <label className="block">
            <span className="text-xs uppercase tracking-[0.2em] text-white/60">Upload local photos</span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={onLocalImagePick}
              className="mt-2 w-full rounded-lg bg-white/10 border border-white/10 px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-white file:px-3 file:py-1 file:text-xs file:text-black"
            />
          </label>
          <input
            placeholder="Tags (comma-separated)"
            className="w-full rounded-lg bg-white/10 border border-white/10 px-3 py-2 text-sm"
            value={form.tags}
            onChange={(e) => setForm((prev) => ({ ...prev, tags: e.target.value }))}
          />
          <textarea
            placeholder="Description"
            rows="3"
            className="w-full rounded-lg bg-white/10 border border-white/10 px-3 py-2 text-sm"
            value={form.description}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
          />
          <label className="flex items-center gap-2 text-sm text-white/80">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))}
            />
            Show on storefront
          </label>
          {!!form.images && (
            <div className="grid grid-cols-3 gap-2">
              {form.images
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean)
                .slice(0, 3)
                .map((img) => (
                  <img key={img} src={img} alt="preview" className="h-16 w-full object-cover rounded-lg border border-white/10" />
                ))}
            </div>
          )}
          <button
            disabled={submitting}
            className="w-full py-2 rounded-full bg-white text-black text-sm uppercase tracking-[0.3em] disabled:opacity-50"
          >
            {submitting ? "Saving..." : editingId ? "Update" : "Create"}
          </button>
        </form>
      </div>
    </AdminLayout>
  );
}
