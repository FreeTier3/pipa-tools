
import { Building2 } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

export const Header = () => {
  const { currentOrganization } = useApp();

  return (
    <header className="border-b border-border bg-card px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <img 
            src="/lovable-uploads/65175c3d-3a3e-4412-bfb7-6cac7dc0c689.png" 
            alt="Infra Tools Logo" 
            className="h-8 w-8 object-contain rounded-lg"
          />
          <div>
            <h1 className="text-xl font-bold text-foreground">
              Infra Tools
            </h1>
            {currentOrganization && (
              <p className="text-sm text-muted-foreground">
                {currentOrganization.name}
              </p>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
