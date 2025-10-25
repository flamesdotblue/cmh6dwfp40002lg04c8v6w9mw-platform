import { Home, Wrench, Users, CreditCard, Receipt } from "lucide-react";

export default function BottomNav({ activeTab, onChange }) {
  const items = [
    { key: "dashboard", label: "Dashboard", icon: Home },
    { key: "jobs", label: "Jobs", icon: Wrench },
    { key: "customers", label: "Customers", icon: Users },
    { key: "finance", label: "Finance", icon: CreditCard },
    { key: "expenses", label: "Expenses", icon: Receipt },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-20 bg-white border-t border-slate-200">
      <div className="max-w-3xl mx-auto grid grid-cols-5">
        {items.map((it) => {
          const Icon = it.icon;
          const active = activeTab === it.key;
          return (
            <button
              key={it.key}
              onClick={() => onChange(it.key)}
              className={`flex flex-col items-center justify-center py-2 text-xs ${
                active ? "text-blue-600" : "text-slate-500"
              }`}
            >
              <Icon size={20} className="mb-1" />
              <span>{it.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
