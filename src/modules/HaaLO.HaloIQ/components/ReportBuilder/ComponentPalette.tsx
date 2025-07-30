import { motion } from 'framer-motion'
import { 
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
import { Badge } from '@/components/ui/badge'
import { useDraggable } from '@dnd-kit/core'

interface ComponentPaletteProps {
  onAddComponent: (type: string) => void
}

const componentTypes = [
  {
    type: 'chart',
    name: 'Bar Chart',
    icon: BarChart3,
    description: 'Compare data across categories',
    category: 'Charts',
    color: 'hsl(var(--primary))'
  },
  {
    type: 'line_chart',
    name: 'Line Chart',
    icon: LineChart,
    description: 'Show trends over time',
    category: 'Charts',
    color: 'hsl(var(--primary))'
  },
  {
    type: 'pie_chart',
    name: 'Pie Chart',
    icon: PieChart,
    description: 'Display proportions',
    category: 'Charts',
    color: 'hsl(var(--primary))'
  },
  {
    type: 'table',
    name: 'Data Table',
    icon: Table,
    description: 'Detailed data in rows and columns',
    category: 'Data',
    color: 'hsl(var(--secondary))'
  },
  {
    type: 'kpi',
    name: 'KPI Card',
    icon: Gauge,
    description: 'Key performance indicator',
    category: 'Metrics',
    color: 'hsl(var(--accent))'
  },
  {
    type: 'trend',
    name: 'Trend Indicator',
    icon: TrendingUp,
    description: 'Show increase/decrease trends',
    category: 'Metrics',
    color: 'hsl(var(--accent))'
  },
  {
    type: 'filter',
    name: 'Filter Control',
    icon: Filter,
    description: 'Interactive data filtering',
    category: 'Controls',
    color: 'hsl(var(--muted-foreground))'
  },
  {
    type: 'text',
    name: 'Text Block',
    icon: Type,
    description: 'Rich text and formatting',
    category: 'Content',
    color: 'hsl(var(--muted-foreground))'
  }
]

const categories = ['Charts', 'Data', 'Metrics', 'Controls', 'Content']

function DraggableComponent({ component, onAdd }: { component: any, onAdd: () => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `palette-${component.type}`,
    data: { type: component.type }
  })

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    opacity: isDragging ? 0.5 : 1
  } : undefined

  const Icon = component.icon

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className="cursor-grab active:cursor-grabbing"
      onClick={onAdd}
    >
      <Card className="p-3 hover:bg-accent/50 transition-colors border-dashed border-2 border-border hover:border-primary/30">
        <div className="flex items-start gap-3">
          <div 
            className="p-2 rounded-lg flex-shrink-0"
            style={{ backgroundColor: `${component.color}20`, color: component.color }}
          >
            <Icon className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm text-foreground truncate">
              {component.name}
            </h4>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {component.description}
            </p>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

export function ComponentPalette({ onAddComponent }: ComponentPaletteProps) {
  return (
    <div className="p-4 space-y-6">
      {categories.map(category => {
        const categoryComponents = componentTypes.filter(c => c.category === category)
        
        return (
          <div key={category}>
            <div className="flex items-center gap-2 mb-3">
              <h4 className="text-sm font-medium text-foreground">{category}</h4>
              <Badge variant="secondary" className="text-xs">
                {categoryComponents.length}
              </Badge>
            </div>
            
            <div className="space-y-2">
              {categoryComponents.map(component => (
                <DraggableComponent
                  key={component.type}
                  component={component}
                  onAdd={() => onAddComponent(component.type)}
                />
              ))}
            </div>
          </div>
        )
      })}
      
      <div className="pt-4 border-t border-border">
        <p className="text-xs text-muted-foreground">
          💡 <strong>Tip:</strong> Drag components to the canvas or click to add them. Ask Sarah for smart suggestions!
        </p>
      </div>
    </div>
  )
}