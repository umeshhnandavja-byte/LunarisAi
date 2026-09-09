"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/components/theme-provider";
import { 
  LayoutDashboard, 
  UploadCloud, 
  BarChart2, 
  Clock, 
  Globe, 
  Sun, 
  Moon,
  Box
} from "lucide-react";

const navigation = [
  { name: "Integrated Mission Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Multi-Sensor Data Ingest", href: "/upload", icon: UploadCloud },
  { name: "Feature-Based Co-Registration", href: "/result", icon: LayoutDashboard },
  { name: "Temporal Illumination Modeling", href: "/temporal", icon: Clock },
  { name: "Lithological Abundance Map", href: "/", icon: BarChart2 },
  { name: "Multi-Modal Data Fusion", href: "/3d-model", icon: Box },
  { name: "Digital Twin Viewer", href: "/digital-twin", icon: Globe },
];

export function Sidebar() {
  const pathname = usePathname();
  const { theme, toggle } = useTheme();

  return (
    <div className="flex h-screen w-64 flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0e0f1a] transition-colors duration-300">
      <div className="flex h-16 shrink-0 items-center px-6 border-b border-slate-200 dark:border-slate-800">
        <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">LUNARIS</span>
      </div>
      
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-4 py-4 custom-scrollbar">
        {navigation.map((item) => {
          const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-white"
              }`}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-200 dark:border-slate-800">
        <button
          onClick={toggle}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-white transition-colors"
        >
          {theme === "dark" ? (
            <>
              <Sun className="h-4 w-4" />
              Light Mode
            </>
          ) : (
            <>
              <Moon className="h-4 w-4" />
              Dark Mode
            </>
          )}
        </button>
      </div>
    </div>
  );
}
