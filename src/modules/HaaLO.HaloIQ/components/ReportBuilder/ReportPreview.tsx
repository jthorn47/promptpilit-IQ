import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Grid3X3, 
  List, 
  Eye, 
  Copy,
  Trash2,
  Settings,
  Download,
  Share2,
  Play,
  Pause,
  RefreshCw
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useToast } from '@/components/ui/use-toast'

interface ReportPreviewProps {
  components: any[]
  isPreviewMode?: boolean
  isLiveData?: boolean
  onTogglePreview?: () => void
  onExport?: (format: string) => void
  onShare?: () => void
  onRefreshData?: () => void
}

export function ReportPreview({ 
  components, 
  isPreviewMode = false,
  isLiveData = false,
  onTogglePreview,
  onExport,
  onShare,
  onRefreshData 
}: ReportPreviewProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { toast } = useToast()

  const handleRefreshData = useCallback(async () => {
    setIsRefreshing(true)
    try {
      await onRefreshData?.()
      toast({
        title: 'Data Refreshed',
        description: 'Report data has been updated with the latest information',
      })
    } catch (error) {
      toast({
        title: 'Refresh Failed',
        description: 'Failed to refresh data. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsRefreshing(false)
    }
  }, [onRefreshData, toast])

  const handleExport = useCallback((format: string) => {
    onExport?.(format)
    toast({
      title: 'Export Started',
      description: `Generating ${format.toUpperCase()} export...`,
    })
  }, [onExport, toast])

  const renderComponentPreview = (component: any, index: number) => {
    const getPreviewContent = () => {
      switch (component.component_type) {
        case 'kpi':
          return (
            <div className="text-center p-6">
              <h3 className="text-2xl font-bold text-primary mb-2">
                {component.component_config.value || '42.5K'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {component.component_config.title || 'KPI Metric'}
              </p>
              {component.component_config.trend && (
                <div className="text-xs text-green-500 mt-1">
                  ↗ +{component.component_config.trend}% from last month
                </div>
              )}
            </div>
          )

        case 'chart':
          return (
            <div className="p-6">
              <h4 className="font-medium mb-4">
                {component.component_config.title || 'Sales Performance'}
              </h4>
              <div className="h-32 bg-gradient-to-r from-primary/20 to-accent/20 rounded flex items-end justify-center space-x-2 px-4">
                {[65, 85, 45, 75, 95, 60, 80].map((height, i) => (
                  <div
                    key={i}
                    className="bg-primary rounded-t w-8 transition-all duration-1000"
                    style={{ height: `${height}%` }}
                  />
                ))}
              </div>
            </div>
          )

        case 'table':
          return (
            <div className="p-6">
              <h4 className="font-medium mb-4">
                {component.component_config.title || 'Data Table'}
              </h4>
              <div className="space-y-2">
                {['Header 1', 'Header 2', 'Header 3'].map(header => (
                  <div key={header} className="text-xs text-muted-foreground font-medium">
                    {header}
                  </div>
                ))}
                {[1, 2, 3].map(row => (
                  <div key={row} className="grid grid-cols-3 gap-2 text-sm">
                    <div className="bg-muted/50 rounded p-1">Data {row}.1</div>
                    <div className="bg-muted/50 rounded p-1">Data {row}.2</div>
                    <div className="bg-muted/50 rounded p-1">Data {row}.3</div>
                  </div>
                ))}
              </div>
            </div>
          )

        case 'text':
          return (
            <div className="p-6">
              <div className="prose prose-sm">
                {component.component_config.content || 
                 'This is a sample text block that demonstrates how rich text content will appear in your final report. You can customize the formatting, alignment, and styling.'}
              </div>
            </div>
          )

        default:
          return (
            <div className="p-6 text-center">
              <div className="text-muted-foreground">
                {component.component_type} Preview
              </div>
            </div>
          )
      }
    }

    return (
      <motion.div
        key={component.id}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: index * 0.1 }}
        className={viewMode === 'grid' ? 'col-span-1' : 'w-full'}
      >
        <Card className="h-full hover:shadow-lg transition-shadow">
          {/* Component Header */}
          <div className="flex items-center justify-between p-3 border-b border-border">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {component.component_type}
              </Badge>
              {isLiveData && (
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-xs text-green-600">Live</span>
                </div>
              )}
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remove
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Component Content */}
          <div className="relative">
            {getPreviewContent()}
            
            {/* Loading Overlay */}
            {isRefreshing && (
              <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                <RefreshCw className="h-6 w-6 animate-spin text-primary" />
              </div>
            )}
          </div>
        </Card>
      </motion.div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Preview Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="text-xl font-semibold text-foreground">
            {isPreviewMode ? 'Report Preview' : 'Report Components'}
          </h3>
          
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Grid View</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>List View</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshData}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onTogglePreview}
          >
            {isPreviewMode ? (
              <>
                <Pause className="h-4 w-4 mr-2" />
                Exit Preview
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Preview
              </>
            )}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleExport('pdf')}>
                Export as PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('excel')}>
                Export as Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('csv')}>
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleExport('html')}>
                Export as HTML
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="outline" size="sm" onClick={onShare}>
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      {/* Components Grid/List */}
      <AnimatePresence mode="wait">
        {components.length > 0 ? (
          <motion.div
            key={viewMode}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'space-y-4'
            }
          >
            {components.map((component, index) => renderComponentPreview(component, index))}
          </motion.div>
        ) : (
          <Card className="p-12 text-center">
            <div className="text-muted-foreground mb-4">
              <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
            </div>
            <h4 className="text-lg font-medium text-foreground mb-2">
              No Components Added
            </h4>
            <p className="text-muted-foreground">
              Add components to your report to see them previewed here
            </p>
          </Card>
        )}
      </AnimatePresence>

      {/* Live Data Status */}
      {isLiveData && components.length > 0 && (
        <Card className="p-4 bg-green-50 border-green-200">
          <div className="flex items-center gap-2 text-green-700">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium">
              Live Data Connection Active
            </span>
            <span className="text-xs text-green-600">
              Data refreshes every 30 seconds
            </span>
          </div>
        </Card>
      )}
    </div>
  )
}