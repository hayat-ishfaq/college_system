import React from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Construction } from "lucide-react";

interface ModulePlaceholderProps {
  title: string;
  description: string;
  phase: string;
}

export function ModulePlaceholder({
  title,
  description,
  phase,
}: ModulePlaceholderProps) {
  return (
    <div className="p-8 space-y-6">
      <PageHeader title={title} description={description} />
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
          <Construction className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-semibold text-slate-900">
          {title} Module
        </h2>
        <p className="text-sm text-slate-500 max-w-md mx-auto mt-1">
          {description}
        </p>
        <div className="mt-4">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
            Scheduled for {phase}
          </span>
        </div>
      </div>
    </div>
  );
}
