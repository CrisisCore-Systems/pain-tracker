import React from 'react';

type TabsProps = {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  children: React.ReactNode;
};

export const Tabs: React.FC<TabsProps> = ({ children, className }) => (
  <div data-tabs className={className}>
    {children}
  </div>
);

export const TabsList: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => <div className={className}>{children}</div>;

export const TabsTrigger: React.FC<{
  value: string;
  onClick?: () => void;
  className?: string;
  children?: React.ReactNode;
}> = ({ children, onClick, className = '' }) => (
  <button type="button" className={className} onClick={onClick}>
    {children}
  </button>
);

export const TabsContent: React.FC<{
  value: string;
  className?: string;
  children?: React.ReactNode;
}> = ({ children, className = '' }) => <div className={className}>{children}</div>;
