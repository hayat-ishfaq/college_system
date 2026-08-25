// Centered circle spinner — used by all loading.tsx files
export default function PageLoader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      {/* Outer ring */}
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-slate-100" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 animate-spin" />
        {/* Inner pulse dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-blue-600 animate-pulse" />
        </div>
      </div>
      <p className="text-sm font-medium text-slate-400 tracking-wide animate-pulse">
        Loading…
      </p>
    </div>
  );
}

// Keep skeleton exports for any other use
export function SkeletonHeader() {
  return (
    <div className="flex justify-between items-center pb-6 border-b border-slate-200 animate-pulse">
      <div className="space-y-2">
        <div className="h-8 w-64 bg-slate-200 rounded-lg" />
        <div className="h-4 w-96 bg-slate-200 rounded" />
      </div>
      <div className="h-10 w-36 bg-slate-200 rounded-lg" />
    </div>
  );
}

export function SkeletonTable({ rows = 8 }: { rows?: number }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden animate-pulse">
      <div className="px-5 py-4 border-b border-slate-100 flex gap-3">
        <div className="h-9 w-64 bg-slate-200 rounded-lg" />
        <div className="h-9 w-32 bg-slate-200 rounded-lg" />
        <div className="ml-auto h-9 w-28 bg-slate-200 rounded-lg" />
      </div>
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="grid grid-cols-5 gap-4 px-5 py-4 border-b border-slate-100 last:border-0">
          {[...Array(5)].map((_, j) => (
            <div key={j} className="h-3 bg-slate-200 rounded" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function SkeletonStats({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="h-28 bg-slate-200 rounded-xl" />
      ))}
    </div>
  );
}

export function SkeletonCards({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="h-40 bg-slate-200 rounded-xl" />
      ))}
    </div>
  );
}

