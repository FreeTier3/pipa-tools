
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Users, 
  Shield, 
  Laptop, 
  Building2,
  ChevronLeft,
  ChevronRight,
  Building,
  Settings
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Organizações', href: '/organizations', icon: Building },
  { name: 'Times', href: '/teams', icon: Building2 },
  { name: 'Pessoas', href: '/people', icon: Users },
  { name: 'Licenças', href: '/licenses', icon: Shield },
  { name: 'Ativos', href: '/assets', icon: Laptop },
  { name: 'Configurações', href: '/settings', icon: Settings },
];

export const Sidebar = ({ isOpen, onToggle }: SidebarProps) => {
  const location = useLocation();

  return (
    <div className={cn(
      "bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out flex flex-col shadow-lg",
      isOpen ? "w-64" : "w-16"
    )}>
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center justify-between">
          {isOpen && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                <img 
                  src="/lovable-uploads/65175c3d-3a3e-4412-bfb7-6cac7dc0c689.png" 
                  alt="Infra Tools Logo" 
                  className="w-8 h-8 object-contain rounded-lg"
                />
              </div>
              <div>
                <h1 className="text-lg font-bold text-sidebar-foreground">Infra Tools</h1>
                <p className="text-xs text-muted-foreground">Sistema de Gestão</p>
              </div>
            </div>
          )}
          <button
            onClick={onToggle}
            className="p-1 rounded-md hover:bg-sidebar-accent transition-colors"
          >
            {isOpen ? (
              <ChevronLeft className="w-4 h-4 text-sidebar-foreground" />
            ) : (
              <ChevronRight className="w-4 h-4 text-sidebar-foreground" />
            )}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-gradient-to-r from-sidebar-primary to-sidebar-primary/80 text-sidebar-primary-foreground shadow-md"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:scale-105"
              )}
            >
              <item.icon className={cn(
                "flex-shrink-0",
                isOpen ? "w-5 h-5 mr-3" : "w-5 h-5"
              )} />
              {isOpen && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      {isOpen && (
        <div className="p-4 border-t border-sidebar-border">
          <div className="text-xs text-muted-foreground">
            <p>Versão 1.0.0</p>
            <p>© 2024 Infra Tools</p>
          </div>
        </div>
      )}
    </div>
  );
};
