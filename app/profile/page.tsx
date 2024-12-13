import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'

export default function ProfilePage() {
  return (
    <div className="flex-1">
      <main className="p-6 lg:p-8">
        <h1 className="text-3xl font-bold mb-6">Your Profile</h1>
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your personal details here.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="name">Full Name</Label>
                <Input type="text" id="name" defaultValue="John Doe" />
              </div>
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="email">Email</Label>
                <Input type="email" id="email" defaultValue="john.doe@example.com" />
              </div>
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="role">Role</Label>
                <Input type="text" id="role" defaultValue="Senior Case Manager" readOnly />
              </div>
            </form>
          </CardContent>
          <CardFooter>
            <Button>Save Changes</Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  )
}

