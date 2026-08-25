// Reusable skeleton primitives for loading states
export function SkeletonHeader() {
  return (
    <div className="flex justify-between items-center pb-6 border-b border-slate-200">
      <div className="space-y-2">
        <div className="h-8 w-64 bg-slate-200 rounded-lg animate-pulse" />
        <div className="h-4 w-96 bg-slate-200 rounded animate-pulse" />
      </div>
      <div className="h-10 w-36 bg-slate-200 rounded-lg animate-pulse" />
    </div>
  );
}

export function SkeletonTable({ rows = 8 }: { rows?: number }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden animate-pulse">
      {/* toolbar */}
      <div className="px-5 py-4 border-b border-slate-100 flex gap-3">
        <div className="h-9 w-64 bg-slate-200 rounded-lg" />
        <div className="h-9 w-32 bg-slate-200 rounded-lg" />
        <div className="ml-auto h-9 w-28 bg-slate-200 rounded-lg" />
      </div>
      {/* header row */}
      <div className="grid grid-cols-5 gap-4 px-5 py-3 border-b border-slate-100">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-3 bg-slate-200 rounded" />
        ))}
      </div>
      {/* data rows */}
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="grid grid-cols-5 gap-4 px-5 py-4 border-b border-slate-100 last:border-0">
          {[...Array(5)].map((_, j) => (
            <div key={j} className={`h-3 bg-slate-200 rounded ${j === 0 ? "w-4/5" : j === 4 ? "w-2/3" : ""}`} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function SkeletonStats({ count = 4 }: { count?: number }) {
  return (
    <div className={`grid grid-cols-2 lg:grid-cols-${count} gap-4 animate-pulse`}>
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
