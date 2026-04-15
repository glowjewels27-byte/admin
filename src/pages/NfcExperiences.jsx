import { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout.jsx";
import api from "../utils/api.js";

const initialForm = {
  customerName: "",
  audioName: "",
  audioDataUrl: ""
};

const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export default function NfcExperiences() {
  const [form, setForm] = useState(initialForm);
  const [entries, setEntries] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState("");

  const load = async () => {
    const { data } = await api.get("/nfc");
    setEntries(data || []);
  };

  useEffect(() => {
    load();
  }, []);

  const onAudioPick = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const audioDataUrl = await fileToDataUrl(file);
    setForm((prev) => ({
      ...prev,
      audioName: file.name,
      audioDataUrl
    }));
    e.target.value = "";
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.customerName.trim() || !form.audioDataUrl) return;
    setSubmitting(true);
    try {
      await api.post("/nfc", {
        customerName: form.customerName.trim(),
        audioName: form.audioName || `${form.customerName.trim()} voice note`,
        audioDataUrl: form.audioDataUrl
      });
      setForm(initialForm);
      load();
    } finally {
      setSubmitting(false);
    }
  };

  const copyLink = async (url) => {
    await navigator.clipboard.writeText(url);
    setCopied(url);
    setTimeout(() => setCopied(""), 1800);
  };

  return (
    <AdminLayout>
      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <form onSubmit={submit} className="glass rounded-3xl p-6 space-y-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">Glow NFC</p>
            <h2 className="mt-2 font-serif text-3xl">Create ring audio page</h2>
            <p className="mt-3 text-sm text-white/65">
              Add the customer name and one audio track. We’ll generate a unique mobile page URL for that ring.
            </p>
          </div>

          <input
            placeholder="Customer name"
            className="w-full rounded-2xl bg-white/10 border border-white/10 px-4 py-3 text-sm"
            value={form.customerName}
            onChange={(e) => setForm((prev) => ({ ...prev, customerName: e.target.value }))}
          />

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-white/50">Upload audio</p>
            <input type="file" accept="audio/*" onChange={onAudioPick} className="mt-3 block w-full text-sm" />
            <p className="mt-3 text-sm text-white/70">{form.audioName || "No audio selected yet"}</p>
          </div>

          <button
            disabled={submitting || !form.customerName.trim() || !form.audioDataUrl}
            className="w-full rounded-full bg-white text-black py-3 text-sm uppercase tracking-[0.28em] disabled:opacity-50"
          >
            {submitting ? "Creating..." : "Create NFC Page"}
          </button>
        </form>

        <div className="glass rounded-3xl p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/50">Generated links</p>
              <h2 className="mt-2 font-serif text-3xl">Audio pages</h2>
            </div>
            <span className="rounded-full border border-white/10 px-4 py-2 text-xs uppercase tracking-[0.24em] text-white/60">
              {entries.length} total
            </span>
          </div>

          <div className="mt-6 space-y-4">
            {entries.map((entry) => (
              <div key={entry._id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-lg">{entry.customerName}</p>
                    <p className="mt-1 text-sm text-white/60">{entry.audioName}</p>
                    <p className="mt-2 text-xs text-white/40">/{entry.slug}</p>
                  </div>
                  <button
                    onClick={() => copyLink(entry.publicUrl)}
                    type="button"
                    className="rounded-full border border-white/15 px-4 py-2 text-xs uppercase tracking-[0.24em]"
                  >
                    {copied === entry.publicUrl ? "Copied" : "Copy Link"}
                  </button>
                </div>
                <a
                  href={entry.publicUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 block truncate text-sm text-pink-200 underline underline-offset-4"
                >
                  {entry.publicUrl}
                </a>
              </div>
            ))}

            {!entries.length && <p className="text-sm text-white/55">No audio pages created yet.</p>}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
