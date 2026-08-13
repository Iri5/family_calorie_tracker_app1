import React from "react";
import { Home, Users, Package, BookOpen, LogOut } from "lucide-react";
import { User, View } from "../types";

interface SidebarProps {
  view: View;
  onNav: (v: View) => void;
  user: User;
  onLogout: () => void;
}

const NAV: { view: View; Icon: React.FC<{ size?: number }>; label: string }[] = [
  { view: "dashboard", Icon: Home, label: "Dashboard" },
  { view: "family", Icon: Users, label: "Family" },
  { view: "products", Icon: Package, label: "Products" },
  { view: "recipes", Icon: BookOpen, label: "Recipes" },
];

export function Sidebar({ view, onNav, user, onLogout }: SidebarProps) {
  return (
    <aside className="w-52 bg-sidebar border-r border-sidebar-border flex flex-col h-full shrink-0">
      {/* Brand */}
      <div className="px-5 pt-6 pb-5">
        <span className="text-xs font-bold text-primary uppercase tracking-widest">
          NutriFamily
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 flex flex-col gap-0.5">
        {NAV.map(({ view: v, Icon, label }) => {
          const active = view === v;
          return (
            <button
              key={v}
              onClick={() => onNav(v)}
              className={[
                "flex items-center gap-2.5 px-3 py-2 rounded-md text-sm w-full transition-colors",
                active
                  ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              ].join(" ")}
            >
              <Icon size={15} />
              {label}
            </button>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-3 py-4 border-t border-sidebar-border">
        <div className="flex items-center gap-2.5 px-2 py-2 rounded-md group hover:bg-sidebar-accent transition-colors">
          <div
            className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground shrink-0"
          >
            {user.name[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold truncate">{user.name}</div>
            <div className="text-xs text-muted-foreground truncate">{user.email}</div>
          </div>
          <button
            onClick={onLogout}
            className="p-1 rounded text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-foreground transition-all"
            title="Sign out"
          >
            <LogOut size={13} />
          </button>
        </div>
      </div>
    </aside>
  );
}

export function BottomNav({
  view,
  onNav,
}: {
  view: View;
  onNav: (v: View) => void;
}) {
  return (
    <nav className="flex bg-sidebar border-t border-sidebar-border">
      {NAV.map(({ view: v, Icon, label }) => (
        <button
          key={v}
          onClick={() => onNav(v)}
          className={[
            "flex-1 flex flex-col items-center gap-0.5 py-2.5",
            "text-[10px] font-medium transition-colors",
            view === v ? "text-primary" : "text-muted-foreground",
          ].join(" ")}
        >
          <Icon size={18} />
          {label}
        </button>
      ))}
    </nav>
  );
}
