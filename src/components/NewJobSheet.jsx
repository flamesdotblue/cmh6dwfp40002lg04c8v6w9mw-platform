import { useEffect, useMemo, useState } from "react";
import { X, PlusCircle, Trash2 } from "lucide-react";

export default function NewJobSheet({ open, onClose, customers, inventory, onAddCustomer, onSubmit, VAT_RATE = 0.23 }) {
  const [form, setForm] = useState({
    customerId: customers[0]?.id || "",
    vehicleReg: customers[0]?.vehicles?.[0]?.reg || "",
    issue: "",
    type: "scheduled",
    status: "Pending",
    paymentStatus: "Unpaid",
    paymentMethod: null,
    labour: { description: "", cost: 0, vat: true },
    parts: [],
    beforePhotos: [],
    afterPhotos: [],
    createdAt: new Date().toISOString(),
    scheduledAt: new Date().toISOString(),
    invoiceId: null,
  });

  useEffect(()=>{
    if (!open) return;
    setForm((prev)=> ({
      ...prev,
      customerId: customers[0]?.id || "",
      vehicleReg: customers[0]?.vehicles?.[0]?.reg || "",
      issue: "",
      type: "scheduled",
      status: "Pending",
      paymentStatus: "Unpaid",
      paymentMethod: null,
      labour: { description: "", cost: 0, vat: true },
      parts: [],
      beforePhotos: [],
      afterPhotos: [],
      createdAt: new Date().toISOString(),
      scheduledAt: new Date().toISOString(),
      invoiceId: null,
    }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[open, customers.length]);

  const customer = useMemo(()=> customers.find(c=>c.id===form.customerId),[customers, form.customerId]);

  const partsSum = form.parts.reduce((s,p)=> s + (p.qty||0) * (p.unitPrice||0), 0);
  const labourSum = Number(form.labour?.cost||0);
  const partsVAT = form.parts.reduce((s,p)=> s + (p.vat ? (p.qty||0)*(p.unitPrice||0)*VAT_RATE : 0), 0);
  const labourVAT = form.labour?.vat ? labourSum * VAT_RATE : 0;
  const vat = partsVAT + labourVAT;
  const total = partsSum + labourSum + vat;

  function handleSubmit(e){
    e?.preventDefault?.();
    if (!form.customerId || !form.vehicleReg) return;
    onSubmit(form);
  }

  function addPart(part){
    setForm((prev)=> ({...prev, parts: [...prev.parts, part]}));
  }
  function removePart(idx){
    setForm((prev)=> ({...prev, parts: prev.parts.filter((_,i)=> i!==idx)}));
  }

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40">
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} />
      <div className="absolute inset-x-0 bottom-0 bg-white rounded-t-2xl shadow-xl max-h-[92vh] overflow-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 flex items-center justify-between px-4 py-3 rounded-t-2xl">
          <div className="font-semibold">New Job</div>
          <button onClick={onClose} className="p-1 rounded hover:bg-slate-100"><X /></button>
        </div>

        <div className="p-4 space-y-4 text-sm">
          <section className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-slate-500">Customer</label>
                <select value={form.customerId} onChange={(e)=> setForm({...form, customerId: e.target.value, vehicleReg: customers.find(c=>c.id===e.target.value)?.vehicles?.[0]?.reg || '' })} className="w-full rounded border-slate-300">
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-500">Vehicle</label>
                <select value={form.vehicleReg} onChange={(e)=> setForm({...form, vehicleReg: e.target.value})} className="w-full rounded border-slate-300">
                  {customer?.vehicles?.map(v => <option key={v.reg} value={v.reg}>{v.reg} · {v.make} {v.model}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-2">
              <div>
                <label className="text-xs text-slate-500">Job Type</label>
                <select value={form.type} onChange={(e)=> setForm({...form, type: e.target.value})} className="w-full rounded border-slate-300">
                  <option value="emergency">Emergency</option>
                  <option value="scheduled">Scheduled</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-500">Status</label>
                <select value={form.status} onChange={(e)=> setForm({...form, status: e.target.value})} className="w-full rounded border-slate-300">
                  {['Pending','In Progress','Completed','Cancelled'].map((s)=> <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div className="mt-2">
              <label className="text-xs text-slate-500">Issue Notes</label>
              <textarea value={form.issue} onChange={(e)=> setForm({...form, issue: e.target.value})} rows={3} className="w-full rounded border-slate-300" placeholder="Describe the issue..." />
            </div>
          </section>

          <section className="space-y-2">
            <div className="font-semibold text-sm">Costs</div>
            <div className="grid grid-cols-2 gap-2">
              <div className="col-span-2">
                <label className="text-xs text-slate-500">Labour Description</label>
                <input value={form.labour.description} onChange={(e)=> setForm({...form, labour: {...form.labour, description: e.target.value}})} className="w-full rounded border-slate-300" />
              </div>
              <div>
                <label className="text-xs text-slate-500">Labour Cost (€)</label>
                <input inputMode="decimal" value={form.labour.cost} onChange={(e)=> setForm({...form, labour: {...form.labour, cost: Number(e.target.value||0)}})} className="w-full rounded border-slate-300" />
              </div>
              <div className="flex items-end gap-2">
                <label className="text-xs text-slate-500 mr-auto">Apply VAT to Labour</label>
                <input type="checkbox" checked={!!form.labour.vat} onChange={(e)=> setForm({...form, labour: {...form.labour, vat: e.target.checked}})} />
              </div>
            </div>

            <PartsPicker inventory={inventory} onAdd={addPart} />

            <div className="mt-2">
              <div className="text-xs text-slate-500 mb-1">Selected Parts</div>
              {form.parts.length === 0 ? (
                <div className="text-xs text-slate-500">No parts added.</div>
              ) : (
                <ul className="divide-y divide-slate-200">
                  {form.parts.map((p, idx) => (
                    <li key={`${p.name}-${idx}`} className="py-2 flex items-center justify-between text-sm">
                      <div className="min-w-0">
                        <div className="font-medium truncate">{p.name}</div>
                        <div className="text-xs text-slate-500">Qty {p.qty} · €{Number(p.unitPrice).toFixed(2)} each {p.vat ? '· VAT' : ''}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="font-semibold">€{(Number(p.qty)*Number(p.unitPrice)).toFixed(2)}</div>
                        <button onClick={()=> removePart(idx)} className="p-1 rounded hover:bg-rose-50 text-rose-600"><Trash2 size={16}/></button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
              <SummaryField label="Parts" value={partsSum} />
              <SummaryField label="Labour" value={labourSum} />
              <SummaryField label="VAT" value={vat} />
              <SummaryField label="Total" value={total} accent />
            </div>
          </section>

          <section className="space-y-2">
            <div className="font-semibold text-sm">Payment</div>
            <div className="grid grid-cols-2 gap-2">
              <select value={form.paymentStatus} onChange={(e)=> setForm({...form, paymentStatus: e.target.value})} className="rounded border-slate-300">
                <option>Unpaid</option>
                <option>Paid</option>
              </select>
              <select value={form.paymentMethod || ''} onChange={(e)=> setForm({...form, paymentMethod: e.target.value || null})} className="rounded border-slate-300">
                <option value="">Select Method</option>
                {['Cash','Revolut','Card','Bank Transfer','Invoice'].map((m)=> <option key={m}>{m}</option>)}
              </select>
            </div>
          </section>

          <section className="space-y-2">
            <div className="font-semibold text-sm">Photos</div>
            <div className="grid grid-cols-2 gap-2">
              <label className="border border-slate-300 rounded p-2 text-xs flex items-center justify-center cursor-pointer">
                Before Photos
                <input type="file" accept="image/*" multiple className="hidden" onChange={(e)=> setForm({...form, beforePhotos: Array.from(e.target.files||[])})} />
              </label>
              <label className="border border-slate-300 rounded p-2 text-xs flex items-center justify-center cursor-pointer">
                After Photos
                <input type="file" accept="image/*" multiple className="hidden" onChange={(e)=> setForm({...form, afterPhotos: Array.from(e.target.files||[])})} />
              </label>
            </div>
          </section>

          <div className="h-px bg-slate-200" />

          <div className="flex items-center justify-between">
            <button onClick={onClose} className="px-3 py-2 rounded border border-slate-200">Cancel</button>
            <button onClick={handleSubmit} className="px-4 py-2 rounded bg-lime-500 text-white font-semibold">Save Job</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PartsPicker({ inventory, onAdd }){
  const [part, setPart] = useState({ id: '', name: '', qty: 1, unitPrice: '', vat: true });

  function addFromInventory(id){
    const found = inventory.find(i=> i.id===id);
    if (!found) return;
    onAdd({ id: found.id, name: found.name, qty: 1, unitPrice: found.cost, vat: true });
  }

  function addCustom(e){
    e.preventDefault();
    if (!part.name || !part.qty || !part.unitPrice) return;
    onAdd({ ...part, qty: Number(part.qty), unitPrice: Number(part.unitPrice) });
    setPart({ id: '', name: '', qty: 1, unitPrice: '', vat: true });
  }

  return (
    <div className="mt-2">
      <div className="text-xs text-slate-500 mb-1">Parts</div>
      <div className="flex gap-2 mb-2">
        <select onChange={(e)=> { if(e.target.value) { addFromInventory(e.target.value); e.target.value=''; } }} className="flex-1 rounded border-slate-300">
          <option value="">Add from inventory…</option>
          {inventory.map(i=> <option key={i.id} value={i.id}>{i.name} (stock {i.stock})</option>)}
        </select>
      </div>

      <form onSubmit={addCustom} className="grid grid-cols-4 gap-2 text-sm">
        <input value={part.name} onChange={(e)=> setPart({...part, name:e.target.value})} placeholder="Part name" className="col-span-2 rounded border-slate-300" />
        <input value={part.qty} onChange={(e)=> setPart({...part, qty:e.target.value})} placeholder="Qty" className="rounded border-slate-300" inputMode="numeric" />
        <input value={part.unitPrice} onChange={(e)=> setPart({...part, unitPrice:e.target.value})} placeholder="Price (€)" className="rounded border-slate-300" inputMode="decimal" />
        <label className="col-span-2 flex items-center gap-2 text-xs text-slate-600">
          <input type="checkbox" checked={part.vat} onChange={(e)=> setPart({...part, vat:e.target.checked})} /> VAT
        </label>
        <button className="col-span-2 px-3 py-2 rounded bg-blue-600 text-white font-semibold flex items-center justify-center gap-2">
          <PlusCircle size={16}/> Add Part
        </button>
      </form>
    </div>
  );
}

function SummaryField({ label, value, accent }){
  return (
    <div className={`p-2 rounded border ${accent ? 'bg-lime-50 border-lime-200' : 'bg-slate-50 border-slate-200'}`}>
      <div className="text-xs text-slate-500">{label}</div>
      <div className={`font-bold ${accent ? 'text-lime-700' : 'text-slate-800'}`}>€{Number(value||0).toFixed(2)}</div>
    </div>
  );
}
