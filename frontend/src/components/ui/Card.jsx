import React from "react";

export const Card = ({
  children,
  hoverEffect = false,
  className = "",
  ...props
}) => {
  return (
    <div
      className={`glass-panel rounded-2xl p-6 transition-all duration-300 
        ${hoverEffect ? "glass-card-hover cursor-pointer" : ""} 
        ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
