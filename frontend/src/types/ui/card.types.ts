import { ReactNode } from 'react';

export interface CardProps {
  title?: string;
  children: ReactNode;
  className?: string;
  footer?: ReactNode;
}
