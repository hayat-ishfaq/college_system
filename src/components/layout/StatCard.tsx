import React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  iconColorClass?: string;
  iconBgClass?: string;
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  iconColorClass = "text-blue-600",
  iconBgClass = "bg-blue-50",
}: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500">{title}</span>
        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", iconBgClass)}>
          <Icon className={cn("w-5 h-5", iconColorClass)} />
        </div>
      </div>
      <div className="mt-3">
        <div className="text-2xl font-bold text-slate-900">{value}</div>
        {(description || trend) && (
          <div className="flex items-center gap-2 mt-1">
            {trend && (
              <span
                className={cn(
                  "text-xs font-semibold px-1.5 py-0.5 rounded",
                  trend.isPositive
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-rose-50 text-rose-700"
                )}
              >
                {trend.value}
              </span>
            )}
            {description && (
              <span className="text-xs text-slate-500">{description}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
