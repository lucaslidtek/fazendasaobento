import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Filter } from "lucide-react";

interface MobileListControlsProps {
  onFilterClick: () => void;
  onExportClick: () => void;
  activeFilterCount?: number;
}

export function MobileListControls({
  onFilterClick,
  onExportClick,
  activeFilterCount = 0,
}: MobileListControlsProps) {
  return (
    <div className="flex gap-2 mb-3 w-full">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onFilterClick} 
        className="gap-1.5 flex-1 h-[38px] shadow-none text-foreground"
      >
        <Filter className="w-4 h-4" />
        Filtros
        {activeFilterCount > 0 && (
          <Badge variant="secondary" className="ml-1 h-4 px-1 text-[10px]">
            {activeFilterCount}
          </Badge>
        )}
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onExportClick} 
        className="gap-1.5 flex-1 h-[38px] shadow-none text-foreground"
      >
        <Download className="w-4 h-4" />
        Exportar
      </Button>
    </div>
  );
}
