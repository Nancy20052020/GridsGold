"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, PackagePlus } from "lucide-react";
import { INVENTORY_CATEGORIES, PRODUCT_ICONS } from "../../lib/categories";
import { AppShell } from "../../components/AppShell";
import { useStore, itemPrice, formatINR, type Karat } from "../../lib/store";
import { defaultProductImage } from "../../lib/productImages";

const categories = [...INVENTORY_CATEGORIES];
const karats: Karat[] = ["24K", "22K", "18K", "925", "PT950"];
const branches = ["Main Branch", "Branch 2", "Branch 3", "Branch 4", "Vault"];
const icons = [...PRODUCT_ICONS];

export default function AddItemPage() {
  const router = useRouter();
  const { addItem, rates } = useStore();
  const [form, setForm] = useState({
    name: "",
    sku: "",
    category: "Rings",
    karat: "22K" as Karat,
    weight: "",
    making: "",
    stoneValue: "",
    stock: "1",
    branch: "Main Branch",
    icon: "ring",
  });
  const [error, setError] = useState("");

  const weight = Number(form.weight) || 0;
  const preview = itemPrice(
    { weight, making: Number(form.making) || 0, stoneValue: Number(form.stoneValue) || 0, karat: form.karat } as never,
    rates,
  );

  function update(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (error) setError("");
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!form.name.trim() || !form.sku.trim() || weight <= 0) {
      setError("Please enter a name, SKU and a weight greater than 0.");
      return;
    }
    addItem({
      name: form.name.trim(),
      sku: form.sku.trim().toUpperCase(),
      category: form.category,
      karat: form.karat,
      weight,
      making: Number(form.making) || 0,
      stoneValue: Number(form.stoneValue) || 0,
      stock: Number(form.stock) || 0,
      branch: form.branch,
      icon: form.icon,
      image: defaultProductImage(form.category, form.icon),
    });
    router.push("/inventory");
  }

  return (
    <AppShell>
      <section className="page-content">
        <div className="page-heading">
          <div className="heading-copy">
            <PackagePlus size={28} />
            <div>
              <span className="eyebrow">Inventory</span>
              <h1>Add New Item</h1>
              <p>Create a jewellery item. Selling price is derived from the live gold rate.</p>
            </div>
          </div>
          <div className="heading-actions">
            <Link className="ghost-action" href="/inventory"><ArrowLeft size={16} /> Back</Link>
          </div>
        </div>

        <form className="erp-panel form-panel" onSubmit={submit} noValidate>
          <div className="form-grid form-grid-3">
            <label className="field">
              <span>Item name *</span>
              <div className="field-input"><input value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="e.g. 22K Gold Ring" /></div>
            </label>
            <label className="field">
              <span>SKU / Barcode *</span>
              <div className="field-input"><input value={form.sku} onChange={(e) => update("sku", e.target.value)} placeholder="RG22K-00125" /></div>
            </label>
            <label className="field">
              <span>Category</span>
              <div className="field-input"><select value={form.category} onChange={(e) => update("category", e.target.value)}>{categories.map((c) => <option key={c}>{c}</option>)}</select></div>
            </label>
            <label className="field">
              <span>Purity / Karat</span>
              <div className="field-input"><select value={form.karat} onChange={(e) => update("karat", e.target.value)}>{karats.map((k) => <option key={k}>{k}</option>)}</select></div>
            </label>
            <label className="field">
              <span>Weight (g) *</span>
              <div className="field-input"><input type="number" step="0.001" value={form.weight} onChange={(e) => update("weight", e.target.value)} placeholder="5.250" /></div>
            </label>
            <label className="field">
              <span>Making charge (₹)</span>
              <div className="field-input"><input type="number" value={form.making} onChange={(e) => update("making", e.target.value)} placeholder="1200" /></div>
            </label>
            <label className="field">
              <span>Stone value (₹)</span>
              <div className="field-input"><input type="number" value={form.stoneValue} onChange={(e) => update("stoneValue", e.target.value)} placeholder="0" /></div>
            </label>
            <label className="field">
              <span>Stock (pcs)</span>
              <div className="field-input"><input type="number" value={form.stock} onChange={(e) => update("stock", e.target.value)} placeholder="1" /></div>
            </label>
            <label className="field">
              <span>Branch / Location</span>
              <div className="field-input"><select value={form.branch} onChange={(e) => update("branch", e.target.value)}>{branches.map((b) => <option key={b}>{b}</option>)}</select></div>
            </label>
            <label className="field">
              <span>Icon</span>
              <div className="field-input"><select value={form.icon} onChange={(e) => update("icon", e.target.value)}>{icons.map((i) => <option key={i}>{i}</option>)}</select></div>
            </label>
          </div>

          <div className="price-preview">
            <span>Computed selling price (at live rate)</span>
            <strong>{formatINR(preview)}</strong>
          </div>

          {error ? <p className="auth-error">{error}</p> : null}

          <div className="form-actions">
            <Link className="ghost-action" href="/inventory">Cancel</Link>
            <button className="gold-action" type="submit">Save Item</button>
          </div>
        </form>
      </section>
    </AppShell>
  );
}
