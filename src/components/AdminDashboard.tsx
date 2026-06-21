"use client";

import { useEffect, useState, useMemo, FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard, Plus, Pencil, Trash2, X, LogOut,
  Search, ToggleLeft, ToggleRight, Save,
  AlertCircle, CheckCircle, Filter,
} from "lucide-react";
import { MenuItem, DietType } from "@/lib/menu-types";
import Image from "next/image";
export const dynamic = "force-dynamic";

type Tab = "overview" | "manage" | "add";

const DIET_OPTIONS: DietType[] = ["VEG", "EGG", "NON-VEG"];




const DIET_BADGE: Record<DietType, string> = {
  VEG: "bg-curry/15 text-curry border-curry/30",
  EGG: "bg-amber-100 text-amber-700 border-amber-300",
  "NON-VEG": "bg-chili/15 text-chili border-chili/30",
};

const emptyDraft = (): Omit<MenuItem, "id"> => ({
  name: "",
  category: "Soups",
  price: "",
  description: "",
  dietType: "VEG",
  available: true,
});

function Toast({ msg, type }: { msg: string; type: "success" | "error" }) {
  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-xl shadow-lg text-sm font-medium text-white transition-all ${
        type === "success" ? "bg-curry" : "bg-chili"
      }`}
    >
      {type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
      {msg}
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: number | string; accent?: string }) {
  return (
    <div className="rounded-2xl bg-white border border-espresso/8 p-5 shadow-sm">
      <p className="text-xs text-espresso/50 uppercase tracking-wide mb-1">{label}</p>
      <p className={`font-[family-name:var(--font-display)] text-3xl ${accent ?? "text-espresso"}`}>
        {value}
      </p>
    </div>
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [tab, setTab] = useState<Tab>("overview");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  // Manage tab state
  const [search, setSearch] = useState("");
  const [filterDiet, setFilterDiet] = useState<DietType | "ALL">("ALL");
  const [filterCat, setFilterCat] = useState<string>("ALL");
  const [filterAvail, setFilterAvail] = useState<"ALL" | "true" | "false">("ALL");

  // Edit modal
  const [editItem, setEditItem] = useState<MenuItem | null>(null);
  const [editDraft, setEditDraft] = useState<MenuItem | null>(null);
  const [editLoading, setEditLoading] = useState(false);

  // Add form
  const [addDraft, setAddDraft] = useState<Omit<MenuItem, "id">>(emptyDraft());
  const [addLoading, setAddLoading] = useState(false);
  const [customCategory, setCustomCategory] = useState("");

  function showToast(msg: string, type: "success" | "error") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  async function fetchItems() {
    const res = await fetch("/api/admin/menu");
    if (res.status === 401) { router.replace("/admin/login"); router.refresh(); return;}
    const data = await res.json();
    setItems(data);
    setLoading(false);
  }

  useEffect(() => { fetchItems(); }, []); // eslint-disable-line

  // Stats
  const stats = useMemo(() => ({
    total: items.length,
    available: items.filter((i) => i.available).length,
    veg: items.filter((i) => i.dietType === "VEG").length,
    egg: items.filter((i) => i.dietType === "EGG").length,
    nonveg: items.filter((i) => i.dietType === "NON-VEG").length,
    categories: new Set(items.map((i) => i.category)).size,
  }), [items]);

  // Filtered list for manage tab
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((item) => {
      if (q && !item.name.toLowerCase().includes(q) && !item.category.toLowerCase().includes(q)) return false;
      if (filterDiet !== "ALL" && item.dietType !== filterDiet) return false;
      if (filterCat !== "ALL" && item.category !== filterCat) return false;
      if (filterAvail === "true" && !item.available) return false;
      if (filterAvail === "false" && item.available) return false;
      return true;
    });
  }, [items, search, filterDiet, filterCat, filterAvail]);

  // All category options, derived purely from whatever's actually in the live data
  const categoryOptions = useMemo(() => {
    return Array.from(new Set(items.map((i) => i.category)));
  }, [items]);

  // ── Toggle availability inline ──
  async function toggleAvail(item: MenuItem) {
    const updated = { ...item, available: !item.available };
    const res = await fetch("/api/admin/menu", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });
    if (res.ok) {
      setItems((prev) => prev.map((i) => (i.id === item.id ? updated : i)));
      showToast(`${item.name} marked ${updated.available ? "available" : "unavailable"}`, "success");
    } else {
      showToast("Failed to update.", "error");
    }
  }

  // ── Delete ──
  async function handleDelete(item: MenuItem) {
    if (!confirm(`Delete "${item.name}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/admin/menu?id=${item.id}`, { method: "DELETE" });
    if (res.ok) {
      setItems((prev) => prev.filter((i) => i.id !== item.id));
      showToast(`"${item.name}" deleted.`, "success");
    } else {
      showToast("Delete failed.", "error");
    }
  }

  // ── Edit ──
  function openEdit(item: MenuItem) {
    setEditItem(item);
    setEditDraft({ ...item });
  }

  async function handleEditSave() {
    if (!editDraft) return;
    setEditLoading(true);
    const res = await fetch("/api/admin/menu", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editDraft),
    });
    setEditLoading(false);
    if (res.ok) {
      const saved: MenuItem = await res.json();
      setItems((prev) => prev.map((i) => (i.id === saved.id ? saved : i)));
      setEditItem(null);
      showToast("Item updated.", "success");
    } else {
      showToast("Save failed.", "error");
    }
  }

  // ── Add ──
  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    setAddLoading(true);
    const finalCategory = customCategory.trim() || addDraft.category;
    const payload = { ...addDraft, category: finalCategory };
    const res = await fetch("/api/admin/menu", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setAddLoading(false);
    if (res.ok) {
      const newItem: MenuItem = await res.json();
      setItems((prev) => [newItem, ...prev]);
      setAddDraft(emptyDraft());
      setCustomCategory("");
      showToast(`"${newItem.name}" added!`, "success");
      setTab("manage");
    } else {
      const d = await res.json();
      showToast(d.error || "Add failed.", "error");
    }
  }

  // ── Logout ──
  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  // ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-cream">
      {/* Top bar */}
      <header className="bg-espresso text-cream px-5 sm:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="inline-flex items-center justify-center w-[40px] h-[40px] rounded-4xl" style={{ background: "#1a120b" }}>
            <Image src="/adminpage.png" alt="Chandra Hotel & Restaurant logo" width={80} height={80} className="w-full h-full object-cover" />
            </div>
          <span className="font-[family-name:var(--font-display)] text-lg">
            <span className="italic text-saffron">Chandra Hotel & Restaurant</span>
            <span className="text-cream/40 text-sm font-normal ml-2">Admin</span>
          </span>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-cream/60 hover:text-cream text-sm transition-colors"
        >
          <LogOut size={16} /> Sign out
        </button>
      </header>

      {/* Tabs */}
      <div className="border-b border-espresso/10 bg-white px-5 sm:px-8">
        <div className="flex gap-0">
          {([
            { key: "overview", label: "Overview", icon: LayoutDashboard },
            { key: "manage", label: "Manage Menu", icon: Filter },
            { key: "add", label: "Add Item", icon: Plus },
          ] as { key: Tab; label: string; icon: React.ComponentType<{size?: number; className?: string}> }[]).map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-1.5 px-5 py-4 text-sm font-semibold border-b-2 transition-colors ${
                tab === key
                  ? "border-chili text-chili"
                  : "border-transparent text-espresso/50 hover:text-espresso"
              }`}
            >
              <Icon size={15} /> {label}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
        {/* ── OVERVIEW TAB ── */}
        {tab === "overview" && (
          <div>
            <h2 className="font-[family-name:var(--font-display)] text-2xl mb-6">Dashboard Overview</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
              <StatCard label="Total Items" value={stats.total} />
              <StatCard label="Available" value={stats.available} accent="text-curry" />
              <StatCard label="Unavailable" value={stats.total - stats.available} accent="text-chili" />
              <StatCard label="Veg" value={stats.veg} accent="text-curry" />
              <StatCard label="Egg" value={stats.egg} accent="text-amber-600" />
              <StatCard label="Non-Veg" value={stats.nonveg} accent="text-chili" />
            </div>

            {/* Category breakdown */}
            <div className="bg-white rounded-2xl border border-espresso/8 p-6">
              <h3 className="font-[family-name:var(--font-display)] text-lg mb-4">Items by Category</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {categoryOptions.map((cat) => {
                  const count = items.filter((i) => i.category === cat).length;
                  const avail = items.filter((i) => i.category === cat && i.available).length;
                  if (count === 0) return null;
                  return (
                    <div key={cat} className="flex items-center justify-between py-2.5 px-4 rounded-xl bg-cream-d/60 hover:bg-cream-d transition-colors">
                      <span className="text-sm font-medium truncate">{cat}</span>
                      <span className="text-xs text-espresso/50 ml-2 shrink-0">{avail}/{count} avail.</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── MANAGE TAB ── */}
        {tab === "manage" && (
          <div>
            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
              <h2 className="font-[family-name:var(--font-display)] text-2xl">
                Manage Menu
                <span className="text-espresso/40 text-base font-normal ml-2">({filtered.length} items)</span>
              </h2>
              <button
                onClick={() => setTab("add")}
                className="inline-flex items-center gap-1.5 rounded-full bg-chili text-cream text-sm font-semibold px-4 py-2 hover:bg-chili-l transition-colors"
              >
                <Plus size={15} /> Add Item
              </button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2 mb-5">
              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-espresso/40" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search..."
                  className="pl-9 pr-4 py-2 rounded-full border border-espresso/15 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-saffron/40 w-44"
                />
              </div>

              <select
                value={filterDiet}
                onChange={(e) => setFilterDiet(e.target.value as DietType | "ALL")}
                className="px-3 py-2 rounded-full border border-espresso/15 bg-white text-sm focus:outline-none"
              >
                <option value="ALL">All Types</option>
                {DIET_OPTIONS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>

              <select
                value={filterCat}
                onChange={(e) => setFilterCat(e.target.value)}
                className="px-3 py-2 rounded-full border border-espresso/15 bg-white text-sm focus:outline-none max-w-[180px]"
              >
                <option value="ALL">All Categories</option>
                {categoryOptions.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>

              <select
                value={filterAvail}
                onChange={(e) => setFilterAvail(e.target.value as "ALL" | "true" | "false")}
                className="px-3 py-2 rounded-full border border-espresso/15 bg-white text-sm focus:outline-none"
              >
                <option value="ALL">All Status</option>
                <option value="true">Available</option>
                <option value="false">Unavailable</option>
              </select>
            </div>

            {/* Table */}
            {loading ? (
              <p className="text-espresso/40 text-sm py-10 text-center">Loading…</p>
            ) : (
              <div className="rounded-2xl bg-white border border-espresso/8 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm min-w-[700px]">
                    <thead>
                      <tr className="bg-espresso text-cream text-left text-xs uppercase tracking-wide">
                        <th className="px-4 py-3 w-6"></th>
                        <th className="px-4 py-3">Name</th>
                        <th className="px-4 py-3">Category</th>
                        <th className="px-4 py-3">Type</th>
                        <th className="px-4 py-3">Price</th>
                        <th className="px-4 py-3">Description</th>
                        <th className="px-4 py-3 text-center">AVL</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="text-center py-12 text-espresso/40">
                            No items match your filters.
                          </td>
                        </tr>
                      ) : (
                        filtered.map((item, idx) => (
                          <tr
                            key={item.id}
                            className={`border-b border-espresso/5 hover:bg-cream/60 transition-colors ${
                              !item.available ? "opacity-50" : ""
                            } ${idx % 2 === 0 ? "bg-cream/20" : ""}`}
                          >
                            <td className="px-4 py-3">
                              <span className="text-xs text-espresso/30 font-mono">{item.id}</span>
                            </td>
                            <td className="px-4 py-3 font-medium">{item.name}</td>
                            <td className="px-4 py-3 text-espresso/60 text-xs">{item.category}</td>
                            <td className="px-4 py-3">
                              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${DIET_BADGE[item.dietType]}`}>
                                {item.dietType}
                              </span>
                            </td>
                            <td className="px-4 py-3 font-semibold text-chili whitespace-nowrap">{item.price}</td>
                            <td className="px-4 py-3 text-espresso/60 text-xs max-w-[180px] truncate">{item.description}</td>
                            <td className="px-4 py-3 text-center">
                              <button
                                onClick={() => toggleAvail(item)}
                                title={item.available ? "Mark unavailable" : "Mark available"}
                                className="text-espresso/50 hover:text-curry transition-colors"
                              >
                                {item.available
                                  ? <ToggleRight size={22} className="text-curry" />
                                  : <ToggleLeft size={22} />
                                }
                              </button>
                            </td>
                            <td className="px-4 py-3 text-right whitespace-nowrap">
                              <button
                                onClick={() => openEdit(item)}
                                className="text-espresso/40 hover:text-saffron p-1.5 transition-colors"
                                title="Edit"
                              >
                                <Pencil size={15} />
                              </button>
                              <button
                                onClick={() => handleDelete(item)}
                                className="text-espresso/40 hover:text-chili p-1.5 transition-colors"
                                title="Delete"
                              >
                                <Trash2 size={15} />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── ADD TAB ── */}
        {tab === "add" && (
          <div className="max-w-xl">
            <h2 className="font-[family-name:var(--font-display)] text-2xl mb-6">Add New Item</h2>
            <form onSubmit={handleAdd} className="bg-white rounded-2xl border border-espresso/8 p-6 shadow-sm flex flex-col gap-4">
              {/* Name */}
              <Field label="Item Name *">
                <input
                  required
                  value={addDraft.name}
                  onChange={(e) => setAddDraft((d) => ({ ...d, name: e.target.value }))}
                  placeholder="e.g. Paneer Butter Masala"
                  className={inputCls}
                />
              </Field>

              {/* Category */}
              <Field label="Category *">
                <select
                  value={addDraft.category}
                  onChange={(e) => setAddDraft((d) => ({ ...d, category: e.target.value }))}
                  className={inputCls}
                >
                  {categoryOptions.map((c) => <option key={c} value={c}>{c}</option>)}
                  <option value="__custom__">+ New Category…</option>
                </select>
                {addDraft.category === "__custom__" && (
                  <input
                    required
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    placeholder="Enter new category name"
                    className={`${inputCls} mt-2`}
                  />
                )}
              </Field>

              {/* Diet Type */}
              <Field label="Type *">
                <div className="flex gap-2">
                  {DIET_OPTIONS.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setAddDraft((dr) => ({ ...dr, dietType: d }))}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-bold border-2 transition-colors ${
                        addDraft.dietType === d
                          ? d === "VEG"
                            ? "bg-curry text-white border-curry"
                            : d === "EGG"
                            ? "bg-amber-500 text-white border-amber-500"
                            : "bg-chili text-white border-chili"
                          : "border-espresso/15 text-espresso/60 hover:border-espresso/40"
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </Field>

              {/* Price */}
              <Field label="Price *">
                <input
                  required
                  value={addDraft.price}
                  onChange={(e) => setAddDraft((d) => ({ ...d, price: e.target.value }))}
                  placeholder="e.g. ₹230 or ₹80 / ₹130"
                  className={inputCls}
                />
              </Field>

              {/* Description */}
              <Field label="Description / Badge">
                <input
                  value={addDraft.description}
                  onChange={(e) => setAddDraft((d) => ({ ...d, description: e.target.value }))}
                  placeholder="e.g. Guest's Fav · Chef's Special · NEW · Spicy"
                  className={inputCls}
                />
                <p className="text-xs text-espresso/40 mt-1">Separate multiple badges with · (middle dot)</p>
              </Field>

              {/* Available */}
              <Field label="Available">
                <button
                  type="button"
                  onClick={() => setAddDraft((d) => ({ ...d, available: !d.available }))}
                  className="flex items-center gap-2 text-sm font-medium"
                >
                  {addDraft.available
                    ? <ToggleRight size={28} className="text-curry" />
                    : <ToggleLeft size={28} className="text-espresso/30" />}
                  <span className={addDraft.available ? "text-curry" : "text-espresso/40"}>
                    {addDraft.available ? "Available" : "Unavailable"}
                  </span>
                </button>
              </Field>

              <button
                type="submit"
                disabled={addLoading}
                className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-chili text-cream font-bold py-3 hover:bg-chili-l active:scale-[0.98] transition-all disabled:opacity-60"
              >
                <Save size={16} /> {addLoading ? "Adding…" : "Add Item"}
              </button>
            </form>
          </div>
        )}
      </main>

      {/* ── EDIT MODAL ── */}
      {editItem && editDraft && (
        <div className="fixed inset-0 z-50 bg-espresso/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-cream rounded-2xl w-full max-w-lg shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-espresso/10">
              <h3 className="font-[family-name:var(--font-display)] text-xl">Edit Item</h3>
              <button onClick={() => setEditItem(null)} className="text-espresso/40 hover:text-chili">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 flex flex-col gap-4">
              {/* ID (read-only) */}
              <Field label="ID (read-only)">
                <input value={editDraft.id} readOnly className={`${inputCls} opacity-50 cursor-not-allowed`} />
              </Field>

              <Field label="Item Name *">
                <input
                  required
                  value={editDraft.name}
                  onChange={(e) => setEditDraft((d) => d ? { ...d, name: e.target.value } : d)}
                  className={inputCls}
                />
              </Field>

              <Field label="Category *">
                <input
                  value={editDraft.category}
                  onChange={(e) => setEditDraft((d) => d ? { ...d, category: e.target.value } : d)}
                  className={inputCls}
                  list="category-list"
                />
                <datalist id="category-list">
                  {categoryOptions.map((c) => <option key={c} value={c} />)}
                </datalist>
              </Field>

              <Field label="Type *">
                <div className="flex gap-2">
                  {DIET_OPTIONS.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setEditDraft((dr) => dr ? { ...dr, dietType: d } : dr)}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-bold border-2 transition-colors ${
                        editDraft.dietType === d
                          ? d === "VEG"
                            ? "bg-curry text-white border-curry"
                            : d === "EGG"
                            ? "bg-amber-500 text-white border-amber-500"
                            : "bg-chili text-white border-chili"
                          : "border-espresso/15 text-espresso/60"
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </Field>

              <Field label="Price *">
                <input
                  value={editDraft.price}
                  onChange={(e) => setEditDraft((d) => d ? { ...d, price: e.target.value } : d)}
                  className={inputCls}
                />
              </Field>

              <Field label="Description / Badge">
                <input
                  value={editDraft.description}
                  onChange={(e) => setEditDraft((d) => d ? { ...d, description: e.target.value } : d)}
                  placeholder="e.g. Guest's Fav · Chef's Special"
                  className={inputCls}
                />
              </Field>

              <Field label="Available">
                <button
                  type="button"
                  onClick={() => setEditDraft((d) => d ? { ...d, available: !d.available } : d)}
                  className="flex items-center gap-2 text-sm font-medium"
                >
                  {editDraft.available
                    ? <ToggleRight size={28} className="text-curry" />
                    : <ToggleLeft size={28} className="text-espresso/30" />}
                  <span className={editDraft.available ? "text-curry" : "text-espresso/40"}>
                    {editDraft.available ? "Available" : "Unavailable"}
                  </span>
                </button>
              </Field>

              <button
                onClick={handleEditSave}
                disabled={editLoading}
                className="flex items-center justify-center gap-2 rounded-xl bg-chili text-cream font-bold py-3 hover:bg-chili-l active:scale-[0.98] transition-all disabled:opacity-60 mt-2"
              >
                <Save size={16} /> {editLoading ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────────
const inputCls =
  "w-full rounded-xl border border-espresso/15 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-saffron/40";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-espresso/60 uppercase tracking-wide mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}
