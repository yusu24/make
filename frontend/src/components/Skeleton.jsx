import React from 'react';

const SkeletonBase = ({ className }) => (
  <div className={`animate-pulse bg-slate-100 rounded ${className}`} />
);

export const CardSkeleton = () => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
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
  <div className="w-full overflow-hidden bg-white rounded-xl border border-gray-100">
    <div className="p-4 border-b border-gray-100">
      <SkeletonBase className="h-6 w-48" />
    </div>
    <table className="w-full">
      <thead>
        <tr className="bg-gray-50">
          {[...Array(cols)].map((_, i) => (
            <th key={i} className="p-4">
              <SkeletonBase className="h-4 w-full" />
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {[...Array(rows)].map((_, i) => (
          <tr key={i} className="border-b border-gray-50">
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

export const ListSkeleton = () => (
  <div className="space-y-4">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="bg-white p-4 rounded-xl border border-slate-100 flex items-center gap-4">
        <SkeletonBase className="w-10 h-10 rounded-lg" />
        <div className="flex-1">
          <SkeletonBase className="h-4 w-1/3 mb-2" />
          <SkeletonBase className="h-3 w-1/4" />
        </div>
      </div>
    ))}
  </div>
);

export const DashboardSkeleton = () => (
  <div className="space-y-8 animate-fade-in">
    {/* KPI Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-white p-6 rounded-[32px] border border-slate-100">
          <div className="flex justify-between items-start mb-4">
            <SkeletonBase className="h-4 w-24" />
            <SkeletonBase className="w-10 h-10 rounded-2xl" />
          </div>
          <SkeletonBase className="h-8 w-32 mb-2" />
          <SkeletonBase className="h-3 w-16" />
        </div>
      ))}
    </div>

    {/* Chart + Circle Grid */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 bg-white p-8 rounded-[32px] border border-slate-100">
        <div className="flex justify-between items-center mb-8">
          <SkeletonBase className="h-6 w-48" />
          <SkeletonBase className="w-12 h-12 rounded-2xl" />
        </div>
        <SkeletonBase className="h-[260px] w-full rounded-2xl" />
      </div>
      <div className="bg-white p-8 rounded-[32px] border border-slate-100 flex flex-col items-center">
        <SkeletonBase className="h-6 w-32 mb-10 self-start" />
        <SkeletonBase className="w-48 h-48 rounded-full mb-8" />
        <div className="flex gap-4">
          <SkeletonBase className="h-3 w-16" />
          <SkeletonBase className="h-3 w-16" />
        </div>
      </div>
    </div>

    {/* Bottom Section */}
    <div className="bg-white p-8 rounded-[32px] border border-slate-100">
      <div className="flex justify-between mb-8">
        <SkeletonBase className="h-7 w-48" />
        <SkeletonBase className="h-5 w-20" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex gap-4 p-4 border border-slate-50 rounded-2xl">
            <SkeletonBase className="w-20 h-20 rounded-xl" />
            <div className="flex-1 space-y-3">
              <SkeletonBase className="h-4 w-full" />
              <SkeletonBase className="h-3 w-1/2" />
              <SkeletonBase className="h-2 w-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default SkeletonBase;
