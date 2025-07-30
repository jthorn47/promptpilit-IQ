import { useState } from 'react'
import { motion } from 'framer-motion'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { 
  MoreVertical, 
  Edit, 
  Trash2, 
  Copy, 
  Settings,
  BarChart3,
  Table,
  Gauge,
  Filter,
  Type,
  PieChart,
  LineChart,
  TrendingUp
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface ReportComponentProps {
  component: {
    id: string
    component_type: string
    component_config: any
    position_x: number
    position_y: number
    width: number
    height: number
  }
  isSelected?: boolean
  onUpdate?: (updates: any) => void
  onRemove?: () => void
  onCopy?: () => void
}

const componentIcons = {
  chart: BarChart3,
  line_chart: LineChart,
  pie_chart: PieChart,
  table: Table,
  kpi: Gauge,
  trend: TrendingUp,
  filter: Filter,
  text: Type
}

export function ReportComponent({
  component,
  isSelected,
  onUpdate,
  onRemove,
  onCopy
}: ReportComponentProps) {
  const [isEditing, setIsEditing] = useState(false)
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: component.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const Icon = componentIcons[component.component_type as keyof typeof componentIcons] || BarChart3

  const renderComponentContent = () => {
    const { component_config } = component

    switch (component.component_type) {
      case 'kpi':
        return (
          <div className="text-center p-4">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {component_config.title || 'KPI'}
            </h3>
            <div className="text-3xl font-bold text-primary">
              {component_config.value || '0'}
            </div>
            {component_config.trend && (
              <div className="text-sm text-muted-foreground mt-1">
                {component_config.trend > 0 ? '↗' : '↘'} {Math.abs(component_config.trend)}%
              </div>
            )}
          </div>
        )

      case 'chart':
      case 'line_chart':
      case 'pie_chart':
        return (
          <div className="p-4">
            <h3 className="text-sm font-medium text-foreground mb-3">
              {component_config.title || 'Chart'}
            </h3>
            <div className="h-24 bg-muted/50 rounded flex items-center justify-center">
              <Icon className="h-8 w-8 text-muted-foreground" />
              <span className="ml-2 text-xs text-muted-foreground">
                {component.component_type.replace('_', ' ')} Preview
              </span>
            </div>
          </div>
        )

      case 'table':
        return (
          <div className="p-4">
            <h3 className="text-sm font-medium text-foreground mb-3">
              {component_config.title || 'Data Table'}
            </h3>
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex gap-2">
                  <div className="h-4 bg-muted/50 rounded flex-1" />
                  <div className="h-4 bg-muted/50 rounded flex-1" />
                  <div className="h-4 bg-muted/50 rounded flex-1" />
                </div>
              ))}
            </div>
          </div>
        )

      case 'filter':
        return (
          <div className="p-4">
            <h3 className="text-sm font-medium text-foreground mb-3">
              {component_config.title || 'Filter'}
            </h3>
            <div className="h-8 bg-muted/50 rounded flex items-center px-3">
              <Filter className="h-4 w-4 text-muted-foreground mr-2" />
              <span className="text-xs text-muted-foreground">
                {component_config.filterType || 'dropdown'}
              </span>
            </div>
          </div>
        )

      case 'text':
        return (
          <div className="p-4">
            <div className="text-sm text-foreground">
              {component_config.content || 'Add your text here...'}
            </div>
          </div>
        )

      default:
        return (
          <div className="p-4 text-center">
            <Icon className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">
              {component.component_type}
            </p>
          </div>
        )
    }
  }

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="w-full h-full"
      whileHover={{ scale: 1.02 }}
      animate={{ scale: isSelected ? 1.02 : 1 }}
    >
      <Card 
        className={`
          h-full cursor-pointer transition-all duration-200 relative group
          ${isSelected ? 'ring-2 ring-primary shadow-lg' : 'hover:shadow-md'}
          ${isDragging ? 'shadow-2xl' : ''}
        `}
      >
        {/* Drag Handle */}
        <div
          {...listeners}
          className="absolute inset-x-0 top-0 h-2 cursor-grab active:cursor-grabbing bg-transparent group-hover:bg-primary/20 rounded-t"
        />

        {/* Component Menu */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <MoreVertical className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onCopy}>
                <Copy className="h-4 w-4 mr-2" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onRemove} className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Selection Indicator */}
        {isSelected && (
          <div className="absolute inset-0 border-2 border-primary rounded-lg pointer-events-none" />
        )}

        {/* Component Content */}
        <div className="relative h-full">
          {renderComponentContent()}
        </div>

        {/* Resize Handles */}
        {isSelected && (
          <>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-primary cursor-se-resize" />
            <div className="absolute bottom-1 right-1 w-1 h-1 bg-primary-foreground" />
          </>
        )}
      </Card>
    </motion.div>
  )
}