"use client";

import React, { useState } from "react";
import {
  User,
  BookOpen,
  Users,
  MapPin,
  CheckCircle,
  Loader2,
  X,
  GraduationCap,
} from "lucide-react";
import { toast } from "sonner";
import { createStudentAction } from "./actions";

interface ClassOption {
  id: string;
  name: string;
  sections: Array<{ id: string; name: string }>;
}

interface AdmissionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  classes: ClassOption[];
}

export function AdmissionDialog({
  isOpen,
  onClose,
  classes,
}: AdmissionDialogProps) {
  const [activeTab, setActiveTab] = useState<"personal" | "academic" | "guardian" | "address">("personal");
  const [selectedClassId, setSelectedClassId] = useState(classes[0]?.id || "");
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const selectedClass = classes.find((c) => c.id === selectedClassId);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    const res = await createStudentAction(formData);
    setIsLoading(false);

    if (res.success) {
      toast.success(res.message);
      onClose();
    } else {
      toast.error(res.error);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]">
        {/* Dialog Header */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-700 px-6 py-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold">New Student Admission</h2>
              <p className="text-xs text-blue-100">
                Multi-section official student enrollment wizard
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 shrink-0 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab("personal")}
            className={`flex items-center gap-1.5 py-3 px-3 border-b-2 transition-all ${
              activeTab === "personal"
                ? "border-blue-600 text-blue-700 bg-white"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <User className="w-3.5 h-3.5" /> 1. Personal
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("academic")}
            className={`flex items-center gap-1.5 py-3 px-3 border-b-2 transition-all ${
              activeTab === "academic"
                ? "border-blue-600 text-blue-700 bg-white"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" /> 2. Academic
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("guardian")}
            className={`flex items-center gap-1.5 py-3 px-3 border-b-2 transition-all ${
              activeTab === "guardian"
                ? "border-blue-600 text-blue-700 bg-white"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <Users className="w-3.5 h-3.5" /> 3. Guardian
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("address")}
            className={`flex items-center gap-1.5 py-3 px-3 border-b-2 transition-all ${
              activeTab === "address"
                ? "border-blue-600 text-blue-700 bg-white"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <MapPin className="w-3.5 h-3.5" /> 4. Address & Account
          </button>
        </div>

        {/* Form Form Container */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 overflow-y-auto flex-1 space-y-4 text-sm">
            {/* Section 1: Personal */}
            <div className={activeTab === "personal" ? "space-y-4" : "hidden"}>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    First Name *
                  </label>
                  <input
                    name="firstName"
                    type="text"
                    required
                    placeholder="e.g. Ahmed"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Last Name *
                  </label>
                  <input
                    name="lastName"
                    type="text"
                    required
                    placeholder="e.g. Raza"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Date of Birth
                  </label>
                  <input
                    name="dateOfBirth"
                    type="date"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Gender
                  </label>
                  <select
                    name="gender"
                    defaultValue="MALE"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Blood Group
                  </label>
                  <select
                    name="bloodGroup"
                    defaultValue="B_POS"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="A_POS">A+</option>
                    <option value="A_NEG">A-</option>
                    <option value="B_POS">B+</option>
                    <option value="B_NEG">B-</option>
                    <option value="AB_POS">AB+</option>
                    <option value="AB_NEG">AB-</option>
                    <option value="O_POS">O+</option>
                    <option value="O_NEG">O-</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 2: Academic */}
            <div className={activeTab === "academic" ? "space-y-4" : "hidden"}>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Class Program *
                  </label>
                  <select
                    value={selectedClassId}
                    onChange={(e) => setSelectedClassId(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Section *
                  </label>
                  <select
                    name="sectionId"
                    required
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {!selectedClass?.sections || selectedClass.sections.length === 0 ? (
                      <option value="">No sections available</option>
                    ) : (
                      selectedClass.sections.map((sec) => (
                        <option key={sec.id} value={sec.id}>
                          Section {sec.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Roll Number
                  </label>
                  <input
                    name="rollNumber"
                    type="text"
                    placeholder="e.g. 101"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Custom Admission No (Optional)
                  </label>
                  <input
                    name="admissionNumber"
                    type="text"
                    placeholder="Auto-generated if blank"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Previous School / Institution
                </label>
                <input
                  name="previousSchool"
                  type="text"
                  placeholder="e.g. Army Public School, Islamabad"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Section 3: Guardian */}
            <div className={activeTab === "guardian" ? "space-y-4" : "hidden"}>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Father's Name
                  </label>
                  <input
                    name="fatherName"
                    type="text"
                    placeholder="e.g. Tariq Raza"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mother's Name
                  </label>
                  <input
                    name="motherName"
                    type="text"
                    placeholder="e.g. Salma Tariq"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Guardian Phone Number
                  </label>
                  <input
                    name="guardianPhone"
                    type="text"
                    placeholder="+92 321 9876543"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Emergency Contact
                  </label>
                  <input
                    name="emergencyContact"
                    type="text"
                    placeholder="+92 300 0000000"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Address & Account */}
            <div className={activeTab === "address" ? "space-y-4" : "hidden"}>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Student Portal Email Address *
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="student.name@brightfuture.edu.pk"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Used for logging into the Student Portal. Default password: <span className="font-mono font-bold text-blue-700">Student@123</span>
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Street Address
                  </label>
                  <input
                    name="address"
                    type="text"
                    placeholder="House / Street / Sector"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    City
                  </label>
                  <input
                    name="city"
                    type="text"
                    defaultValue="Islamabad"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Dialog Footer */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-1.5">
              {activeTab !== "personal" && (
                <button
                  type="button"
                  onClick={() => {
                    if (activeTab === "address") setActiveTab("guardian");
                    else if (activeTab === "guardian") setActiveTab("academic");
                    else if (activeTab === "academic") setActiveTab("personal");
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg"
                >
                  ← Back
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-lg"
              >
                Cancel
              </button>

              {activeTab !== "address" ? (
                <button
                  type="button"
                  onClick={() => {
                    if (activeTab === "personal") setActiveTab("academic");
                    else if (activeTab === "academic") setActiveTab("guardian");
                    else if (activeTab === "guardian") setActiveTab("address");
                  }}
                  className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
                >
                  Next Section →
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center gap-2 px-5 py-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm disabled:opacity-50"
                >
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Submit Admission
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
