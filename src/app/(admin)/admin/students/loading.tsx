import { SkeletonHeader, SkeletonTable } from "@/components/layout/Skeletons";
export default function Loading() {
  return <div className="p-8 space-y-6"><SkeletonHeader /><SkeletonTable /></div>;
}
