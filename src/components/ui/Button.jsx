import React from 'react';

export const Button = ({ children, variant = 'primary', size = 'md', className = '', ...props }) => {
  const baseStyles = "inline-flex items-center justify-center font-semibold rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  const variants = {
    primary: "bg-brand-magenta text-white border-2 border-brand-magenta hover:bg-white hover:text-brand-magenta focus:ring-brand-magenta shadow-md hover:shadow-lg hover:-translate-y-0.5",
    secondary: "bg-brand-pink text-brand-dark hover:bg-brand-purple focus:ring-brand-pink shadow-sm hover:shadow hover:-translate-y-0.5",
    outline: "border-2 border-brand-magenta text-brand-magenta hover:bg-brand-magenta hover:text-white focus:ring-brand-magenta shadow-md hover:shadow-lg hover:-translate-y-0.5",
    ghost: "text-brand-dark hover:bg-brand-light focus:ring-brand-light"
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-2.5 text-base",
    lg: "px-8 py-3.5 text-lg"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
