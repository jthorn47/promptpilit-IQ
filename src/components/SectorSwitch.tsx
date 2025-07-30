import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronDown, Building2, GraduationCap } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate, useLocation } from 'react-router-dom';

const SectorSwitch = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Determine current sector based on route
  const currentSector = 'main';
  
  const sectors = [
    {
      id: 'main',
      name: 'Easeworks & EaseLearn',
      description: 'Main platform with shared tools',
      icon: GraduationCap,
      route: '/admin'
    }
  ];

  const currentSectorData = sectors.find(s => s.id === currentSector);

  const handleSectorChange = (sectorRoute: string) => {
    navigate(sectorRoute);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className="flex items-center gap-2 min-w-[200px] justify-between"
        >
          <div className="flex items-center gap-2">
            {currentSectorData && (
              <>
                <currentSectorData.icon className="w-4 h-4" />
                <span className="truncate">{currentSectorData.name}</span>
              </>
            )}
          </div>
          <ChevronDown className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="start" className="w-[280px]">
        {sectors.map((sector) => {
          const Icon = sector.icon;
          const isActive = sector.id === currentSector;
          
          return (
            <DropdownMenuItem
              key={sector.id}
              onClick={() => handleSectorChange(sector.route)}
              className={`flex items-start gap-3 p-3 cursor-pointer ${
                isActive ? 'bg-primary/10 text-primary' : ''
              }`}
            >
              <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <div className="font-medium">{sector.name}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {sector.description}
                </div>
              </div>
              {isActive && (
                <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-2" />
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SectorSwitch;