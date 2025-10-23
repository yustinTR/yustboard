'use client'

import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { Switch } from '@/components/atoms/switch'
import { Label } from '@/components/atoms/label'
import { FiGrid } from 'react-icons/fi'

interface Widget {
  id: string
  name: string
  description: string
  enabled: boolean
  position: number
}

interface DragDropWidgetManagerProps {
  widgets: Widget[]
  onDragEnd: (result: any) => void // eslint-disable-line @typescript-eslint/no-explicit-any
  onToggle: (widgetId: string) => void
}

export function DragDropWidgetManager({ widgets, onDragEnd, onToggle }: DragDropWidgetManagerProps) {
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="widgets">
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="space-y-2"
          >
            {widgets.map((widget, index) => (
              <Draggable key={widget.id} draggableId={widget.id} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className={`
                      flex items-center justify-between p-4 rounded-lg border
                      ${snapshot.isDragging
                        ? 'bg-white/20 dark:bg-gray-800/20 border-white/30 dark:border-gray-600/30 shadow-lg'
                        : 'bg-white/10 dark:bg-gray-900/10 border-white/20 dark:border-gray-700/30 hover:bg-white/20 dark:hover:bg-gray-800/20'
                      }
                      backdrop-blur-sm transition-all duration-200
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <div {...provided.dragHandleProps}>
                        <FiGrid className="h-4 w-4 text-muted-foreground cursor-grab active:cursor-grabbing" />
                      </div>
                      <div>
                        <Label className="font-medium">{widget.name}</Label>
                        <p className="text-sm text-muted-foreground">{widget.description}</p>
                      </div>
                    </div>
                    <Switch
                      checked={widget.enabled}
                      onCheckedChange={() => onToggle(widget.id)}
                    />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  )
}
