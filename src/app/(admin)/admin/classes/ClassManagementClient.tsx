"use client";

import React, { useState } from "react";
import {
  Plus,
  BookOpen,
  Users,
  DoorClosed,
  MoreVertical,
  Trash2,
  Edit2,
  CheckCircle2,
  XCircle,
  Loader2,
  Layers,
} from "lucide-react";
import { toast } from "sonner";
import {
  createClassAction,
  createSectionAction,
  deleteClassAction,
  deleteSectionAction,
} from "./actions";

interface ClassItem {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  sections: Array<{
    id: string;
    name: string;
    capacity: number | null;
    room: string | null;
    isActive: boolean;
    _count: {
      students: number;
      teacherAssignments: number;
    };
  }>;
}

export function ClassManagementClient({
  classes,
}: {
  classes: ClassItem[];
}) {
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [selectedClassName, setSelectedClassName] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  // Handle Class Creation
  async function handleCreateClass(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    const res = await createClassAction(formData);
    setIsLoading(false);

    if (res.success) {
      toast.success(res.message);
      setIsClassModalOpen(false);
    } else {
      toast.error(res.error);
    }
  }

  // Handle Section Creation
  async function handleCreateSection(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.append("classId", selectedClassId);
    const res = await createSectionAction(formData);
    setIsLoading(false);

    if (res.success) {
      toast.success(res.message);
      setIsSectionModalOpen(false);
    } else {
      toast.error(res.error);
    }
  }

  // Handle Class Deletion
  async function handleDeleteClass(id: string, name: string) {
    if (!confirm(`Are you sure you want to delete class "${name}"?`)) return;
    const res = await deleteClassAction(id);
    if (res.success) {
      toast.success(res.message);
    } else {
      toast.error(res.error);
    }
  }

  // Handle Section Deletion
  async function handleDeleteSection(id: string, name: string) {
    if (!confirm(`Are you sure you want to delete section "${name}"?`)) return;
    const res = await deleteSectionAction(id);
    if (res.success) {
      toast.success(res.message);
    } else {
      toast.error(res.error);
    }
  }

  return (
    <div className="space-y-6">
      {/* Action Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-blue-600" />
          <span className="text-sm font-semibold text-slate-800">
            {classes.length} Total Academic Classes
          </span>
        </div>
        <button
          onClick={() => setIsClassModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" /> Add Class
        </button>
      </div>

      {/* Class Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map((cls) => {
          const totalStudents = cls.sections.reduce(
            (acc, s) => acc + s._count.students,
            0
          );

          return (
            <div
              key={cls.id}
              className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col"
            >
              {/* Card Header */}
              <div className="p-5 border-b border-slate-100 flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-blue-600" />
                    {cls.name}
                  </h3>
                  {cls.description && (
                    <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                      {cls.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      cls.isActive
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {cls.isActive ? "Active" : "Inactive"}
                  </span>
                  <button
                    onClick={() => handleDeleteClass(cls.id, cls.name)}
                    className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                    title="Delete Class"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Card Body - Sections */}
              <div className="p-5 flex-1 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-500 pb-1">
                  <span>Sections ({cls.sections.length})</span>
                  <span className="font-semibold text-slate-700">
                    {totalStudents} Enrolled
                  </span>
                </div>

                <div className="space-y-2">
                  {cls.sections.length === 0 ? (
                    <p className="text-xs text-slate-400 italic py-2 text-center">
                      No sections added yet.
                    </p>
                  ) : (
                    cls.sections.map((sec) => (
                      <div
                        key={sec.id}
                        className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-md bg-blue-100 text-blue-700 font-bold flex items-center justify-center">
                            {sec.name}
                          </span>
                          <div>
                            <span className="font-medium text-slate-800">
                              Section {sec.name}
                            </span>
                            {sec.room && (
                              <span className="text-[11px] text-slate-400 block">
                                {sec.room}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-slate-600 flex items-center gap-1">
                            <Users className="w-3 h-3 text-slate-400" />
                            {sec._count.students}
                            {sec.capacity ? `/${sec.capacity}` : ""}
                          </span>
                          <button
                            onClick={() => handleDeleteSection(sec.id, sec.name)}
                            className="text-slate-300 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Card Footer */}
              <div className="p-3 bg-slate-50 border-t border-slate-100">
                <button
                  onClick={() => {
                    setSelectedClassId(cls.id);
                    setSelectedClassName(cls.name);
                    setIsSectionModalOpen(true);
                  }}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-medium text-blue-600 bg-blue-50/50 hover:bg-blue-100/60 border border-blue-200 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Section
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Create Class */}
      {isClassModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                Add Academic Class
              </h3>
              <button
                onClick={() => setIsClassModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateClass} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Class Name *
                </label>
                <input
                  name="name"
                  type="text"
                  required
                  placeholder="e.g. Grade 11, ICS Part-I"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  rows={2}
                  placeholder="Optional program details or requirements"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsClassModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50"
                >
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Create Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Create Section */}
      {isSectionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Add Section
                </h3>
                <p className="text-xs text-slate-500">For {selectedClassName}</p>
              </div>
              <button
                onClick={() => setIsSectionModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSection} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Section Name *
                </label>
                <input
                  name="name"
                  type="text"
                  required
                  placeholder="e.g. A, B, Green, Blue"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Room Number
                  </label>
                  <input
                    name="room"
                    type="text"
                    placeholder="e.g. Room 102"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Capacity
                  </label>
                  <input
                    name="capacity"
                    type="number"
                    min="1"
                    max="200"
                    placeholder="e.g. 40"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSectionModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50"
                >
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Add Section
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
