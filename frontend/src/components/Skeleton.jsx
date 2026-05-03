import React from 'react';

const SkeletonBase = ({ className }) => (
  <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`} />
);

export const CardSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
    <div className="flex items-center gap-4 mb-4">
      <SkeletonBase className="w-12 h-12 rounded-xl" />
      <div className="flex-1">
        <SkeletonBase className="h-4 w-24 mb-2" />
        <SkeletonBase className="h-3 w-16" />
      </div>
    </div>
    <SkeletonBase className="h-8 w-32 mb-2" />
    <SkeletonBase className="h-3 w-full" />
  </div>
);

export const TableSkeleton = ({ rows = 5, cols = 4 }) => (
  <div className="w-full overflow-hidden bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
    <div className="p-4 border-b border-gray-100 dark:border-gray-700">
      <SkeletonBase className="h-6 w-48" />
    </div>
    <table className="w-full">
      <thead>
        <tr className="bg-gray-50 dark:bg-gray-900/50">
          {[...Array(cols)].map((_, i) => (
            <th key={i} className="p-4">
              <SkeletonBase className="h-4 w-full" />
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {[...Array(rows)].map((_, i) => (
          <tr key={i} className="border-b border-gray-50 dark:border-gray-800">
            {[...Array(cols)].map((_, j) => (
              <td key={j} className="p-4">
                <SkeletonBase className="h-4 w-full" />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export const ListSkeleton = ({ count = 4 }) => (
  <div className="space-y-4">
    {[...Array(count)].map((_, i) => (
      <div key={i} className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
        <SkeletonBase className="w-10 h-10 rounded-full" />
        <div className="flex-1">
          <SkeletonBase className="h-4 w-1/3 mb-2" />
          <SkeletonBase className="h-3 w-1/2" />
        </div>
        <SkeletonBase className="w-16 h-6 rounded-lg" />
      </div>
    ))}
  </div>
);

export const PosSkeleton = () => (
  <div className="grid grid-cols-12 gap-6 h-full">
    {/* Left: Products Grid */}
    <div className="col-span-8 space-y-6">
      <div className="flex gap-4">
        <SkeletonBase className="h-10 w-64" />
        <SkeletonBase className="h-10 w-32" />
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-100 dark:border-gray-700">
            <SkeletonBase className="aspect-square w-full rounded-lg mb-3" />
            <SkeletonBase className="h-4 w-3/4 mb-2" />
            <SkeletonBase className="h-5 w-1/2" />
          </div>
        ))}
      </div>
    </div>
    {/* Right: Cart Sidebar */}
    <div className="col-span-4 bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 flex flex-col gap-6">
      <SkeletonBase className="h-8 w-1/2" />
      <div className="flex-1 space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex gap-3">
            <SkeletonBase className="w-12 h-12 rounded-lg" />
            <div className="flex-1">
              <SkeletonBase className="h-4 w-full mb-2" />
              <SkeletonBase className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
      <div className="pt-6 border-t border-gray-100 dark:border-gray-700 space-y-3">
        <div className="flex justify-between"><SkeletonBase className="h-4 w-16" /><SkeletonBase className="h-4 w-20" /></div>
        <div className="flex justify-between"><SkeletonBase className="h-6 w-24" /><SkeletonBase className="h-6 w-32" /></div>
        <SkeletonBase className="h-12 w-full rounded-xl mt-4" />
      </div>
    </div>
  </div>
);

export default SkeletonBase;
