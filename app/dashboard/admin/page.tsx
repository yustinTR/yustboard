'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Shield, RefreshCw, User, Mail, Calendar } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { nl } from 'date-fns/locale'

interface User {
  id: string
  email: string
  name: string | null
  image: string | null
  role: string
  createdAt: string
}

export default function AdminPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    if (session?.user?.role !== 'ADMIN') {
      router.push('/dashboard')
      return
    }
    fetchUsers()
  }, [session, router])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users')
      if (!response.ok) throw new Error('Failed to fetch users')
      
      const data = await response.json()
      setUsers(data.users)
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('Fout bij het laden van gebruikers')
    } finally {
      setLoading(false)
    }
  }

  const updateUserRole = async (userId: string, newRole: string) => {
    setUpdating(userId)
    
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
      setUpdating(null)
    }
  }

  if (session?.user?.role !== 'ADMIN') {
    return null
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-7xl">
      <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8" />
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Beheer gebruikers en hun rollen
          </p>
        </div>
        <Button onClick={fetchUsers} variant="outline" className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Vernieuwen
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gebruikers</CardTitle>
          <CardDescription>
            Totaal: {users.length} gebruikers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  {user.image ? (
                    <img 
                      src={user.image} 
                      alt={user.name || user.email} 
                      className="h-10 w-10 rounded-full"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                      <User className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                  
                  <div>
                    <div className="font-medium">{user.name || 'Geen naam'}</div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <Mail className="h-3 w-3" />
                      {user.email}
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                      <Calendar className="h-3 w-3" />
                      Lid sinds {format(new Date(user.createdAt), 'dd MMMM yyyy', { locale: nl })}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Badge variant={user.role === 'ADMIN' ? 'default' : user.role === 'AUTHOR' ? 'outline' : 'secondary'}>
                    {user.role === 'ADMIN' ? 'Admin' : user.role === 'AUTHOR' ? 'Redacteur' : 'Gebruiker'}
                  </Badge>
                  
                  {user.id !== session.user.id && (
                    <div className="flex gap-2">
                      {user.role !== 'ADMIN' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateUserRole(user.id, 'ADMIN')}
                          disabled={updating === user.id}
                        >
                          {updating === user.id ? (
                            <RefreshCw className="h-3 w-3 animate-spin" />
                          ) : (
                            'Maak admin'
                          )}
                        </Button>
                      )}
                      
                      {user.role !== 'AUTHOR' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateUserRole(user.id, 'AUTHOR')}
                          disabled={updating === user.id}
                        >
                          {updating === user.id ? (
                            <RefreshCw className="h-3 w-3 animate-spin" />
                          ) : (
                            'Maak redacteur'
                          )}
                        </Button>
                      )}
                      
                      {user.role !== 'USER' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateUserRole(user.id, 'USER')}
                          disabled={updating === user.id}
                        >
                          {updating === user.id ? (
                            <RefreshCw className="h-3 w-3 animate-spin" />
                          ) : (
                            'Maak gebruiker'
                          )}
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  )
}