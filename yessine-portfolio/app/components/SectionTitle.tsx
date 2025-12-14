import React from 'react';

interface SectionTitleProps {
  children: React.ReactNode;
}

export const SectionTitle: React.FC<SectionTitleProps> = ({ children }) => {
  return (
    <h2 className="text-5xl font-bold leading-[1.2] tracking-tight">
      {children}
    </h2>
  );
};
