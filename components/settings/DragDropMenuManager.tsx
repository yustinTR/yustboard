'use client'

import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { Switch } from '@/components/atoms/switch'
import { Label } from '@/components/atoms/label'
import { FiMenu } from 'react-icons/fi'

interface MenuItem {
  id: string
  label: string
  path: string
  icon: string
  enabled: boolean
  position: number
}

interface DragDropMenuManagerProps {
  menuItems: MenuItem[]
  onDragEnd: (result: any) => void // eslint-disable-line @typescript-eslint/no-explicit-any
  onToggle: (menuId: string) => void
}

export function DragDropMenuManager({ menuItems, onDragEnd, onToggle }: DragDropMenuManagerProps) {
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="menu-items">
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="space-y-2"
          >
            {menuItems.map((item, index) => (
              <Draggable key={item.id} draggableId={item.id} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`
                      flex items-center justify-between p-4 rounded-lg border
                      ${snapshot.isDragging
                        ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-300 dark:border-indigo-600 shadow-lg'
                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                      }
                      transition-all duration-200
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <FiMenu className="text-gray-400 cursor-grab active:cursor-grabbing" />
                      <div>
                        <Label className="font-medium">{item.label}</Label>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{item.path}</p>
                      </div>
                    </div>
                    <Switch
                      checked={item.enabled}
                      onCheckedChange={() => onToggle(item.id)}
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
