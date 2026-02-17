import { useEffect, useState } from "react";
import api from "../utils/api.js";
import AdminLayout from "../components/AdminLayout.jsx";

const categoryOptions = ["Necklaces", "Earrings", "Rings", "Bracelets", "Anklets", "Combos"];
const occasionOptions = ["Daily", "Party", "Festive"];

const initialForm = {
  name: "",
  category: "",
  type: "",
  price: "",
  discountedPrice: "",
  description: "",
  images: [],
  imageUrlInput: "",
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

  const normalizeImages = (rawImages = []) => {
    const input = Array.isArray(rawImages) ? rawImages : [];
    const normalized = [];
    for (let i = 0; i < input.length; i += 1) {
      const current = String(input[i] || "").trim();
      if (!current) continue;

      // Recover previously corrupted data URLs that were split by comma.
      if (current.startsWith("data:image") && !current.includes("base64,") && input[i + 1]) {
        normalized.push(`${current},${String(input[i + 1]).trim()}`);
        i += 1;
        continue;
      }

      normalized.push(current);
    }
    return normalized;
  };

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
    setForm((prev) => ({
      ...prev,
      images: Array.from(new Set([...(prev.images || []), ...uploaded]))
    }));
    e.target.value = "";
  };

  const removeImageAt = (indexToRemove) => {
    setForm((prev) => ({ ...prev, images: prev.images.filter((_, idx) => idx !== indexToRemove) }));
  };

  const clearAllImages = () => {
    setForm((prev) => ({ ...prev, images: [] }));
  };

  const addImageUrl = () => {
    const value = form.imageUrlInput.trim();
    if (!value) return;
    setForm((prev) => ({
      ...prev,
      images: Array.from(new Set([...(prev.images || []), value])),
      imageUrlInput: ""
    }));
  };

  const submit = async (e) => {
    e.preventDefault();
    const price = Number(form.price);
    const discountedPrice = Number(form.discountedPrice || 0);
    let discount = 0;

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
      description: product.description,
      images: normalizeImages(product.images || []),
      imageUrlInput: "",
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
                    {product.category} • ₹{Math.round(product.price * (1 - (product.discount || 0) / 100))}
                    {product.discount > 0 && <span className="ml-1 line-through">₹{product.price}</span>}
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
            <select
              className="w-full rounded-lg bg-white/10 border border-white/10 px-3 py-2 text-sm"
              value={form.category}
              onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
            >
              <option value="" className="text-black">
                Category
              </option>
              {categoryOptions.map((cat) => (
                <option key={cat} value={cat} className="text-black">
                  {cat}
                </option>
              ))}
            </select>
            <select
              className="w-full rounded-lg bg-white/10 border border-white/10 px-3 py-2 text-sm"
              value={form.type}
              onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value }))}
            >
              <option value="" className="text-black">
                Occasion
              </option>
              {occasionOptions.map((occ) => (
                <option key={occ} value={occ} className="text-black">
                  {occ}
                </option>
              ))}
            </select>
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
              placeholder="Stock"
              className="w-full rounded-lg bg-white/10 border border-white/10 px-3 py-2 text-sm"
              value={form.stock}
              onChange={(e) => setForm((prev) => ({ ...prev, stock: e.target.value }))}
            />
            <div className="rounded-lg border border-white/10 px-3 py-2 text-sm text-white/70">
              Discount auto-calculated from Price and Discounted Price
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              placeholder="Paste image URL"
              className="w-full rounded-lg bg-white/10 border border-white/10 px-3 py-2 text-sm"
              value={form.imageUrlInput}
              onChange={(e) => setForm((prev) => ({ ...prev, imageUrlInput: e.target.value }))}
            />
            <button
              type="button"
              onClick={addImageUrl}
              className="rounded-lg border border-white/20 px-3 py-2 text-xs uppercase tracking-[0.2em]"
            >
              Add
            </button>
          </div>
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
          {!!form.images.length && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-[0.2em] text-white/60">Preview</span>
                <button
                  type="button"
                  onClick={clearAllImages}
                  className="text-[11px] uppercase tracking-[0.15em] text-red-300"
                >
                  Clear all
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {form.images
                  .map((img, idx) => (
                    <div key={`${img}-${idx}`} className="relative">
                      <img src={img} alt="preview" className="h-16 w-full object-cover rounded-lg border border-white/10" />
                      <button
                        type="button"
                        onClick={() => removeImageAt(idx)}
                        className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-red-500 text-white text-xs leading-5"
                      >
                        ×
                      </button>
                    </div>
                  ))}
              </div>
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
