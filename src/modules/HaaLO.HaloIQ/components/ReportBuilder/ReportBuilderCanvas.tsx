import { useState, useCallback, useRef } from 'react'
import { DndContext, DragEndEvent, DragOverlay } from '@dnd-kit/core'
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Save, Eye, Share2, Undo, Redo, Filter, Settings } from 'lucide-react'
import { ReportComponent } from './ReportComponent'
import { ComponentPalette } from './ComponentPalette'
import { AIAssistant } from './AIAssistant'
import { SmartFilters } from './SmartFilters'
import { ReportPreview } from './ReportPreview'
import { useReportBuilder } from '../../hooks/useReportBuilder'

interface ReportBuilderCanvasProps {
  reportId?: string
  onSave?: (reportData: any) => void
  onPreview?: () => void
  onShare?: () => void
}

export function ReportBuilderCanvas({ 
  reportId, 
  onSave, 
  onPreview, 
  onShare 
}: ReportBuilderCanvasProps) {
  const {
    components,
    addComponent,
    updateComponent,
    removeComponent,
    moveComponent,
    canUndo,
    canRedo,
    undo,
    redo,
    saveReport,
    isLoading
  } = useReportBuilder(reportId)

  const [activeTab, setActiveTab] = useState('builder')
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null)
  const [showAIAssistant, setShowAIAssistant] = useState(false)
  const [draggedComponent, setDraggedComponent] = useState<any>(null)
  const [filters, setFilters] = useState<any[]>([])
  const canvasRef = useRef<HTMLDivElement>(null)

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event
    
    if (!over) return

    // Handle component reordering within canvas
    if (over.id === 'canvas' || over.id.toString().startsWith('component-')) {
      const activeComponent = components.find(c => c.id === active.id)
      if (activeComponent) {
        // Calculate new position based on drop coordinates
        const canvasRect = canvasRef.current?.getBoundingClientRect()
        if (canvasRect && event.delta) {
          const newX = Math.max(0, activeComponent.position_x + Math.round(event.delta.x / 20))
          const newY = Math.max(0, activeComponent.position_y + Math.round(event.delta.y / 20))
          
          moveComponent(activeComponent.id, newX, newY)
        }
      }
    }
    
    setDraggedComponent(null)
  }, [components, moveComponent])

  const handleAddComponent = useCallback((type: string) => {
    const newComponent = {
      component_type: type,
      position_x: Math.floor(Math.random() * 8),
      position_y: Math.floor(Math.random() * 8),
      width: type === 'kpi' ? 2 : 4,
      height: type === 'text' ? 1 : 3,
      component_config: getDefaultConfig(type)
    }
    
    addComponent(newComponent)
  }, [addComponent])

  const handleSave = useCallback(async () => {
    try {
      await saveReport()
      onSave?.(components)
    } catch (error) {
      console.error('Failed to save report:', error)
    }
  }, [saveReport, onSave, components])

  const handleAIAction = useCallback((action: any) => {
    switch (action.type) {
      case 'add_chart':
        handleAddComponent('chart')
        break
      case 'add_filter':
        handleAddComponent('filter')
        break
      case 'add_table':
        handleAddComponent('table')
        break
      case 'add_kpi':
        handleAddComponent('kpi')
        break
      default:
        console.log('Unknown AI action:', action)
    }
  }, [handleAddComponent])

  return (
    <div className="flex h-full bg-background relative">
      {/* Left Sidebar - Component Palette */}
      <div className="w-80 border-r border-border bg-card flex-shrink-0" data-tour="component-palette">
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold text-foreground">Components</h3>
        </div>
        <div className="flex-1 overflow-y-auto">
          <ComponentPalette onAddComponent={handleAddComponent} />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-border bg-card">
            <TabsList data-tour="builder-tabs">
              <TabsTrigger value="builder">Builder</TabsTrigger>
              <TabsTrigger value="filters" data-tour="filters-tab">Smart Filters</TabsTrigger>
              <TabsTrigger value="preview" data-tour="preview-tab">Preview</TabsTrigger>
            </TabsList>
            
            <div className="flex items-center gap-2" data-tour="toolbar-actions">
              <Button
                variant="ghost"
                size="sm"
                onClick={undo}
                disabled={!canUndo}
              >
                <Undo className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={redo}
                disabled={!canRedo}
              >
                <Redo className="h-4 w-4" />
              </Button>
              
              <div className="h-4 w-px bg-border mx-2" />
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAIAssistant(!showAIAssistant)}
                data-tour="ai-assistant-button"
              >
                <span className="text-xs">🤖 Sarah</span>
              </Button>
              <Button variant="ghost" size="sm" onClick={onPreview}>
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
              <Button variant="ghost" size="sm" onClick={onShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button size="sm" onClick={handleSave} disabled={isLoading} data-tour="save-button">
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
            </div>
          </div>

          {/* Builder Tab */}
          <TabsContent value="builder" className="flex-1 m-0 relative">
            <DndContext onDragEnd={handleDragEnd}>
              <div 
                ref={canvasRef}
                className="absolute inset-0 overflow-auto p-6 bg-muted/20"
                data-tour="canvas-area"
                style={{
                  backgroundImage: `
                    radial-gradient(circle at 1px 1px, hsl(var(--border)) 1px, transparent 0)
                  `,
                  backgroundSize: '20px 20px'
                }}
              >
                <SortableContext items={components.map(c => c.id)} strategy={rectSortingStrategy}>
                  <AnimatePresence>
                    {components.map((component) => (
                      <motion.div
                        key={component.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        style={{
                          position: 'absolute',
                          left: component.position_x * 20,
                          top: component.position_y * 20,
                          width: component.width * 100,
                          height: component.height * 80,
                          zIndex: selectedComponent === component.id ? 10 : 1
                        }}
                        onClick={() => setSelectedComponent(component.id)}
                      >
                        <ReportComponent
                          component={component}
                          isSelected={selectedComponent === component.id}
                          onUpdate={(updates) => updateComponent(component.id, updates)}
                          onRemove={() => removeComponent(component.id)}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </SortableContext>

                {/* Empty State */}
                {components.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center" data-tour="empty-state">
                    <Card className="p-8 text-center max-w-md mx-4">
                      <h3 className="text-lg font-semibold mb-2">Start Building Your Report</h3>
                      <p className="text-muted-foreground mb-4">
                        Drag components from the left panel or ask Sarah, your AI assistant, to help you get started.
                      </p>
                      <Button onClick={() => setShowAIAssistant(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Ask Sarah
                      </Button>
                    </Card>
                  </div>
                )}
              </div>

              <DragOverlay>
                {draggedComponent && (
                  <div className="bg-card border border-border rounded-lg p-4 shadow-lg">
                    {draggedComponent.component_type}
                  </div>
                )}
              </DragOverlay>
            </DndContext>
          </TabsContent>

          {/* Smart Filters Tab */}
          <TabsContent value="filters" className="flex-1 m-0 p-6 overflow-auto">
            <SmartFilters
              filters={filters}
              onFiltersChange={setFilters}
              onAddFilter={() => {
                const newFilter = {
                  id: `filter-${Date.now()}`,
                  type: 'text' as const,
                  label: 'New Filter',
                  placeholder: 'Enter filter value'
                }
                setFilters([...filters, newFilter])
              }}
            />
          </TabsContent>

          {/* Preview Tab */}
          <TabsContent value="preview" className="flex-1 m-0 p-6 overflow-auto">
            <ReportPreview
              components={components}
              isPreviewMode={true}
              isLiveData={false}
              onTogglePreview={() => setActiveTab('builder')}
              onExport={(format) => console.log('Export:', format)}
              onShare={onShare}
              onRefreshData={() => Promise.resolve()}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* AI Assistant Sidebar */}
      <AnimatePresence>
        {showAIAssistant && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 400, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="border-l border-border bg-card overflow-hidden"
          >
            <AIAssistant
              onAction={handleAIAction}
              context={{
                reportId,
                currentComponents: components,
                selectedComponent: selectedComponent
              }}
              onClose={() => setShowAIAssistant(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function getDefaultConfig(type: string) {
  switch (type) {
    case 'chart':
      return {
        chartType: 'bar',
        title: 'New Chart',
        dataSource: null,
        xAxis: null,
        yAxis: null
      }
    case 'table':
      return {
        title: 'New Table',
        dataSource: null,
        columns: [],
        pagination: true
      }
    case 'kpi':
      return {
        title: 'KPI',
        value: 0,
        format: 'number',
        trend: null
      }
    case 'filter':
      return {
        title: 'Filter',
        filterType: 'dropdown',
        options: []
      }
    case 'text':
      return {
        content: 'Add your text here...',
        fontSize: 'medium',
        alignment: 'left'
      }
    default:
      return {}
  }
}