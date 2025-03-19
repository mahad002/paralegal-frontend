import { motion } from 'framer-motion';
import { Scale, Gavel } from 'lucide-react';

export function SplashScreen() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gray-900"
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex items-center gap-4 mb-8 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 p-8 rounded-full"
      >
        <Scale className="w-16 h-16 text-cyan-400" />
        <Gavel className="w-16 h-16 text-cyan-400" />
      </motion.div>
      
      <motion.h1
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-4xl md:text-5xl font-bold text-white text-center mb-4"
      >
        Paralegal
      </motion.h1>
      
      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-xl text-gray-400 text-center max-w-md px-4"
      >
        A comprehensive legal case management system
      </motion.p>

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-12"
      >
        <div className="flex gap-2">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [1, 0.8, 1],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              repeatDelay: 0.2,
            }}
            className="w-3 h-3 bg-cyan-500 rounded-full"
          />
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [1, 0.8, 1],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              repeatDelay: 0.2,
              delay: 0.2,
            }}
            className="w-3 h-3 bg-cyan-500 rounded-full"
          />
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [1, 0.8, 1],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              repeatDelay: 0.2,
              delay: 0.4,
            }}
            className="w-3 h-3 bg-cyan-500 rounded-full"
          />
        </div>
      </motion.div>
    </motion.div>
  );
}