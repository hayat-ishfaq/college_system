"use client";

import React, { useState, useTransition } from "react";
import {
  Plus,
  Megaphone,
  Trash2,
  Bell,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Flame,
  Calendar,
  Users,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import {
  createAnnouncementAction,
  toggleAnnouncementStatusAction,
  deleteAnnouncementAction,
} from "./actions";
import { formatDate } from "@/lib/utils";
import { AnnouncementTarget, AnnouncementPriority } from "@prisma/client";

interface AnnouncementItem {
  id: string;
  title: string;
  content: string;
  target: AnnouncementTarget;
  priority: AnnouncementPriority;
  publishDate: Date;
  expiryDate: Date | null;
  isActive: boolean;
}

const PRIORITY_CONFIG: Record<
  AnnouncementPriority,
  { label: string; colors: string; icon: any }
> = {
  LOW: { label: "Low Priority", colors: "bg-slate-100 text-slate-600 border-slate-200", icon: Bell },
  NORMAL: { label: "Normal", colors: "bg-blue-50 text-blue-700 border-blue-200", icon: Bell },
  HIGH: { label: "High Priority", colors: "bg-amber-50 text-amber-700 border-amber-200", icon: AlertTriangle },
  URGENT: { label: "Urgent Alert", colors: "bg-red-50 text-red-700 border-red-200 animate-pulse", icon: Flame },
};

const TARGET_LABELS: Record<AnnouncementTarget, string> = {
  EVERYONE: "All Campus (Faculty & Students)",
  TEACHERS: "Faculty Only",
  STUDENTS: "Students Only",
};

export function AnnouncementManagementClient({
  announcements,
}: {
  announcements: AnnouncementItem[];
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await createAnnouncementAction(formData);
      if (res.success) {
        toast.success(res.message);
        setIsModalOpen(false);
      } else {
        toast.error(res.error);
      }
    });
  }

  function handleToggle(id: string, currentStatus: boolean) {
    startTransition(async () => {
      const res = await toggleAnnouncementStatusAction(id, !currentStatus);
      if (res.success) toast.success(res.message);
      else toast.error(res.error);
    });
  }

  function handleDelete(id: string, title: string) {
    if (!confirm(`Delete announcement "${title}"?`)) return;
    startTransition(async () => {
      const res = await deleteAnnouncementAction(id);
      if (res.success) toast.success(res.message);
      else toast.error(res.error);
    });
  }

  return (
    <div className="space-y-6">
      {/* Top Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <Megaphone className="w-5 h-5 text-indigo-600" />
          <span className="text-sm font-semibold text-slate-800">
            {announcements.length} Announcements Broadcasted
          </span>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Create Announcement
        </button>
      </div>

      {/* Announcements Feed */}
      <div className="space-y-4">
        {announcements.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400">
            <Megaphone className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <p className="text-sm">No announcements published yet. Click above to post a broadcast.</p>
          </div>
        ) : (
          announcements.map((item) => {
            const pConfig = PRIORITY_CONFIG[item.priority] || PRIORITY_CONFIG.NORMAL;
            const Icon = pConfig.icon;

            return (
              <div
                key={item.id}
                className={`bg-white rounded-2xl border transition-all p-6 shadow-sm ${
                  !item.isActive ? "opacity-60 bg-slate-50" : "hover:shadow-md"
                } border-slate-200`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${pConfig.colors}`}
                      >
                        <Icon className="w-3 h-3" />
                        {pConfig.label}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                        <Users className="w-3 h-3" />
                        {TARGET_LABELS[item.target]}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 pt-1">
                      {item.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggle(item.id, item.isActive)}
                      disabled={isPending}
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                        item.isActive
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-slate-100 text-slate-600 border border-slate-200"
                      }`}
                    >
                      {item.isActive ? "Active" : "Archived"}
                    </button>
                    <button
                      onClick={() => handleDelete(item.id, item.title)}
                      disabled={isPending}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                  {item.content}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> Published: {formatDate(item.publishDate)}
                  </span>
                  {item.expiryDate && (
                    <span>Expires: {formatDate(item.expiryDate)}</span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Create Announcement */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Broadcast Campus Announcement</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Announcement Title *</label>
                <input
                  name="title"
                  type="text"
                  required
                  placeholder="e.g. Mid-Term Examination Schedule Announcement"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Detailed Message *</label>
                <textarea
                  name="content"
                  rows={4}
                  required
                  placeholder="Type the full announcement content here..."
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Target Audience *</label>
                  <select
                    name="target"
                    required
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="EVERYONE">Everyone (Teachers & Students)</option>
                    <option value="TEACHERS">Faculty Only</option>
                    <option value="STUDENTS">Students Only</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Priority Level *</label>
                  <select
                    name="priority"
                    required
                    defaultValue="NORMAL"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="LOW">Low</option>
                    <option value="NORMAL">Normal</option>
                    <option value="HIGH">High Priority</option>
                    <option value="URGENT">Urgent Alert</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-50 cursor-pointer"
                >
                  {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  Publish Broadcast
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
