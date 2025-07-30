import { ReactNode } from "react";

interface PageHeaderProps {
  children: ReactNode;
  className?: string;
}

export const PageHeader = ({ children, className = '' }: PageHeaderProps) => {
  return (
    <header className={`px-4 md:px-6 py-4 md:py-6 border-b bg-white/80 backdrop-blur-sm ${className}`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {children}
      </div>
    </header>
  );
};