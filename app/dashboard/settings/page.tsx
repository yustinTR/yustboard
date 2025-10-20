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
import { FiMenu, FiShield, FiSave, FiRefreshCw, FiCalendar, FiSettings, FiLayout, FiGrid, FiUser, FiMail, FiUsers, FiUserPlus, FiTrash2, FiDroplet, FiUpload, FiCamera } from 'react-icons/fi'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { toast } from 'sonner'
import ColorPicker from '@/components/ui/ColorPicker'

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

interface OrganizationData {
  id: string
  name: string
  slug: string
  description: string | null
  plan: string
  createdAt: string
}

interface OrganizationMember {
  id: string
  name: string | null
  email: string
  image: string | null
  organizationRole: string
  createdAt: string
}

interface PendingInvite {
  id: string
  email: string
  role: string
  createdAt: string
  expiresAt: string
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
  const [organization, setOrganization] = useState<OrganizationData | null>(null)
  const [orgMembers, setOrgMembers] = useState<OrganizationMember[]>([])
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([])
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'MEMBER' | 'ADMIN'>('MEMBER')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [updatingUser, setUpdatingUser] = useState<string | null>(null)
  const [sendingInvite, setSendingInvite] = useState(false)
  const [editingOrg, setEditingOrg] = useState(false)
  const [orgName, setOrgName] = useState('')
  const [orgDescription, setOrgDescription] = useState('')
  const [savingOrg, setSavingOrg] = useState(false)

  // Branding state
  const [brandingEnabled, setBrandingEnabled] = useState(false)
  const [logoUrl, setLogoUrl] = useState('')
  const [primaryColor, setPrimaryColor] = useState('#3B82F6')
  const [secondaryColor, setSecondaryColor] = useState('#8B5CF6')
  const [savingBranding, setSavingBranding] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)

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

      // Fetch organization data
      const orgRes = await fetch('/api/organization')
      if (orgRes.ok) {
        const data = await orgRes.json()
        setOrganization(data.organization)
        setOrgName(data.organization?.name || '')
        setOrgDescription(data.organization?.description || '')
        setOrgMembers(data.members || [])
        setPendingInvites(data.invites || [])
      }

      // Fetch organization settings (branding)
      const settingsRes = await fetch('/api/organization/settings')
      if (settingsRes.ok) {
        const data = await settingsRes.json()
        setBrandingEnabled(data.settings?.brandingEnabled || false)
        setLogoUrl(data.settings?.logoUrl || '')
        setPrimaryColor(data.settings?.primaryColor || '#3B82F6')
        setSecondaryColor(data.settings?.secondaryColor || '#8B5CF6')
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

  const sendInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteEmail || !organization) return

    setSendingInvite(true)
    try {
      const response = await fetch('/api/organization/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: inviteEmail,
          role: inviteRole
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to send invite')
      }

      const data = await response.json()
      setPendingInvites(prev => [...prev, data.invite])
      setInviteEmail('')
      toast.success(`Uitnodiging verzonden naar ${inviteEmail}`)
    } catch (error) {
      console.error('Error sending invite:', error)
      toast.error(error instanceof Error ? error.message : 'Fout bij het verzenden van uitnodiging')
    } finally {
      setSendingInvite(false)
    }
  }

  const cancelInvite = async (inviteId: string) => {
    try {
      const response = await fetch(`/api/organization/invite/${inviteId}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to cancel invite')

      setPendingInvites(prev => prev.filter(inv => inv.id !== inviteId))
      toast.success('Uitnodiging ingetrokken')
    } catch (error) {
      console.error('Error canceling invite:', error)
      toast.error('Fout bij het intrekken van uitnodiging')
    }
  }

  const updateMemberRole = async (memberId: string, newRole: string) => {
    setUpdatingUser(memberId)

    try {
      const response = await fetch('/api/organization/members', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId, role: newRole })
      })

      if (!response.ok) throw new Error('Failed to update member role')

      setOrgMembers(prev => prev.map(m => m.id === memberId ? { ...m, organizationRole: newRole } : m))

      const roleText = newRole === 'OWNER' ? 'eigenaar' : newRole === 'ADMIN' ? 'beheerder' : newRole === 'VIEWER' ? 'kijker' : 'lid'
      toast.success(`Gebruikersrol bijgewerkt naar ${roleText}`)
    } catch (error) {
      console.error('Error updating member role:', error)
      toast.error('Fout bij het updaten van gebruikersrol')
    } finally {
      setUpdatingUser(null)
    }
  }

  const removeMember = async (memberId: string) => {
    if (!confirm('Weet je zeker dat je dit teamlid wilt verwijderen?')) return

    try {
      const response = await fetch(`/api/organization/members/${memberId}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to remove member')

      setOrgMembers(prev => prev.filter(m => m.id !== memberId))
      toast.success('Teamlid verwijderd')
    } catch (error) {
      console.error('Error removing member:', error)
      toast.error('Fout bij het verwijderen van teamlid')
    }
  }

  const saveOrganization = async () => {
    if (!orgName.trim()) {
      toast.error('Organisatie naam is verplicht')
      return
    }

    setSavingOrg(true)
    try {
      const response = await fetch('/api/organization', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: orgName,
          description: orgDescription || null
        })
      })

      if (!response.ok) throw new Error('Failed to update organization')

      const data = await response.json()
      setOrganization(data.organization)
      setEditingOrg(false)
      toast.success('Organisatie bijgewerkt')
    } catch (error) {
      console.error('Error updating organization:', error)
      toast.error('Fout bij het bijwerken van organisatie')
    } finally {
      setSavingOrg(false)
    }
  }

  const cancelEditOrg = () => {
    setOrgName(organization?.name || '')
    setOrgDescription(organization?.description || '')
    setEditingOrg(false)
  }

  const saveBranding = async () => {
    setSavingBranding(true)
    try {
      const response = await fetch('/api/organization/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandingEnabled,
          logoUrl,
          primaryColor,
          secondaryColor
        })
      })

      if (!response.ok) throw new Error('Failed to update branding')

      toast.success('Branding instellingen bijgewerkt')

      // Reload page to apply new branding
      if (brandingEnabled) {
        setTimeout(() => window.location.reload(), 1000)
      }
    } catch (error) {
      console.error('Error updating branding:', error)
      toast.error('Fout bij het bijwerken van branding')
    } finally {
      setSavingBranding(false)
    }
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Selecteer een afbeelding')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Logo moet kleiner dan 5MB zijn')
      return
    }

    setUploadingLogo(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'logo')

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) throw new Error('Upload failed')

      const data = await response.json()
      setLogoUrl(data.url)
      toast.success('Logo geüpload')
    } catch (error) {
      console.error('Error uploading logo:', error)
      toast.error('Fout bij uploaden van logo')
    } finally {
      setUploadingLogo(false)
    }
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
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="widgets" className="flex items-center gap-2">
            <FiLayout className="h-4 w-4" />
            Widgets
          </TabsTrigger>
          <TabsTrigger value="organization" className="flex items-center gap-2">
            <FiUsers className="h-4 w-4" />
            Team
          </TabsTrigger>
          <TabsTrigger value="branding" className="flex items-center gap-2">
            <FiDroplet className="h-4 w-4" />
            Branding
          </TabsTrigger>
          <TabsTrigger value="menu" disabled={!isAdmin} className="flex items-center gap-2">
            <FiMenu className="h-4 w-4" />
            Menu {!isAdmin && <Badge variant="secondary" className="ml-2">Admin</Badge>}
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

        <TabsContent value="organization" className="space-y-4">
          {/* Organization Info Card */}
          {organization && (
            <Card className="backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border-white/20 dark:border-gray-700/30 shadow-xl shadow-black/5">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Organisatie Informatie</CardTitle>
                    <CardDescription>
                      {editingOrg ? 'Bewerk je organisatie gegevens' : 'Overzicht van je organisatie'}
                    </CardDescription>
                  </div>
                  {!editingOrg && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingOrg(true)}
                      className="flex items-center gap-2"
                    >
                      <FiSettings className="h-4 w-4" />
                      Bewerken
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {editingOrg ? (
                  <>
                    <div>
                      <Label htmlFor="org-name" className="text-sm font-medium">Naam</Label>
                      <input
                        id="org-name"
                        type="text"
                        value={orgName}
                        onChange={(e) => setOrgName(e.target.value)}
                        className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm"
                        placeholder="Organisatie naam"
                      />
                    </div>
                    <div>
                      <Label htmlFor="org-description" className="text-sm font-medium">Beschrijving (optioneel)</Label>
                      <textarea
                        id="org-description"
                        value={orgDescription}
                        onChange={(e) => setOrgDescription(e.target.value)}
                        rows={3}
                        className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm"
                        placeholder="Een korte beschrijving van je organisatie..."
                      />
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button
                        onClick={saveOrganization}
                        disabled={savingOrg || !orgName.trim()}
                        className="flex items-center gap-2"
                      >
                        {savingOrg ? (
                          <FiRefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <FiSave className="h-4 w-4" />
                        )}
                        Opslaan
                      </Button>
                      <Button
                        variant="outline"
                        onClick={cancelEditOrg}
                        disabled={savingOrg}
                      >
                        Annuleren
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <Label className="text-sm font-medium">Naam</Label>
                      <p className="text-base mt-1">{organization.name}</p>
                    </div>
                    {organization.description && (
                      <div>
                        <Label className="text-sm font-medium">Beschrijving</Label>
                        <p className="text-sm text-muted-foreground mt-1">{organization.description}</p>
                      </div>
                    )}
                    <div>
                      <Label className="text-sm font-medium">Slug</Label>
                      <p className="text-sm text-muted-foreground mt-1">{organization.slug}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Plan</Label>
                      <div className="mt-1">
                        <Badge variant={organization.plan === 'FREE' ? 'secondary' : 'default'}>
                          {organization.plan}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Aangemaakt op</Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        {new Date(organization.createdAt).toLocaleDateString('nl-NL', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* Invite Team Members Card */}
          <Card className="backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border-white/20 dark:border-gray-700/30 shadow-xl shadow-black/5">
            <CardHeader>
              <CardTitle>Teamleden Uitnodigen</CardTitle>
              <CardDescription>
                Nodig nieuwe teamleden uit voor je organisatie
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={sendInvite} className="flex gap-2">
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm"
                  required
                />
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as 'MEMBER' | 'ADMIN')}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm"
                >
                  <option value="MEMBER">Lid</option>
                  <option value="ADMIN">Beheerder</option>
                </select>
                <Button type="submit" disabled={sendingInvite} className="flex items-center gap-2">
                  {sendingInvite ? (
                    <FiRefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <FiUserPlus className="h-4 w-4" />
                  )}
                  Uitnodigen
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Pending Invites */}
          {pendingInvites.length > 0 && (
            <Card className="backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border-white/20 dark:border-gray-700/30 shadow-xl shadow-black/5">
              <CardHeader>
                <CardTitle>Openstaande Uitnodigingen</CardTitle>
                <CardDescription>
                  Uitnodigingen die nog niet geaccepteerd zijn
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {pendingInvites.map((invite) => (
                    <div
                      key={invite.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-white/20 dark:border-gray-700/30 backdrop-blur-sm bg-white/10 dark:bg-gray-900/10"
                    >
                      <div>
                        <p className="font-medium">{invite.email}</p>
                        <p className="text-sm text-muted-foreground">
                          Rol: {invite.role === 'ADMIN' ? 'Beheerder' : 'Lid'}
                        </p>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => cancelInvite(invite.id)}
                        className="flex items-center gap-1"
                      >
                        <FiTrash2 className="h-3 w-3" />
                        Intrekken
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Team Members Card */}
          <Card className="backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border-white/20 dark:border-gray-700/30 shadow-xl shadow-black/5">
            <CardHeader>
              <CardTitle>Teamleden</CardTitle>
              <CardDescription>
                Beheer teamleden en hun rollen
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {orgMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-white/20 dark:border-gray-700/30 backdrop-blur-sm bg-white/10 dark:bg-gray-900/10"
                  >
                    <div className="flex items-center gap-4">
                      {member.image ? (
                        <Image
                          src={member.image}
                          alt={member.name || member.email}
                          width={40}
                          height={40}
                          className="h-10 w-10 rounded-full object-cover"
                          unoptimized={true}
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                          <FiUser className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}

                      <div>
                        <div className="font-medium">{member.name || 'Geen naam'}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                          <FiMail className="h-3 w-3" />
                          {member.email}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Badge
                        variant={
                          member.organizationRole === 'OWNER'
                            ? 'default'
                            : member.organizationRole === 'ADMIN'
                            ? 'default'
                            : 'secondary'
                        }
                      >
                        {member.organizationRole === 'OWNER'
                          ? 'Eigenaar'
                          : member.organizationRole === 'ADMIN'
                          ? 'Beheerder'
                          : member.organizationRole === 'VIEWER'
                          ? 'Kijker'
                          : 'Lid'}
                      </Badge>

                      {member.id !== session?.user?.id && member.organizationRole !== 'OWNER' && (
                        <div className="flex gap-2">
                          <select
                            value={member.organizationRole}
                            onChange={(e) => updateMemberRole(member.id, e.target.value)}
                            disabled={updatingUser === member.id}
                            className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                          >
                            <option value="VIEWER">Kijker</option>
                            <option value="MEMBER">Lid</option>
                            <option value="ADMIN">Beheerder</option>
                          </select>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeMember(member.id)}
                            disabled={updatingUser === member.id}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <FiTrash2 className="h-4 w-4" />
                          </Button>
                          {updatingUser === member.id && (
                            <FiRefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {orgMembers.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    Geen teamleden gevonden
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="branding" className="space-y-4">
          <Card className="backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border-white/20 dark:border-gray-700/30 shadow-xl shadow-black/5">
            <CardHeader>
              <CardTitle>Organisatie Branding</CardTitle>
              <CardDescription>
                Pas het uiterlijk van je organisatie aan met een eigen logo en kleuren
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Enable Branding Toggle */}
              <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white/50 dark:bg-gray-800/50">
                <div className="space-y-0.5">
                  <Label htmlFor="branding-enabled" className="text-base font-medium">
                    Custom Branding Inschakelen
                  </Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Gebruik je eigen logo en kleuren in de hele applicatie
                  </p>
                </div>
                <Switch
                  id="branding-enabled"
                  checked={brandingEnabled}
                  onCheckedChange={setBrandingEnabled}
                />
              </div>

              {/* Logo Upload */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Organisatie Logo</Label>
                <div className="flex gap-4 items-start">
                  {/* Logo Preview */}
                  <div className="relative w-32 h-32 rounded-lg border-2 border-white/20 dark:border-gray-700/30 shadow-lg overflow-hidden bg-white dark:bg-gray-800">
                    {logoUrl ? (
                      <Image
                        src={logoUrl}
                        alt="Organization logo"
                        width={128}
                        height={128}
                        className="w-full h-full object-contain p-2"
                        unoptimized={true}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <FiCamera className="h-12 w-12" />
                      </div>
                    )}
                  </div>

                  {/* Upload Controls */}
                  <div className="flex-1 space-y-3">
                    <input
                      type="file"
                      id="logo-upload"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      onClick={() => document.getElementById('logo-upload')?.click()}
                      disabled={uploadingLogo}
                      className="w-full"
                    >
                      {uploadingLogo ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                          Uploaden...
                        </>
                      ) : (
                        <>
                          <FiUpload className="h-4 w-4 mr-2" />
                          Logo Uploaden
                        </>
                      )}
                    </Button>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Aanbevolen: Vierkant formaat, PNG of SVG, max 5MB
                    </p>
                    {logoUrl && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setLogoUrl('')}
                        className="w-full"
                      >
                        <FiTrash2 className="h-4 w-4 mr-2" />
                        Logo Verwijderen
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Color Pickers */}
              <div className="space-y-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <ColorPicker
                  label="Primaire Kleur"
                  value={primaryColor}
                  onChange={setPrimaryColor}
                  defaultColor="#3B82F6"
                />

                <ColorPicker
                  label="Secundaire Kleur"
                  value={secondaryColor}
                  onChange={setSecondaryColor}
                  defaultColor="#8B5CF6"
                />
              </div>

              {/* Preview Section */}
              <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Label className="text-base font-medium">Voorbeeld</Label>
                <div className="p-6 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
                  <div className="space-y-4">
                    {/* Preview Header */}
                    <div
                      className="p-4 rounded-lg text-white shadow-lg"
                      style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)` }}
                    >
                      <div className="flex items-center gap-3">
                        {logoUrl && (
                          <div className="w-10 h-10 bg-white rounded-lg p-1">
                            <Image
                              src={logoUrl}
                              alt="Logo preview"
                              width={40}
                              height={40}
                              className="w-full h-full object-contain"
                              unoptimized={true}
                            />
                          </div>
                        )}
                        <div>
                          <div className="font-semibold">{organization?.name || 'Organisatie'}</div>
                          <div className="text-sm opacity-90">Dashboard Header</div>
                        </div>
                      </div>
                    </div>

                    {/* Preview Button */}
                    <div className="flex gap-3">
                      <button
                        type="button"
                        className="px-4 py-2 rounded-lg text-white font-medium shadow-md transition-transform hover:scale-105"
                        style={{ backgroundColor: primaryColor }}
                      >
                        Primaire Actie
                      </button>
                      <button
                        type="button"
                        className="px-4 py-2 rounded-lg text-white font-medium shadow-md transition-transform hover:scale-105"
                        style={{ backgroundColor: secondaryColor }}
                      >
                        Secundaire Actie
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  onClick={saveBranding}
                  disabled={savingBranding}
                  className="flex-1"
                >
                  {savingBranding ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                      Opslaan...
                    </>
                  ) : (
                    <>
                      <FiSave className="h-4 w-4 mr-2" />
                      Branding Opslaan
                    </>
                  )}
                </Button>
              </div>
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