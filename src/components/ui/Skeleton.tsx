import React from "react";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-md bg-[var(--bg-3)] dark:bg-zinc-800/60 ${className}`}
      {...props}
    />
  );
}

// Preset layout: Stats card skeleton
export function StatsCardSkeleton() {
  return (
    <div className="glass-card rounded-2xl p-4 sm:p-5 min-h-[148px] flex flex-col justify-between animate-pulse">
      <div>
        <div className="flex items-start justify-between mb-4">
          <Skeleton className="h-3.5 w-24 rounded-full" />
          <Skeleton className="h-7 w-7 rounded-lg" />
        </div>
        <Skeleton className="h-7 w-32 rounded-lg mt-1" />
      </div>
      <div className="mt-4">
        <Skeleton className="h-3 w-28 rounded-full" />
      </div>
    </div>
  );
}

// Preset layout: Document row skeleton
export function DocumentRowSkeleton() {
  return (
    <div className="flex items-center gap-3 sm:gap-4 px-5 sm:px-6 py-4 animate-pulse">
      <Skeleton className="h-9 w-9 rounded-xl flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-1/3 rounded-lg" />
        <Skeleton className="h-3 w-1/4 rounded-lg" />
      </div>
      <Skeleton className="h-6 w-16 rounded-full" />
    </div>
  );
}

// Preset layout: History item skeleton
export function HistoryItemSkeleton() {
  return (
    <div className="glass-card rounded-2xl p-5 space-y-4 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4.5 w-1/2 rounded-lg" />
          <Skeleton className="h-3 w-1/3 rounded-lg" />
        </div>
        <Skeleton className="h-5 w-14 rounded-full" />
      </div>
      <div className="flex items-center gap-6 pt-2">
        <Skeleton className="h-3 w-16 rounded-lg" />
        <Skeleton className="h-3 w-16 rounded-lg" />
        <Skeleton className="h-3 w-16 rounded-lg" />
      </div>
    </div>
  );
}
