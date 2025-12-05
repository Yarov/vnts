import { ReactNode } from 'react';

export interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  change?: {
    value: number;
    isPositive: boolean;
  };
  footer?: string;
  className?: string;
}
