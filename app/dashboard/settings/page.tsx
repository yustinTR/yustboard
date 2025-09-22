'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/molecules/card'
import { Button } from '@/components/atoms/button'
import { Switch } from '@/components/atoms/switch'
import { Label } from '@/components/atoms/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/molecules/tabs'
import { Badge } from '@/components/atoms/badge'
import { FiMenu, FiShield, FiSave, FiRefreshCw, FiCalendar, FiSettings, FiLayout, FiGrid, FiUser, FiMail } from 'react-icons/fi'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { toast } from 'sonner'

interface Widget {
  id: string
  name: string
  description: string
  enabled: boolean
  position: number
}

interface MenuItem {
  id: string
  label: string
  path: string
  icon: string
  enabled: boolean
  position: number
}

interface UserData {
  id: string
  email: string
  name: string | null
  image: string | null
  role: string
  createdAt: string
}

// Currently not used
// const availableWidgets: Omit<Widget, 'enabled' | 'position'>[] = [
  // { id: 'timeline', name: 'Timeline', description: 'Sociale tijdlijn met posts' },
  // { id: 'tasks', name: 'Taken', description: 'Google FiCalendar evenementen' },
  // { id: 'banking', name: 'Banking', description: 'Financiële transacties' },
  // { id: 'gmail', name: 'Gmail', description: 'Recente emails' },
  // { id: 'files', name: 'Bestanden', description: 'Google Drive bestanden' },
  // { id: 'weather', name: 'Weer', description: 'Weersvoorspelling' },
  // { id: 'social', name: 'Sociaal', description: 'Social media feeds' },
  // { id: 'news', name: 'Nieuws', description: 'Laatste nieuws' },
  // { id: 'fitness', name: 'Fitness', description: 'Google Fit data' }
// ]

const defaultMenuItems: MenuItem[] = [
  { id: 'dashboard', label: 'Dashboard', path: '/dashboard', icon: 'Home', enabled: true, position: 0 },
  { id: 'timeline', label: 'Timeline', path: '/dashboard/timeline', icon: 'MessageSquare', enabled: true, position: 1 },
  { id: 'mail', label: 'Mail', path: '/dashboard/mail', icon: 'Mail', enabled: true, position: 2 },
  { id: 'agenda', label: 'Agenda', path: '/dashboard/agenda', icon: 'FiCalendar', enabled: true, position: 3 },
  { id: 'banking', label: 'Banking', path: '/dashboard/banking', icon: 'DollarSign', enabled: true, position: 4 },
  { id: 'news', label: 'Nieuws', path: '/dashboard/news', icon: 'Globe', enabled: true, position: 5 },
  { id: 'social', label: 'Social', path: '/dashboard/social', icon: 'Users', enabled: true, position: 6 },
  { id: 'weather', label: 'Weather', path: '/dashboard/weather', icon: 'Cloud', enabled: true, position: 7 },
  { id: 'settings', label: 'Instellingen', path: '/dashboard/settings', icon: 'Settings', enabled: true, position: 8 }
]

export default function SettingsPage() {
  const { data: session } = useSession()
  const [widgets, setWidgets] = useState<Widget[]>([])
  const [menuItems, setMenuItems] = useState<MenuItem[]>(defaultMenuItems)
  const [users, setUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [updatingUser, setUpdatingUser] = useState<string | null>(null)
  const isAdmin = session?.user?.role === 'ADMIN'

  const fetchSettings = useCallback(async () => {
    if (!session) return
    
    try {
      // Fetch user widget preferences
      const widgetRes = await fetch('/api/settings/widgets')
      if (widgetRes.ok) {
        const data = await widgetRes.json()
        setWidgets(data.widgets)
      }

      // Fetch global menu settings (if admin)
      if (isAdmin) {
        const menuRes = await fetch('/api/settings/menu')
        if (menuRes.ok) {
          const data = await menuRes.json()
          setMenuItems(data.menuItems)
        }
        
        // Fetch users list
        const usersRes = await fetch('/api/admin/users')
        if (usersRes.ok) {
          const data = await usersRes.json()
          setUsers(data.users)
        }
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
      toast.error('Fout bij het laden van instellingen')
    } finally {
      setLoading(false)
    }
  }, [session, isAdmin])

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  const handleWidgetToggle = (widgetId: string) => {
    setWidgets(prev => 
      prev.map(w => w.id === widgetId ? { ...w, enabled: !w.enabled } : w)
    )
  }

  const handleMenuToggle = (menuId: string) => {
    setMenuItems(prev => 
      prev.map(m => m.id === menuId ? { ...m, enabled: !m.enabled } : m)
    )
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleWidgetDragEnd = (result: any) => {
    if (!result.destination) return

    const items = Array.from(widgets)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    const updatedItems = items.map((item, index) => ({
      ...item,
      position: index
    }))

    setWidgets(updatedItems)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleMenuDragEnd = (result: any) => {
    if (!result.destination) return

    const items = Array.from(menuItems)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    const updatedItems = items.map((item, index) => ({
      ...item,
      position: index
    }))

    setMenuItems(updatedItems)
  }

  const updateUserRole = async (userId: string, newRole: string) => {
    setUpdatingUser(userId)
    
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole })
      })

      if (!response.ok) throw new Error('Failed to update user role')

      const data = await response.json()
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u))
      
      const roleText = newRole === 'ADMIN' ? 'admin' : newRole === 'AUTHOR' ? 'redacteur' : 'gebruiker'
      toast.success(`Gebruiker ${data.user.email} is nu ${roleText}`)
    } catch (error) {
      console.error('Error updating user role:', error)
      toast.error('Fout bij het updaten van gebruikersrol')
    } finally {
      setUpdatingUser(null)
    }
  }

  const saveSettings = async () => {
    setSaving(true)
    
    try {
      // FiSave widget preferences
      const widgetRes = await fetch('/api/settings/widgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ widgets })
      })

      if (!widgetRes.ok) throw new Error('Failed to save widget settings')

      // FiSave menu settings (if admin)
      if (isAdmin) {
        const menuRes = await fetch('/api/settings/menu', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ menuItems })
        })

        if (!menuRes.ok) throw new Error('Failed to save menu settings')
      }

      toast.success('Instellingen opgeslagen!')
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('Fout bij het opslaan van instellingen')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <FiRefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-7xl">
      <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FiSettings className="h-8 w-8" />
            Instellingen
          </h1>
          <p className="text-muted-foreground mt-2">
            Configureer je dashboard widgets en menu items
          </p>
        </div>
        {isAdmin && (
          <Badge variant="default" className="flex items-center gap-1">
            <FiShield className="h-3 w-3" />
            Admin
          </Badge>
        )}
      </div>

      <Tabs defaultValue="widgets" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="widgets" className="flex items-center gap-2">
            <FiLayout className="h-4 w-4" />
            Widgets
          </TabsTrigger>
          <TabsTrigger value="menu" disabled={!isAdmin} className="flex items-center gap-2">
            <FiMenu className="h-4 w-4" />
            FiMenu {!isAdmin && <Badge variant="secondary" className="ml-2">Admin</Badge>}
          </TabsTrigger>
          <TabsTrigger value="roles" disabled={!isAdmin} className="flex items-center gap-2">
            <FiShield className="h-4 w-4" />
            Rollen {!isAdmin && <Badge variant="secondary" className="ml-2">Admin</Badge>}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="widgets" className="space-y-4">
          <Card className="backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border-white/20 dark:border-gray-700/30 shadow-xl shadow-black/5">
            <CardHeader>
              <CardTitle>Dashboard Widgets</CardTitle>
              <CardDescription>
                Kies welke widgets je wilt zien op je dashboard en in welke volgorde
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DragDropContext onDragEnd={handleWidgetDragEnd}>
                <Droppable droppableId="widgets">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                      {widgets.map((widget, index) => (
                        <Draggable key={widget.id} draggableId={widget.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`flex items-center justify-between p-3 rounded-lg border border-white/20 dark:border-gray-700/30 backdrop-blur-sm ${
                                snapshot.isDragging ? 'bg-white/20 dark:bg-gray-800/20 shadow-lg' : 'bg-white/10 dark:bg-gray-900/10 hover:bg-white/20 dark:hover:bg-gray-800/20'
                              } transition-all duration-200`}
                            >
                              <div className="flex items-center gap-3">
                                <div {...provided.dragHandleProps}>
                                  <FiGrid className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <div>
                                  <Label htmlFor={`widget-${widget.id}`} className="font-medium">
                                    {widget.name}
                                  </Label>
                                  <p className="text-sm text-muted-foreground">{widget.description}</p>
                                </div>
                              </div>
                              <Switch
                                id={`widget-${widget.id}`}
                                checked={widget.enabled}
                                onCheckedChange={() => handleWidgetToggle(widget.id)}
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="menu" className="space-y-4">
          <Card className="backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border-white/20 dark:border-gray-700/30 shadow-xl shadow-black/5">
            <CardHeader>
              <CardTitle>FiMenu Items</CardTitle>
              <CardDescription>
                Beheer welke items zichtbaar zijn in het menu voor alle gebruikers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DragDropContext onDragEnd={handleMenuDragEnd}>
                <Droppable droppableId="menu">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                      {menuItems.map((item, index) => (
                        <Draggable key={item.id} draggableId={item.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`flex items-center justify-between p-3 rounded-lg border border-white/20 dark:border-gray-700/30 backdrop-blur-sm ${
                                snapshot.isDragging ? 'bg-white/20 dark:bg-gray-800/20 shadow-lg' : 'bg-white/10 dark:bg-gray-900/10 hover:bg-white/20 dark:hover:bg-gray-800/20'
                              } transition-all duration-200`}
                            >
                              <div className="flex items-center gap-3">
                                <div {...provided.dragHandleProps}>
                                  <FiGrid className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <div>
                                  <Label htmlFor={`menu-${item.id}`} className="font-medium">
                                    {item.label}
                                  </Label>
                                  <p className="text-sm text-muted-foreground">{item.path}</p>
                                </div>
                              </div>
                              <Switch
                                id={`menu-${item.id}`}
                                checked={item.enabled}
                                onCheckedChange={() => handleMenuToggle(item.id)}
                                disabled={item.id === 'dashboard'} // Dashboard moet altijd enabled zijn
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="space-y-4">
          <Card className="backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border-white/20 dark:border-gray-700/30 shadow-xl shadow-black/5">
            <CardHeader>
              <CardTitle>Gebruikers & Rollen</CardTitle>
              <CardDescription>
                Beheer gebruikersrollen en toegangsrechten
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border border-white/20 dark:border-gray-700/30 backdrop-blur-sm bg-white/10 dark:bg-gray-900/10 hover:bg-white/20 dark:hover:bg-gray-800/20 transition-all duration-200 rounded-lg">
                    <div className="flex items-center gap-4">
                      {user.image ? (
                        <Image
                          src={user.image}
                          alt={user.name || user.email}
                          width={40}
                          height={40}
                          className="h-10 w-10 rounded-full object-cover"
                          unoptimized={true}
                          onError={() => {
                            // Image will be hidden on error and fallback will show
                          }}
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                          <FiUser className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                      
                      <div>
                        <div className="font-medium">{user.name || 'Geen naam'}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                          <FiMail className="h-3 w-3" />
                          {user.email}
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                          <FiCalendar className="h-3 w-3" />
                          Lid sinds {new Date(user.createdAt).toLocaleDateString('nl-NL', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Badge variant={user.role === 'ADMIN' ? 'default' : user.role === 'AUTHOR' ? 'outline' : 'secondary'}>
                        {user.role === 'ADMIN' ? 'Admin' : user.role === 'AUTHOR' ? 'Redacteur' : 'Gebruiker'}
                      </Badge>
                      
                      {user.id !== session?.user?.id && (
                        <div className="flex gap-2">
                          <select
                            value={user.role}
                            onChange={(e) => updateUserRole(user.id, e.target.value)}
                            disabled={updatingUser === user.id}
                            className="px-3 py-1 text-sm border border-gray-300 rounded-md bg-white dark:bg-gray-800 dark:border-gray-600"
                          >
                            <option value="USER">Gebruiker</option>
                            <option value="AUTHOR">Redacteur</option>
                            <option value="ADMIN">Admin</option>
                          </select>
                          {updatingUser === user.id && (
                            <FiRefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {users.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    Geen gebruikers gevonden
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button
          onClick={saveSettings}
          disabled={saving}
          className="flex items-center gap-2"
        >
          {saving ? (
            <FiRefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <FiSave className="h-4 w-4" />
          )}
          Opslaan
        </Button>
      </div>
      </div>
    </div>
  )
}