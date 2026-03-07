
import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  ...props
}) => {
  const baseStyles = "inline-flex items-center justify-center font-medium transition-colors rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

  const variants = {
    primary: "bg-[#0B3D91] text-white hover:bg-[#082b66] shadow-[0_4px_14px_0_rgba(11,61,145,0.39)]",
    secondary: "bg-[#FF9933] text-white hover:bg-[#e68a2e] shadow-[0_4px_14px_0_rgba(255,153,51,0.39)]",
    accent: "bg-[#138808] text-white hover:bg-[#0f6c06] shadow-[0_4px_14px_0_rgba(19,136,8,0.39)]",
    outline: "border-2 border-[#0B3D91] bg-transparent hover:bg-[#0B3D91]/10 text-[#0B3D91]",
    ghost: "bg-transparent hover:bg-slate-100 text-slate-700"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg"
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
};
