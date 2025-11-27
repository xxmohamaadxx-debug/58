import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Logo = ({ size = 'md', showText = true, className = '', noLink = false }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-xl',
    xl: 'text-2xl'
  };

  const logoContent = (
    <motion.div 
      className={`flex items-center gap-2 ${className}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <motion.div
        className={`relative ${sizeClasses[size]} rounded-2xl bg-gradient-to-br from-orange-500 via-pink-500 to-purple-500 flex items-center justify-center text-white font-black shadow-2xl overflow-hidden group`}
        style={{ transformStyle: 'preserve-3d' }}
        whileHover={{ rotateY: 15, rotateX: 5 }}
        animate={{
          boxShadow: [
            '0 10px 30px rgba(255, 140, 0, 0.4)',
            '0 10px 40px rgba(236, 72, 153, 0.6)',
            '0 10px 30px rgba(255, 140, 0, 0.4)',
          ],
        }}
        transition={{
          boxShadow: {
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          },
        }}
      >
        {/* Animated Background Gradient */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-orange-400 via-pink-400 to-purple-400"
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
        
        {/* Glow Effect */}
        <motion.div
          className="absolute inset-0 bg-white/20 blur-xl"
          animate={{
            opacity: [0.3, 0.6, 0.3],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        
        {/* Logo Image or Letter */}
        <motion.img 
          src="/logo.png" 
          alt="نظام إبراهيم للمحاسبة" 
          className={`${sizeClasses[size]} object-contain flex-shrink-0 relative z-10`}
          style={{ maxWidth: '100%', height: 'auto', objectFit: 'contain' }}
          onError={(e) => {
            e.target.style.display = 'none';
            const fallback = e.target.parentElement?.querySelector('.logo-fallback');
            if (fallback) fallback.style.display = 'flex';
          }}
        />
        <motion.div 
          className="logo-fallback relative z-10 text-xl font-black hidden"
          style={{ display: 'none' }}
        >
          I
        </motion.div>
      </motion.div>
      
      {showText && (
        <motion.div 
          className="flex flex-col"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <motion.span 
            className={`${textSizes[size]} font-black bg-gradient-to-r from-orange-600 via-pink-600 to-purple-600 bg-clip-text text-transparent leading-tight`}
            animate={{
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: 'linear',
            }}
            style={{
              backgroundSize: '200% 200%',
            }}
          >
            إبراهيم
          </motion.span>
          {size !== 'sm' && (
            <motion.span 
              className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              نظام المحاسبة
            </motion.span>
          )}
        </motion.div>
      )}
    </motion.div>
  );

  if (noLink) {
    return logoContent;
  }

  return (
    <Link to="/" className="inline-block">
      {logoContent}
    </Link>
  );
};

export default Logo;
