import { useMemo, useState } from "react";
import {
  Filter,
  Calendar,
  AlertTriangle,
  Car,
  Phone,
  Mail,
  MapPin,
  Euro,
  Download,
  Camera,
  Image,
  Tag,
  CheckCircle,
  Clock,
  ChevronRight,
} from "lucide-react";

export default function ScreenRouter({ activeTab, setActiveTab, data, actions, kpis }) {
  if (activeTab === "dashboard") {
    return <Dashboard kpis={kpis} data={data} actions={actions} setActiveTab={setActiveTab} />;
  }
  if (activeTab === "jobs") {
    return <JobsScreen data={data} actions={actions} />;
  }
  if (activeTab === "customers") {
    return <CustomersScreen data={data} />;
  }
  if (activeTab === "finance") {
    return <FinanceScreen data={data} actions={actions} />;
  }
  if (activeTab === "expenses") {
    return <ExpensesScreen data={data} actions={actions} />;
  }
  return null;
}

function Card({ children, className = "" }) {
  return <div className={`bg-white rounded-xl border border-slate-200 ${className}`}>{children}</div>;
}

function Metric({ label, value, accent = "blue" }) {
  const color = accent === "lime" ? "text-lime-600" : accent === "red" ? "text-rose-600" : "text-blue-600";
  return (
    <div className="p-4">
      <div className="text-xs text-slate-500">{label}</div>
      <div className={`text-xl font-bold ${color}`}>{value}</div>
    </div>
  );
}

function Badge({ children, color = "slate" }) {
  const map = {
    slate: "bg-slate-100 text-slate-700",
    blue: "bg-blue-100 text-blue-700",
    lime: "bg-lime-100 text-lime-700",
    rose: "bg-rose-100 text-rose-700",
    amber: "bg-amber-100 text-amber-800",
    violet: "bg-violet-100 text-violet-800",
  };
  return <span className={`px-2 py-0.5 rounded text-xs font-medium ${map[color]}`}>{children}</span>;
}

function SectionTitle({ icon: Icon, title, action }) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div className="flex items-center gap-2">
        {Icon ? <Icon size={16} className="text-blue-600" /> : null}
        <h3 className="text-sm font-semibold tracking-wide">{title}</h3>
      </div>
      {action}
    </div>
  );
}

function Divider() {
  return <div className="h-px bg-slate-200" />;
}

function Dashboard({ kpis, data, setActiveTab }) {
  const { todaysJobs, revenueToday, unpaidCount, vatSummary, vanServiceReminder } = kpis;
  const next = kpis.nextJob;

  return (
    <div className="space-y-4 py-4">
      <Card>
        <div className="grid grid-cols-2 gap-2">
          <Metric label="Today's Jobs" value={todaysJobs} accent="blue" />
          <Metric label="Revenue Today" value={`€${revenueToday.toFixed(2)}`} accent="lime" />
          <Metric label="Unpaid Jobs" value={unpaidCount} accent="red" />
          <Metric label="VAT Collected" value={`€${vatSummary.collected.toFixed(2)}`} accent="blue" />
        </div>
      </Card>

      <Card>
        <SectionTitle icon={Calendar} title="Schedule & Reminders" />
        <Divider />
        <div className="p-4 space-y-3">
          {next ? (
            <div className="flex items-start gap-3">
              <div className="p-2 rounded bg-blue-50 text-blue-700">
                <Clock size={16} />
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold">Next job at {new Date(next.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                <div className="text-xs text-slate-500">{next.issue}</div>
                <div className="mt-1 flex items-center gap-2">
                  <Badge color={next.type === 'emergency' ? 'rose' : 'lime'}>
                    {next.type === 'emergency' ? 'Emergency' : 'Scheduled'}
                  </Badge>
                  <Badge color="blue">{next.status}</Badge>
                </div>
              </div>
              <button onClick={() => setActiveTab("jobs")} className="text-blue-600 text-xs font-medium">
                View <ChevronRight size={14} className="inline" />
              </button>
            </div>
          ) : (
            <div className="text-sm text-slate-500">No upcoming jobs.</div>
          )}

          <div className="flex items-center gap-3 p-3 rounded bg-amber-50 text-amber-800">
            <AlertTriangle size={16} />
            <div className="text-sm">{vanServiceReminder.message}</div>
          </div>
        </div>
      </Card>

      <Card>
        <SectionTitle icon={Euro} title="VAT Summary" />
        <Divider />
        <div className="p-4 grid grid-cols-2 gap-2">
          <div>
            <div className="text-xs text-slate-500">VAT Collected</div>
            <div className="text-lg font-bold text-blue-600">€{vatSummary.collected.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-xs text-slate-500">Non-VAT Revenue</div>
            <div className="text-lg font-bold text-slate-700">€{vatSummary.nonVatRevenue.toFixed(2)}</div>
          </div>
        </div>
      </Card>
    </div>
  );
}

function JobsScreen({ data, actions }) {
  const { jobs, customers, inventory } = data;
  const { computeJobTotals, handleSetJobPayment } = actions;

  const [statusFilter, setStatusFilter] = useState("All");
  const [paymentFilter, setPaymentFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");

  const filtered = useMemo(() => {
    return jobs.filter((j) => {
      if (statusFilter !== "All" && j.status !== statusFilter) return false;
      if (paymentFilter !== "All" && (paymentFilter === "Paid" ? j.paymentStatus !== "Paid" : j.paymentStatus === "Paid")) return false;
      if (typeFilter !== "All" && (typeFilter === "Emergency" ? j.type !== "emergency" : j.type !== "scheduled")) return false;
      return true;
    });
  }, [jobs, statusFilter, paymentFilter, typeFilter]);

  return (
    <div className="space-y-4 py-4">
      <Card>
        <SectionTitle icon={Filter} title="Filters" />
        <Divider />
        <div className="p-3 grid grid-cols-3 gap-2 text-xs">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full rounded border-slate-300 focus:ring-blue-500 focus:border-blue-500">
            {['All','Pending','In Progress','Completed','Cancelled'].map((s)=> <option key={s}>{s}</option>)}
          </select>
          <select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)} className="w-full rounded border-slate-300 focus:ring-blue-500 focus:border-blue-500">
            {['All','Paid','Unpaid'].map((s)=> <option key={s}>{s}</option>)}
          </select>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="w-full rounded border-slate-300 focus:ring-blue-500 focus:border-blue-500">
            {['All','Emergency','Scheduled'].map((s)=> <option key={s}>{s}</option>)}
          </select>
        </div>
      </Card>

      <div className="space-y-3">
        {filtered.map((j) => {
          const totals = computeJobTotals(j);
          const customer = customers.find((c) => c.id === j.customerId);
          const vehicle = customer?.vehicles.find((v) => v.reg === j.vehicleReg);
          return (
            <Card key={j.id}>
              <div className="p-3 flex items-start gap-3">
                <div className="p-2 rounded bg-blue-50 text-blue-700"><Car size={18} /></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-sm truncate">{vehicle ? `${vehicle.reg} · ${vehicle.make} ${vehicle.model}` : j.vehicleReg}</div>
                    <div className="text-xs text-slate-500">#{j.id.toUpperCase()}</div>
                  </div>
                  <div className="text-xs text-slate-600 mt-0.5">{j.issue}</div>
                  <div className="mt-2 flex items-center gap-2 flex-wrap">
                    <Badge color={j.type === 'emergency' ? 'rose' : 'lime'}>{j.type === 'emergency' ? 'Emergency' : 'Scheduled'}</Badge>
                    <Badge color="blue">{j.status}</Badge>
                    <Badge color={j.paymentStatus === 'Paid' ? 'lime' : 'slate'}>{j.paymentStatus}</Badge>
                  </div>

                  <div className="mt-3 text-xs grid grid-cols-2 gap-2">
                    <div className="p-2 rounded bg-slate-50 border border-slate-200">
                      <div className="text-slate-500">Parts</div>
                      <div className="font-semibold">€{totals.partsSum.toFixed(2)}</div>
                    </div>
                    <div className="p-2 rounded bg-slate-50 border border-slate-200">
                      <div className="text-slate-500">Labour</div>
                      <div className="font-semibold">€{totals.labourSum.toFixed(2)}</div>
                    </div>
                    <div className="p-2 rounded bg-slate-50 border border-slate-200">
                      <div className="text-slate-500">VAT</div>
                      <div className="font-semibold">€{totals.vat.toFixed(2)}</div>
                    </div>
                    <div className="p-2 rounded bg-lime-50 border border-lime-200">
                      <div className="text-slate-600">Total</div>
                      <div className="font-bold text-lime-700">€{totals.total.toFixed(2)}</div>
                    </div>
                  </div>

                  <div className="mt-3 text-xs">
                    <div className="font-semibold mb-1">Itemised Parts</div>
                    <ul className="space-y-1">
                      {j.parts.map((p, idx) => (
                        <li key={idx} className="flex items-center justify-between">
                          <span className="truncate">{p.name} ×{p.qty}</span>
                          <span>€{(p.unitPrice * p.qty).toFixed(2)}{p.vat ? " (VAT)" : ""}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-3 flex items-center gap-2 flex-wrap">
                    <button className="text-xs px-2 py-1 rounded bg-blue-600 text-white">Before <Camera size={14} className="inline" /></button>
                    <button className="text-xs px-2 py-1 rounded bg-slate-800 text-white">After <Image size={14} className="inline" /></button>
                    {j.paymentStatus !== 'Paid' && (
                      <div className="flex items-center gap-2">
                        <QuickPay onPay={(m)=>handleSetJobPayment(j.id, m)} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <Divider />
              <div className="px-3 py-2 text-xs text-slate-500 flex items-center justify-between">
                <div>Created {new Date(j.createdAt).toLocaleString()}</div>
                {customer && (
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1"><Phone size={12}/> {customer.phone}</span>
                    <span className="hidden sm:flex items-center gap-1"><Mail size={12}/> {customer.email}</span>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      <InventoryPanel inventory={inventory} />
    </div>
  );
}

function QuickPay({ onPay }) {
  const methods = ["Cash", "Revolut", "Card", "Bank Transfer", "Invoice"];
  return (
    <div className="flex items-center gap-1">
      {methods.map((m) => (
        <button key={m} onClick={() => onPay(m)} className="text-xs px-2 py-1 rounded border border-slate-200 hover:bg-slate-50">
          {m}
        </button>
      ))}
    </div>
  );
}

function InventoryPanel({ inventory }) {
  const low = inventory.filter((i) => i.stock <= i.min);
  return (
    <Card>
      <SectionTitle icon={Tag} title="Inventory (Parts)" />
      <Divider />
      <div className="p-3 space-y-2">
        {inventory.map((i) => (
          <div key={i.id} className="flex items-center justify-between text-sm">
            <div>
              <div className="font-medium">{i.name}</div>
              <div className="text-xs text-slate-500">Supplier: {i.supplier}</div>
            </div>
            <div className="text-right">
              <div className="text-sm">Stock: <span className={i.stock <= i.min ? 'text-rose-600 font-semibold' : 'text-slate-800'}>{i.stock}</span></div>
              <div className="text-xs text-slate-500">Cost €{i.cost.toFixed(2)}</div>
            </div>
          </div>
        ))}

        {low.length > 0 ? (
          <div className="mt-2 p-2 rounded bg-rose-50 text-rose-700 text-xs flex items-center gap-2">
            <AlertTriangle size={14} /> Low stock: {low.map((l) => l.name).join(", ")}
          </div>
        ) : null}
      </div>
    </Card>
  );
}

function CustomersScreen({ data }) {
  const { customers, jobs } = data;
  return (
    <div className="space-y-4 py-4">
      {customers.map((c) => (
        <Card key={c.id}>
          <div className="p-3">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-semibold">{c.name}</div>
                <div className="text-xs text-slate-500 flex items-center gap-2 mt-1">
                  <span className="flex items-center gap-1"><Phone size={12}/> {c.phone}</span>
                  <span className="hidden sm:flex items-center gap-1"><Mail size={12}/> {c.email}</span>
                </div>
                <div className="text-xs text-slate-500 flex items-center gap-1 mt-1"><MapPin size={12}/> {c.address}</div>
              </div>
              <Badge color="blue">{c.vehicles.length} Vehicle(s)</Badge>
            </div>

            <div className="mt-3 space-y-2">
              {c.vehicles.map((v) => {
                const lastService = jobs.filter((j) => j.vehicleReg === v.reg && j.status === 'Completed').slice().sort((a,b)=> new Date(b.createdAt)-new Date(a.createdAt))[0];
                const nctDue = new Date(v.nctExpiry);
                const dueSoon = (nctDue.getTime() - Date.now()) < 30 * 24 * 60 * 60 * 1000;
                return (
                  <div key={v.reg} className="p-2 rounded border border-slate-200">
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-sm">{v.reg} · {v.make} {v.model}</div>
                      <div className="text-xs text-slate-500">{v.mileage.toLocaleString()} km</div>
                    </div>
                    <div className="text-xs text-slate-500 mt-1">NCT Expiry: {nctDue.toLocaleDateString()}</div>
                    {dueSoon && (
                      <div className="mt-1 text-xs flex items-center gap-2 text-amber-800 bg-amber-50 px-2 py-1 rounded"><AlertTriangle size={12}/> NCT due soon</div>
                    )}
                    {lastService && (
                      <div className="mt-1 text-xs text-slate-600">Last service: {new Date(lastService.createdAt).toLocaleDateString()} — {lastService.issue}</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

function FinanceScreen({ data, actions }) {
  const { jobs, expenses } = data;
  const { computeJobTotals } = actions;

  const today = new Date();
  const startOfWeek = new Date(today); startOfWeek.setDate(today.getDate() - today.getDay());
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  function revenueInRange(from, to) {
    return jobs
      .filter((j) => new Date(j.createdAt) >= from && new Date(j.createdAt) <= to && j.paymentStatus === 'Paid')
      .reduce((sum, j) => sum + computeJobTotals(j).total, 0);
  }

  const revDay = revenueInRange(new Date(today.getFullYear(), today.getMonth(), today.getDate()), today);
  const revWeek = revenueInRange(startOfWeek, today);
  const revMonth = revenueInRange(startOfMonth, today);

  const totalPaidRevenue = jobs.filter(j=> j.paymentStatus==='Paid').reduce((s,j)=> s + computeJobTotals(j).total, 0);
  const totalExpenses = expenses.reduce((s,e)=> s + e.amount, 0);
  const profit = totalPaidRevenue - totalExpenses;

  const vat = jobs.reduce(
    (acc, j) => {
      const t = computeJobTotals(j);
      if (j.labour?.vat || j.parts.some((p) => p.vat)) {
        acc.collected += t.vat;
        acc.vatableRevenue += t.total - t.vat;
      } else {
        acc.nonVatRevenue += t.total;
      }
      if (j.paymentStatus !== 'Paid') acc.outstanding.push(j);
      acc.byMethod[j.paymentMethod || 'Unpaid'] = (acc.byMethod[j.paymentMethod || 'Unpaid'] || 0) + (j.paymentStatus === 'Paid' ? t.total : 0);
      return acc;
    },
    { collected: 0, vatableRevenue: 0, nonVatRevenue: 0, outstanding: [], byMethod: {} }
  );

  function exportSummary() {
    const payload = {
      generatedAt: new Date().toISOString(),
      revenue: { day: revDay, week: revWeek, month: revMonth },
      vat,
      expenses: { total: totalExpenses },
      profit,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `qikmech-finance-${new Date().toISOString().slice(0,10)}.json`;
    a.click(); URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4 py-4">
      <Card>
        <SectionTitle icon={Euro} title="Revenue" action={<span className="text-xs text-slate-500">incl VAT</span>} />
        <Divider />
        <div className="p-4 grid grid-cols-3 gap-2">
          <div>
            <div className="text-xs text-slate-500">Day</div>
            <div className="text-lg font-bold text-blue-600">€{revDay.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-xs text-slate-500">Week</div>
            <div className="text-lg font-bold text-blue-600">€{revWeek.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-xs text-slate-500">Month</div>
            <div className="text-lg font-bold text-blue-600">€{revMonth.toFixed(2)}</div>
          </div>
        </div>
      </Card>

      <Card>
        <SectionTitle icon={CheckCircle} title="Profit" />
        <Divider />
        <div className="p-4 grid grid-cols-3 gap-2 text-sm">
          <div className="p-2 rounded bg-slate-50 border border-slate-200">
            <div className="text-slate-500 text-xs">Revenue (Paid)</div>
            <div className="font-bold">€{totalPaidRevenue.toFixed(2)}</div>
          </div>
          <div className="p-2 rounded bg-slate-50 border border-slate-200">
            <div className="text-slate-500 text-xs">Expenses</div>
            <div className="font-bold">€{totalExpenses.toFixed(2)}</div>
          </div>
          <div className="p-2 rounded bg-lime-50 border border-lime-200">
            <div className="text-slate-600 text-xs">Profit</div>
            <div className="font-bold text-lime-700">€{profit.toFixed(2)}</div>
          </div>
        </div>
      </Card>

      <Card>
        <SectionTitle icon={Tag} title="Payment Methods" />
        <Divider />
        <div className="p-3 grid grid-cols-2 gap-2 text-sm">
          {Object.entries(vat.byMethod).map(([k, v]) => (
            <div key={k} className="flex items-center justify-between">
              <span>{k}</span>
              <span className="font-semibold">€{v.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <SectionTitle icon={CheckCircle} title="VAT & Invoices" action={<button onClick={exportSummary} className="text-xs px-2 py-1 rounded border border-slate-200 hover:bg-slate-50"> <Download size={14} className="inline mr-1"/>Export</button>} />
        <Divider />
        <div className="p-3 grid grid-cols-2 gap-2 text-sm">
          <div className="p-2 rounded bg-slate-50 border border-slate-200">
            <div className="text-slate-500 text-xs">VAT Collected</div>
            <div className="font-bold text-blue-600">€{vat.collected.toFixed(2)}</div>
          </div>
          <div className="p-2 rounded bg-slate-50 border border-slate-200">
            <div className="text-slate-500 text-xs">Vatable Revenue</div>
            <div className="font-bold">€{vat.vatableRevenue.toFixed(2)}</div>
          </div>
          <div className="p-2 rounded bg-slate-50 border border-slate-200">
            <div className="text-slate-500 text-xs">Non-VAT Jobs</div>
            <div className="font-bold">€{vat.nonVatRevenue.toFixed(2)}</div>
          </div>
          <div className="p-2 rounded bg-amber-50 border border-amber-200">
            <div className="text-amber-800 text-xs">Outstanding Invoices</div>
            <div className="font-bold text-amber-800">{vat.outstanding.length}</div>
          </div>
        </div>

        {vat.outstanding.length > 0 && (
          <div className="px-3 pb-3">
            <div className="text-xs text-slate-500 mb-1">Outstanding</div>
            <ul className="space-y-1 text-sm">
              {vat.outstanding.map((j) => (
                <li key={j.id} className="flex items-center justify-between">
                  <span>#{j.id.toUpperCase()} · {j.issue}</span>
                  <span className="text-amber-700">Unpaid</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Card>
    </div>
  );
}

function ExpensesScreen({ data, actions }) {
  const { expenses, jobs } = data;
  const { computeJobTotals, handleAddExpense } = actions;
  const [tab, setTab] = useState("all");
  const filtered = expenses.filter((e) => (tab === 'all' ? true : tab === e.type));
  const total = filtered.reduce((s, e) => s + e.amount, 0);
  const totalPaidRevenue = jobs.filter(j=> j.paymentStatus==='Paid').reduce((s,j)=> s + computeJobTotals(j).total, 0);
  const profit = totalPaidRevenue - expenses.reduce((s,e)=> s + e.amount, 0);

  return (
    <div className="space-y-4 py-4">
      <Card>
        <div className="px-3 pt-3">
          <div className="flex items-center gap-2 text-xs">
            <button onClick={()=>setTab('all')} className={`px-2 py-1 rounded ${tab==='all'?'bg-blue-600 text-white':'bg-slate-100'}`}>All</button>
            <button onClick={()=>setTab('van')} className={`px-2 py-1 rounded ${tab==='van'?'bg-blue-600 text-white':'bg-slate-100'}`}>Van</button>
            <button onClick={()=>setTab('tools')} className={`px-2 py-1 rounded ${tab==='tools'?'bg-blue-600 text-white':'bg-slate-100'}`}>Tools</button>
          </div>
        </div>
        <Divider />
        <div className="p-3 space-y-2">
          {filtered.map((e) => (
            <div key={e.id} className="flex items-start justify-between text-sm">
              <div>
                <div className="font-medium">{e.category}</div>
                <div className="text-xs text-slate-500">{new Date(e.date).toLocaleString()} — {e.note}</div>
              </div>
              <div className="text-right">
                <div className="font-bold">€{e.amount.toFixed(2)}</div>
              </div>
            </div>
          ))}
          <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-sm">
            <div className="text-slate-600">Total</div>
            <div className="font-bold text-blue-600">€{total.toFixed(2)}</div>
          </div>
        </div>
      </Card>

      <Card>
        <SectionTitle title="Profit Snapshot" />
        <Divider />
        <div className="p-3 grid grid-cols-2 gap-2 text-sm">
          <div className="p-2 rounded bg-slate-50 border border-slate-200">
            <div className="text-slate-500 text-xs">Revenue (Paid)</div>
            <div className="font-bold">€{totalPaidRevenue.toFixed(2)}</div>
          </div>
          <div className="p-2 rounded bg-lime-50 border border-lime-200">
            <div className="text-slate-600 text-xs">Profit</div>
            <div className="font-bold text-lime-700">€{profit.toFixed(2)}</div>
          </div>
        </div>
      </Card>

      <AddExpense onAdd={handleAddExpense} />
    </div>
  );
}

function AddExpense({ onAdd }) {
  const [form, setForm] = useState({ type: 'van', category: 'Van Fuel', amount: '', note: '' });

  function submit(e){
    e.preventDefault();
    const amount = parseFloat(form.amount || '0');
    if (!amount) return;
    onAdd({ ...form, amount, date: new Date().toISOString(), receipt: null });
    setForm({ type: 'van', category: 'Van Fuel', amount: '', note: '' });
  }

  return (
    <Card>
      <SectionTitle title="Add Expense" />
      <Divider />
      <form onSubmit={submit} className="p-3 grid grid-cols-2 gap-2 text-sm">
        <select value={form.type} onChange={(e)=>setForm({...form, type:e.target.value})} className="col-span-2 rounded border-slate-300">
          <option value="van">Van</option>
          <option value="tools">Tools</option>
        </select>
        <input value={form.category} onChange={(e)=>setForm({...form, category:e.target.value})} placeholder="Category" className="col-span-2 rounded border-slate-300" />
        <input value={form.amount} onChange={(e)=>setForm({...form, amount:e.target.value})} placeholder="Amount (€)" className="rounded border-slate-300" inputMode="decimal" />
        <input value={form.note} onChange={(e)=>setForm({...form, note:e.target.value})} placeholder="Note" className="rounded border-slate-300" />
        <button className="col-span-2 mt-1 px-3 py-2 rounded bg-lime-500 text-white font-semibold">Save Expense</button>
      </form>
    </Card>
  );
}
