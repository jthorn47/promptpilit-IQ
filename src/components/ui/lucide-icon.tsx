import { icons, LucideProps, Circle } from 'lucide-react';

interface LucideIconProps extends Omit<LucideProps, 'ref'> {
  name: keyof typeof icons;
}

export const LucideIcon = ({ name, ...props }: LucideIconProps) => {
  const Icon = icons[name];
  
  if (!Icon) {
    // Fallback to a default icon if the requested icon doesn't exist
    return <Circle {...props} />;
  }
  
  return <Icon {...props} />;
};