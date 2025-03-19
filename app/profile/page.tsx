'use client';

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/components/ui/use-toast'
import * as UserAPI from '@/lib/api/User'
import { User } from '@/types'

export default function ProfilePage() {
  const { user, checkAuth } = useAuth()
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: ''
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role
      })
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setIsLoading(true)
    try {
      const response = await UserAPI.updateUser(user._id, {
        name: formData.name,
        email: formData.email
      })

      if ('error' in response) {
        throw new Error(response.error)
      }

      await checkAuth() // Refresh user data
      setIsEditing(false)
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully.'
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <div className="flex-1">
      <main className="p-6 lg:p-8">
        <h1 className="text-3xl font-bold mb-6 text-white">Your Profile</h1>
        <Card className="max-w-2xl bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Personal Information</CardTitle>
            <CardDescription className="text-gray-400">Update your personal details here.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="name" className="text-gray-300">Full Name</Label>
                <Input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={!isEditing}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="email" className="text-gray-300">Email</Label>
                <Input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={!isEditing}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="role" className="text-gray-300">Role</Label>
                <Input
                  type="text"
                  id="role"
                  value={formData.role.replace('_', ' ').charAt(0).toUpperCase() + formData.role.slice(1)}
                  readOnly
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <div className="flex justify-end space-x-4 mt-6">
                {isEditing ? (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false)
                        setFormData({
                          name: user.name,
                          email: user.email,
                          role: user.role
                        })
                      }}
                      className="border-gray-700 text-gray-300 hover:bg-gray-800"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
                    >
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </>
                ) : (
                  <Button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
                  >
                    Edit Profile
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}