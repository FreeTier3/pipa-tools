
import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'orange' | 'pink';
}

const colorVariants = {
  blue: 'text-blue-500 bg-blue-100 dark:bg-blue-900/20',
  green: 'text-green-500 bg-green-100 dark:bg-green-900/20',
  yellow: 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900/20',
  red: 'text-red-500 bg-red-100 dark:bg-red-900/20',
  purple: 'text-purple-500 bg-purple-100 dark:bg-purple-900/20',
  orange: 'text-orange-500 bg-orange-100 dark:bg-orange-900/20',
  pink: 'text-pink-500 bg-pink-100 dark:bg-pink-900/20',
};

export const StatCard = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend, 
  trendValue,
  color = 'blue' 
}: StatCardProps) => {
  return (
    <Card className="card-hover">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
            )}
            {trendValue && (
              <p className={cn(
                "text-xs mt-1",
                trend === 'up' ? 'text-green-600' : 
                trend === 'down' ? 'text-red-600' : 'text-muted-foreground'
              )}>
                {trendValue}
              </p>
            )}
          </div>
          <div className={cn(
            "w-12 h-12 rounded-lg flex items-center justify-center",
            colorVariants[color]
          )}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
