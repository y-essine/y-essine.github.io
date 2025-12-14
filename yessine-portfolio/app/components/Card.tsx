import React from 'react';

interface CardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ title, children, className = '' }) => {
  return (
    <div className={`border border-[#292929] p-6 ${className}`}>
      <h3 className="text-white text-base font-normal mb-4">{title}</h3>
      {children}
    </div>
  );
};
