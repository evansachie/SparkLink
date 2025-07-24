import React from 'react';

interface CustomScrollbarProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const CustomScrollbar: React.FC<CustomScrollbarProps> = ({ 
  children, 
  className = '', 
  style = {} 
}) => {
  return (
    <div 
      className={`sidebar-scrollbar ${className}`}
      style={style}
    >
      {children}
    </div>
  );
};
