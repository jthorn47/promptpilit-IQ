import { useState, useCallback, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/components/ui/use-toast'

interface ReportComponent {
  id: string
  report_id: string
  component_type: string
  component_config: any
  position_x: number
  position_y: number
  width: number
  height: number
  sort_order: number
  is_visible: boolean
  created_at?: string
  updated_at?: string
}

interface UndoRedoState {
  components: ReportComponent[]
  timestamp: number
}

export function useReportBuilder(reportId?: string) {
  const [components, setComponents] = useState<ReportComponent[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [history, setHistory] = useState<UndoRedoState[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const { toast } = useToast()

  // Save state to history
  const saveToHistory = useCallback((newComponents: ReportComponent[]) => {
    const newState: UndoRedoState = {
      components: JSON.parse(JSON.stringify(newComponents)),
      timestamp: Date.now()
    }

    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1)
      newHistory.push(newState)
      
      // Keep only last 50 states
      if (newHistory.length > 50) {
        newHistory.shift()
        return newHistory
      }
      
      return newHistory
    })
    
    setHistoryIndex(prev => prev + 1)
  }, [historyIndex])

  // Load components if reportId provided
  useEffect(() => {
    if (reportId) {
      loadComponents()
    }
  }, [reportId])

  const loadComponents = async () => {
    if (!reportId) return

    setIsLoading(true)
    try {
      // For now, just initialize with empty array until types are regenerated
      setComponents([])
      
      toast({
        title: 'Info',
        description: 'Report builder loaded - types will be available after migration',
      })

    } catch (error) {
      console.error('Error loading components:', error)
      toast({
        title: 'Error',
        description: 'Failed to load report components',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const addComponent = useCallback((componentData: Partial<ReportComponent>) => {
    const newComponent: ReportComponent = {
      id: crypto.randomUUID(),
      report_id: reportId || 'temp',
      component_type: componentData.component_type || 'text',
      component_config: componentData.component_config || {},
      position_x: componentData.position_x || 0,
      position_y: componentData.position_y || 0,
      width: componentData.width || 4,
      height: componentData.height || 3,
      sort_order: components.length,
      is_visible: true
    }

    const newComponents = [...components, newComponent]
    setComponents(newComponents)
    saveToHistory(newComponents)

    toast({
      title: 'Component Added',
      description: `Added ${componentData.component_type} to your report`,
    })
  }, [components, reportId, saveToHistory, toast])

  const updateComponent = useCallback((id: string, updates: Partial<ReportComponent>) => {
    const newComponents = components.map(comp => 
      comp.id === id ? { ...comp, ...updates } : comp
    )
    
    setComponents(newComponents)
    saveToHistory(newComponents)
  }, [components, saveToHistory])

  const removeComponent = useCallback((id: string) => {
    const newComponents = components.filter(comp => comp.id !== id)
    setComponents(newComponents)
    saveToHistory(newComponents)

    toast({
      title: 'Component Removed',
      description: 'Component has been deleted from your report',
    })
  }, [components, saveToHistory, toast])

  const moveComponent = useCallback((id: string, newX: number, newY: number) => {
    updateComponent(id, { position_x: newX, position_y: newY })
  }, [updateComponent])

  const duplicateComponent = useCallback((id: string) => {
    const component = components.find(c => c.id === id)
    if (!component) return

    const newComponent = {
      ...component,
      id: crypto.randomUUID(),
      position_x: component.position_x + 1,
      position_y: component.position_y + 1,
      sort_order: components.length
    }

    const newComponents = [...components, newComponent]
    setComponents(newComponents)
    saveToHistory(newComponents)

    toast({
      title: 'Component Duplicated',
      description: 'Component has been copied to your report',
    })
  }, [components, saveToHistory, toast])

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const previousState = history[historyIndex - 1]
      setComponents(previousState.components)
      setHistoryIndex(historyIndex - 1)
    }
  }, [history, historyIndex])

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1]
      setComponents(nextState.components)
      setHistoryIndex(historyIndex + 1)
    }
  }, [history, historyIndex])

  const saveReport = useCallback(async () => {
    if (!reportId || components.length === 0) return

    setIsLoading(true)
    try {
      // For now, just show success - will implement when types are regenerated
      toast({
        title: 'Report Saved',
        description: 'Your report structure has been saved (demo mode)',
      })

    } catch (error) {
      console.error('Error saving report:', error)
      toast({
        title: 'Save Failed',
        description: 'Failed to save your report. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }, [reportId, components, toast])

  return {
    components,
    isLoading,
    addComponent,
    updateComponent,
    removeComponent,
    moveComponent,
    duplicateComponent,
    saveReport,
    undo,
    redo,
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1
  }
}
