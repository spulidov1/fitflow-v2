import React from 'react';

export const SkeletonLine = ({ width = 'full' }) => (
  <div className={`h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-${width}`} />
);

export const SkeletonCard = () => (
  <div className="bg-white dark:bg-gray-800 rounded-card p-6 shadow-lg animate-pulse">
    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4" />
    <div className="space-y-3">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6" />
    </div>
  </div>
);

export const SkeletonList = ({ count = 3 }) => (
  <div className="space-y-4">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-card animate-pulse">
        <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
        </div>
      </div>
    ))}
  </div>
);

export const SkeletonChart = () => (
  <div className="bg-white dark:bg-gray-800 rounded-card p-6 shadow-lg animate-pulse">
    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-6" />
    <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded" />
  </div>
);

export const SkeletonPhoto = () => (
  <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-card animate-pulse" />
);

const LoadingSkeleton = ({ type = 'card', count = 1 }) => {
  switch (type) {
    case 'line':
      return <SkeletonLine />;
    case 'card':
      return count > 1 ? (
        <div className="space-y-4">
          {Array.from({ length: count }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : (
        <SkeletonCard />
      );
    case 'list':
      return <SkeletonList count={count} />;
    case 'chart':
      return <SkeletonChart />;
    case 'photo':
      return count > 1 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: count }).map((_, i) => (
            <SkeletonPhoto key={i} />
          ))}
        </div>
      ) : (
        <SkeletonPhoto />
      );
    default:
      return <SkeletonCard />;
  }
};

export default LoadingSkeleton;
