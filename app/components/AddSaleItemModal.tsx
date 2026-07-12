"use client";

import { useMemo, useState } from "react";
import { ArrowRight, Camera, X } from "lucide-react";
import { useStore, itemPrice, formatINR, type Item } from "../lib/store";

type AddSaleItemModalProps = {
  open: boolean;
  onClose: () => void;
  onAdd: (itemId: string, qty: number) => void;
};

export function AddSaleItemModal({ open, onClose, onAdd }: AddSaleItemModalProps) {
  const { items, rates } = useStore();
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [qty, setQty] = useState(1);
  const [discount, setDiscount] = useState(0);
  const [taxRate, setTaxRate] = useState(3);
  const [supplier, setSupplier] = useState("");
  const [workshop, setWorkshop] = useState("");
  const [size, setSize] = useState("");
  const [notes, setNotes] = useState("");

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items.slice(0, 8);
    return items.filter(
      (i) => i.name.toLowerCase().includes(q) || i.sku.toLowerCase().includes(q),
    ).slice(0, 8);
  }, [items, query]);

  const selected: Item | undefined = items.find((i) => i.id === selectedId) ?? matches[0];
  const unitPrice = selected ? itemPrice(selected, rates) : 0;
  const lineTotal = Math.round(unitPrice * qty * (1 - discount / 100) * (1 + taxRate / 100));

  if (!open) return null;

  function handleContinue() {
    if (!selected) return;
    onAdd(selected.id, qty);
    onClose();
    setQuery("");
    setQty(1);
    setDiscount(0);
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <form
        className="modal-card sale-item-modal"
        onSubmit={(e) => {
          e.preventDefault();
          handleContinue();
        }}
      >
        <button className="modal-close" type="button" onClick={onClose} aria-label="Close"><X size={18} /></button>
        <h2>Add item</h2>

        <div className="sale-item-grid">
          <label className="field span-2">
            <span>Title</span>
            <div className="field-input">
              <input
                value={query || (selected ? `${selected.sku} — ${selected.name}` : "")}
                onChange={(e) => { setQuery(e.target.value); setSelectedId(""); }}
                placeholder="Search product or type title"
              />
            </div>
          </label>

          <label className="field">
            <span>Scan or type barcode</span>
            <div className="field-input">
              <input
                placeholder="Barcode"
                onBlur={(e) => {
                  const hit = items.find((i) => i.sku.toLowerCase() === e.target.value.trim().toLowerCase());
                  if (hit) setSelectedId(hit.id);
                }}
              />
              <Camera size={16} />
            </div>
          </label>

          <div className="sale-item-picks span-3">
            {matches.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`sale-item-pick ${selected?.id === item.id ? "active" : ""}`}
                onClick={() => setSelectedId(item.id)}
              >
                <strong>{item.sku}</strong>
                <small>{item.name} · {item.karat} · {item.weight}g</small>
                <em>{formatINR(itemPrice(item, rates))}</em>
              </button>
            ))}
          </div>

          <label className="field">
            <span>Price</span>
            <div className="field-input"><input readOnly value={formatINR(unitPrice)} /></div>
          </label>

          <label className="field">
            <span>Quantity</span>
            <div className="field-input"><input type="number" min={1} value={qty} onChange={(e) => setQty(Number(e.target.value) || 1)} /></div>
          </label>

          <label className="field">
            <span>Tax rate (%)</span>
            <div className="field-input"><input type="number" value={taxRate} onChange={(e) => setTaxRate(Number(e.target.value) || 0)} /></div>
          </label>

          <label className="field">
            <span>Discount (%)</span>
            <div className="field-input"><input type="number" min={0} max={100} value={discount} onChange={(e) => setDiscount(Number(e.target.value) || 0)} /></div>
          </label>

          <label className="field">
            <span>Supplier</span>
            <div className="field-input">
              <select value={supplier} onChange={(e) => setSupplier(e.target.value)}>
                <option value="">Select supplier</option>
                <option>Raj Gems</option>
                <option>Kundan Casting Co.</option>
              </select>
            </div>
          </label>

          <label className="field">
            <span>Workshop</span>
            <div className="field-input">
              <select value={workshop} onChange={(e) => setWorkshop(e.target.value)}>
                <option value="">Select workshop</option>
                <option>Main Workshop</option>
                <option>Suresh Karigar</option>
              </select>
            </div>
          </label>

          <label className="field">
            <span>Size</span>
            <div className="field-input"><input value={size} onChange={(e) => setSize(e.target.value)} placeholder="e.g. 14" /></div>
          </label>

          <label className="field span-2">
            <span>Notes (internal)</span>
            <div className="field-input"><input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional notes" /></div>
          </label>
        </div>

        <div className="sale-item-total">
          <span>Line total (incl. tax)</span>
          <strong>{formatINR(lineTotal)}</strong>
        </div>

        <div className="form-actions">
          <button className="ghost-action" type="button" onClick={onClose}>Close</button>
          <button className="gold-action" type="submit" disabled={!selected}>
            Continue <ArrowRight size={16} />
          </button>
        </div>
      </form>
    </div>
  );
}
