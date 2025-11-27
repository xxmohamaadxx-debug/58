import { cn } from '@/lib/utils';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import React from 'react';
import { motion } from 'framer-motion';

const buttonVariants = cva(
	'relative inline-flex items-center justify-center rounded-xl text-sm font-semibold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 overflow-hidden group',
	{
		variants: {
			variant: {
				default: 'bg-gradient-to-r from-orange-500 to-pink-500 text-white hover:from-orange-600 hover:to-pink-600 shadow-lg hover:shadow-xl hover:shadow-orange-500/50 hover:scale-105 active:scale-95',
				destructive:
          'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-xl hover:shadow-red-500/50 hover:scale-105 active:scale-95',
				outline:
          'border-2 border-orange-500/30 bg-background/80 backdrop-blur-sm hover:bg-orange-500/10 hover:border-orange-500 hover:shadow-lg hover:scale-105 active:scale-95',
				secondary:
          'bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 text-gray-900 dark:text-white hover:shadow-lg hover:scale-105 active:scale-95',
				ghost: 'hover:bg-gradient-to-r hover:from-orange-500/10 hover:to-pink-500/10 hover:shadow-md hover:scale-105 active:scale-95',
				link: 'text-orange-600 hover:text-orange-700 underline-offset-4 hover:underline',
				gradient: 'bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 text-white hover:shadow-2xl hover:shadow-orange-500/50 hover:scale-110 active:scale-95 animate-gradient',
				neon: 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg shadow-orange-500/50 hover:shadow-xl hover:shadow-orange-500/70 hover:scale-110 active:scale-95',
			},
			size: {
				default: 'h-10 px-4 py-2',
				sm: 'h-9 rounded-lg px-3 text-xs',
				lg: 'h-12 rounded-xl px-8 text-base',
				icon: 'h-10 w-10 rounded-xl',
				xl: 'h-14 rounded-2xl px-10 text-lg',
			},
		},
		defaultVariants: {
			variant: 'default',
			size: 'default',
		},
	},
);

const Button = React.forwardRef(({ className, variant, size, asChild = false, children, ...props }, ref) => {
	const Comp = asChild ? Slot : motion.button;
	
	return (
		<Comp
			className={cn(buttonVariants({ variant, size, className }))}
			ref={ref}
			whileHover={{ scale: 1.05 }}
			whileTap={{ scale: 0.95 }}
			{...props}
		>
			{/* Animated Background Shimmer */}
			{(variant === 'gradient' || variant === 'neon' || variant === 'default') && (
				<motion.div
					className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
					animate={{
						x: ['-100%', '100%'],
					}}
					transition={{
						duration: 2,
						repeat: Infinity,
						repeatDelay: 1,
						ease: 'easeInOut',
					}}
				/>
			)}
			
			{/* Glow Effect for Neon variant */}
			{variant === 'neon' && (
				<motion.div
					className="absolute inset-0 bg-gradient-to-r from-orange-500 to-pink-500 opacity-50 blur-xl -z-10"
					animate={{
						opacity: [0.3, 0.6, 0.3],
						scale: [1, 1.1, 1],
					}}
					transition={{
						duration: 2,
						repeat: Infinity,
						ease: 'easeInOut',
					}}
				/>
			)}
			
			<span className="relative z-10 flex items-center gap-2">
				{children}
			</span>
		</Comp>
	);
});
Button.displayName = 'Button';

export { Button, buttonVariants };
