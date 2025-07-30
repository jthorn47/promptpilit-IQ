import React from 'react';
import { WidgetManager } from './WidgetManager';

interface CustomizableWidgetAreaProps {
  className?: string;
  title?: string;
  showHeader?: boolean;
  maxWidgets?: number;
}

export const CustomizableWidgetArea: React.FC<CustomizableWidgetAreaProps> = (props) => {
  return <WidgetManager {...props} />;
};