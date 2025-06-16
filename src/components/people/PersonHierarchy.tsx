
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Person } from '@/types';
import { peopleService } from '@/services/peopleService';
import { useApp } from '@/contexts/AppContext';
import { Users, ChevronDown, ChevronRight, User } from 'lucide-react';

interface PersonHierarchyProps {
  selectedPersonId?: string;
  onPersonSelect?: (person: Person) => void;
}

interface PersonNode {
  id: string;
  name: string;
  email: string;
  position: string;
  status: 'active' | 'inactive';
  organizationId: string;
  teamId: string;
  teamName: string;
  entryDate: string;
  managerId?: string;
  subordinates: PersonNode[];
  level: number;
  originalPerson: Person;
}

export const PersonHierarchy = ({ selectedPersonId, onPersonSelect }: PersonHierarchyProps) => {
  const { currentOrganization } = useApp();
  const [people, setPeople] = useState<Person[]>([]);
  const [hierarchyTree, setHierarchyTree] = useState<PersonNode[]>([]);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (currentOrganization) {
      const allPeople = peopleService.getAll(currentOrganization.id);
      setPeople(allPeople);
      buildHierarchy(allPeople);
    }
  }, [currentOrganization]);

  const buildHierarchy = (peopleList: Person[]) => {
    // Criar um mapa de pessoas por ID
    const peopleMap = new Map<string, PersonNode>();
    
    // Inicializar todos os nós
    peopleList.forEach(person => {
      peopleMap.set(person.id, {
        id: person.id,
        name: person.name,
        email: person.email,
        position: person.position,
        status: person.status,
        organizationId: person.organizationId,
        teamId: person.teamId,
        teamName: person.teamName,
        entryDate: person.entryDate,
        managerId: person.managerId,
        subordinates: [],
        level: 0,
        originalPerson: person
      });
    });

    // Construir relações hierárquicas
    const rootNodes: PersonNode[] = [];
    
    peopleList.forEach(person => {
      const node = peopleMap.get(person.id)!;
      
      if (person.managerId && peopleMap.has(person.managerId)) {
        // Tem manager, adicionar como subordinado
        const manager = peopleMap.get(person.managerId)!;
        manager.subordinates.push(node);
        node.level = manager.level + 1;
      } else {
        // Não tem manager, é nó raiz
        rootNodes.push(node);
      }
    });

    // Ordenar por nome
    const sortNodes = (nodes: PersonNode[]) => {
      nodes.sort((a, b) => a.name.localeCompare(b.name));
      nodes.forEach(node => {
        if (node.subordinates.length > 0) {
          sortNodes(node.subordinates);
        }
      });
    };

    sortNodes(rootNodes);
    setHierarchyTree(rootNodes);
  };

  const toggleExpanded = (personId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(personId)) {
      newExpanded.delete(personId);
    } else {
      newExpanded.add(personId);
    }
    setExpandedNodes(newExpanded);
  };

  const renderPersonNode = (node: PersonNode) => {
    const hasSubordinates = node.subordinates.length > 0;
    const isExpanded = expandedNodes.has(node.id);
    const isSelected = selectedPersonId === node.id;

    return (
      <div key={node.id} className="space-y-1">
        <div 
          className={`flex items-center space-x-2 p-2 rounded-lg cursor-pointer transition-colors ${
            isSelected ? 'bg-primary/10 border border-primary/20' : 'hover:bg-muted/50'
          }`}
          style={{ marginLeft: `${node.level * 24}px` }}
          onClick={() => onPersonSelect?.(node.originalPerson)}
        >
          {hasSubordinates ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 p-0"
              onClick={(e) => {
                e.stopPropagation();
                toggleExpanded(node.id);
              }}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          ) : (
            <div className="w-6 h-6 flex items-center justify-center">
              <User className="h-3 w-3 text-muted-foreground" />
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <span className="font-medium truncate">{node.name}</span>
              <Badge variant="outline" className="text-xs">
                {node.position}
              </Badge>
              {node.teamName && (
                <Badge variant="secondary" className="text-xs">
                  {node.teamName}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground truncate">{node.email}</p>
          </div>

          {hasSubordinates && (
            <Badge variant="outline" className="text-xs">
              {node.subordinates.length} subordinado{node.subordinates.length !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>

        {hasSubordinates && isExpanded && (
          <div className="space-y-1">
            {node.subordinates.map(subordinate => renderPersonNode(subordinate))}
          </div>
        )}
      </div>
    );
  };

  if (!currentOrganization) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Users className="w-5 h-5" />
          <span>Hierarquia Organizacional</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {hierarchyTree.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium">Nenhuma hierarquia encontrada</h3>
            <p className="text-muted-foreground">
              Adicione pessoas e defina suas relações hierárquicas.
            </p>
          </div>
        ) : (
          <div className="space-y-1 max-h-96 overflow-y-auto">
            {hierarchyTree.map(node => renderPersonNode(node))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
