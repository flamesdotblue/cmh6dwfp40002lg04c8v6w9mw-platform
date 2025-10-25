import { useMemo, useState } from "react";
import BottomNav from "./components/BottomNav";
import ScreenRouter from "./components/ScreenRouter";
import NewJobSheet from "./components/NewJobSheet";

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showNewJob, setShowNewJob] = useState(false);

  // Seed sample data for demo
  const [customers, setCustomers] = useState([
    {
      id: "c1",
      name: "Sean O'Connor",
      phone: "+353 87 123 4567",
      email: "sean.oconnor@example.ie",
      address: "12 Main St, Cork",
      vehicles: [
        {
          reg: "152-D-12345",
          make: "Volkswagen",
          model: "Golf",
          mileage: 123450,
          nctExpiry: "2026-01-15",
        },
      ],
    },
    {
      id: "c2",
      name: "Aoife Murphy",
      phone: "+353 86 555 8899",
      email: "aoife.murphy@example.ie",
      address: "45 River Rd, Dublin",
      vehicles: [
        {
          reg: "192-D-98765",
          make: "Toyota",
          model: "Yaris",
          mileage: 80500,
          nctExpiry: "2025-12-30",
        },
      ],
    },
  ]);

  const [inventory, setInventory] = useState([
    { id: "p1", name: "Oil Filter", supplier: "PartsDirect", cost: 9.5, stock: 6, min: 3 },
    { id: "p2", name: "Brake Pads (Front)", supplier: "BrakeCo", cost: 38, stock: 2, min: 2 },
    { id: "p3", name: "Engine Oil 5W30 (1L)", supplier: "OilMax", cost: 8.2, stock: 12, min: 6 },
  ]);

  const [jobs, setJobs] = useState([
    {
      id: "j1",
      customerId: "c1",
      vehicleReg: "152-D-12345",
      issue: "Oil change + filter",
      type: "scheduled",
      status: "Completed",
      paymentStatus: "Paid",
      paymentMethod: "Card",
      labour: { description: "Routine service", cost: 60, vat: true },
      parts: [
        { id: "p3", name: "Engine Oil 5W30 (1L)", qty: 4, unitPrice: 12, vat: true },
        { id: "p1", name: "Oil Filter", qty: 1, unitPrice: 12, vat: true },
      ],
      beforePhotos: [],
      afterPhotos: [],
      createdAt: new Date().toISOString(),
      scheduledAt: new Date().toISOString(),
      invoiceId: "INV-0001",
    },
    {
      id: "j2",
      customerId: "c2",
      vehicleReg: "192-D-98765",
      issue: "Brake squeal, check pads",
      type: "emergency",
      status: "In Progress",
      paymentStatus: "Unpaid",
      paymentMethod: null,
      labour: { description: "Diagnostics + pad replacement", cost: 90, vat: true },
      parts: [
        { id: "p2", name: "Brake Pads (Front)", qty: 1, unitPrice: 48, vat: true },
      ],
      beforePhotos: [],
      afterPhotos: [],
      createdAt: new Date().toISOString(),
      scheduledAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      invoiceId: null,
    },
  ]);

  const [expenses, setExpenses] = useState([
    { id: "e1", category: "Van Fuel", type: "van", amount: 72.5, date: new Date().toISOString(), note: "Diesel fill-up", receipt: null },
    { id: "e2", category: "Tools Purchase", type: "tools", amount: 120, date: new Date().toISOString(), note: "Torque wrench", receipt: null },
  ]);

  const VAT_RATE = 0.23;

  function computeJobTotals(job) {
    const partsSum = job.parts.reduce((sum, p) => sum + p.unitPrice * p.qty, 0);
    const labourSum = job.labour?.cost || 0;
    const partsVAT = job.parts.reduce((sum, p) => sum + (p.vat ? p.unitPrice * p.qty * VAT_RATE : 0), 0);
    const labourVAT = job.labour?.vat ? labourSum * VAT_RATE : 0;
    const vat = partsVAT + labourVAT;
    const total = partsSum + labourSum + vat;
    return { partsSum, labourSum, vat, total };
  }

  const kpis = useMemo(() => {
    const todayStr = new Date().toDateString();
    const todaysJobs = jobs.filter((j) => new Date(j.createdAt).toDateString() === todayStr);
    const revenueToday = todaysJobs
      .filter((j) => j.paymentStatus === "Paid")
      .reduce((sum, j) => sum + computeJobTotals(j).total, 0);
    const unpaidCount = jobs.filter((j) => j.paymentStatus !== "Paid").length;

    const vatSummary = jobs.reduce(
      (acc, j) => {
        const t = computeJobTotals(j);
        if (j.labour?.vat || j.parts.some((p) => p.vat)) acc.collected += t.vat;
        else acc.nonVatRevenue += t.total;
        return acc;
      },
      { collected: 0, nonVatRevenue: 0 }
    );

    const nextJob = jobs
      .filter((j) => j.status !== "Completed" && j.status !== "Cancelled")
      .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt))[0] || null;

    const vanServiceReminder = {
      dueInKm: 1200,
      message: "Van service due in 1,200 km",
    };

    return { todaysJobs: todaysJobs.length, revenueToday, unpaidCount, vatSummary, nextJob, vanServiceReminder };
  }, [jobs]);

  function handleAddJob(newJob) {
    setJobs((prev) => [{ ...newJob, id: `j${prev.length + 1}` }, ...prev]);
    // Deduct inventory stock
    setInventory((prev) => {
      const copy = prev.map((it) => ({ ...it }));
      newJob.parts.forEach((p) => {
        const idx = copy.findIndex((i) => i.id === p.id || i.name === p.name);
        if (idx >= 0) copy[idx].stock = Math.max(0, (copy[idx].stock || 0) - (p.qty || 0));
      });
      return copy;
    });
    setShowNewJob(false);
    setActiveTab("jobs");
  }

  function handleAddCustomer(c) {
    setCustomers((prev) => [{ ...c, id: `c${prev.length + 1}` }, ...prev]);
  }

  function handleAddExpense(expense) {
    setExpenses((prev) => [{ ...expense, id: `e${prev.length + 1}` }, ...prev]);
  }

  function handleSetJobPayment(id, method) {
    setJobs((prev) =>
      prev.map((j) =>
        j.id === id
          ? { ...j, paymentStatus: "Paid", paymentMethod: method, status: j.status === "Completed" ? j.status : "Completed" }
          : j
      )
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-blue-600 flex items-center justify-center text-white font-bold">Q</div>
            <div>
              <div className="text-base font-semibold tracking-wide">QikMech</div>
              <div className="text-xs text-slate-500 -mt-0.5">Mobile Workshop Admin</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 text-[10px] rounded bg-lime-100 text-lime-700">Blue · White · Lime</span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full pb-24 px-4">
        <ScreenRouter
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          data={{ jobs, customers, inventory, expenses }}
          actions={{ computeJobTotals, handleSetJobPayment, handleAddExpense, VAT_RATE }}
          kpis={kpis}
        />
      </main>

      <button
        onClick={() => setShowNewJob(true)}
        className="fixed bottom-24 right-4 z-30 rounded-full bg-lime-500 text-white shadow-lg shadow-lime-500/30 hover:bg-lime-600 active:scale-95 transition px-5 py-3 font-semibold"
        aria-label="New Job"
      >
        + New Job
      </button>

      <BottomNav activeTab={activeTab} onChange={setActiveTab} />

      <NewJobSheet
        open={showNewJob}
        onClose={() => setShowNewJob(false)}
        customers={customers}
        inventory={inventory}
        onAddCustomer={handleAddCustomer}
        onSubmit={handleAddJob}
        VAT_RATE={VAT_RATE}
      />
    </div>
  );
}
