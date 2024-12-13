import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

export default function ChatHistoryPage() {
  return (
    <div className="flex-1">
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold mb-5">Chat History</h1>
        <Card>
          <CardHeader>
            <CardTitle>Add New Chat</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="botType">Bot Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select bot type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Assistance">Assistance</SelectItem>
                    <SelectItem value="Compliance">Compliance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" placeholder="Enter chat message" />
              </div>
              <Button type="submit">Add Chat</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

