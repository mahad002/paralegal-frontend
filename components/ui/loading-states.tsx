'use client';

import { motion } from 'framer-motion';

export function PageLoader() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-center">
        <motion.div
          className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full mx-auto mb-4"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        <motion.p
          className="text-gray-400 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Loading...
        </motion.p>
      </div>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
      <div className="space-y-4">
        <div className="h-4 bg-gray-800 rounded shimmer" />
        <div className="h-3 bg-gray-800 rounded shimmer w-3/4" />
        <div className="h-3 bg-gray-800 rounded shimmer w-1/2" />
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex space-x-4">
          <div className="h-4 bg-gray-800 rounded shimmer flex-1" />
          <div className="h-4 bg-gray-800 rounded shimmer w-24" />
          <div className="h-4 bg-gray-800 rounded shimmer w-20" />
          <div className="h-4 bg-gray-800 rounded shimmer w-16" />
        </div>
      ))}
    </div>
  );
}

export function ButtonLoader() {
  return (
    <motion.div
      className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    />
  );
}