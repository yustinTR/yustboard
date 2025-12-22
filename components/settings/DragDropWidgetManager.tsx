'use client'

import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { Switch } from '@/components/atoms/switch'
import { Label } from '@/components/atoms/label'
import { FiGrid, FiSave, FiRefreshCw, FiUsers } from 'react-icons/fi'

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
  canManageOrganization?: boolean
  hasOrgDefaults?: boolean
  onSaveAsTeamDefault?: () => void
  onApplyTeamDefaults?: () => void
  isSavingDefaults?: boolean
  isApplyingDefaults?: boolean
}

export function DragDropWidgetManager({
  widgets,
  onDragEnd,
  onToggle,
  canManageOrganization = false,
  hasOrgDefaults = false,
  onSaveAsTeamDefault,
  onApplyTeamDefaults,
  isSavingDefaults = false,
  isApplyingDefaults = false
}: DragDropWidgetManagerProps) {
  return (
    <div className="space-y-4">
      {/* Team defaults actions */}
      <div className="flex flex-wrap gap-3 items-center">
        {/* Admin: Save as team default */}
        {canManageOrganization && onSaveAsTeamDefault && (
          <button
            onClick={onSaveAsTeamDefault}
            disabled={isSavingDefaults}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiSave className={`h-4 w-4 ${isSavingDefaults ? 'animate-pulse' : ''}`} />
            {isSavingDefaults ? 'Opslaan...' : 'Opslaan als team standaard'}
          </button>
        )}

        {/* All users: Apply team defaults (if available) */}
        {hasOrgDefaults && onApplyTeamDefaults && (
          <button
            onClick={onApplyTeamDefaults}
            disabled={isApplyingDefaults}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white/20 dark:bg-gray-800/20 hover:bg-white/30 dark:hover:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 rounded-lg backdrop-blur-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiRefreshCw className={`h-4 w-4 ${isApplyingDefaults ? 'animate-spin' : ''}`} />
            {isApplyingDefaults ? 'Toepassen...' : 'Reset naar team standaard'}
          </button>
        )}

        {/* Indicator that team defaults exist */}
        {hasOrgDefaults && (
          <span className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            <FiUsers className="h-3.5 w-3.5" />
            Team standaard beschikbaar
          </span>
        )}
      </div>

      {/* Widget list */}
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
    </div>
  )
}
