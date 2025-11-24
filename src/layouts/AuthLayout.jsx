
import React from 'react';
import { motion } from 'framer-motion';

const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700"
      >
        {children}
      </motion.div>
      <p className="mt-8 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Ibrahim Accounting System. All rights reserved.
      </p>
    </div>
  );
};

export default AuthLayout;
