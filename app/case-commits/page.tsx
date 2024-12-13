import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label';

export default function CaseCommitsPage() {
  return (
    <div className="flex-1">
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold mb-5">Case Commits</h1>
        <Card>
          <CardHeader>
            <CardTitle>Add New Case Commit</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="caseId">Case ID</Label>
                <Input id="caseId" placeholder="Enter case ID" />
              </div>
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="commitTitle">Commit Title</Label>
                <Input id="commitTitle" placeholder="Enter commit title" />
              </div>
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="commitDescription">Commit Description</Label>
                <Textarea id="commitDescription" placeholder="Enter commit description" />
              </div>
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="snapshot">Snapshot</Label>
                <Textarea id="snapshot" placeholder="Enter case snapshot" />
              </div>
              <Button type="submit">Add Case Commit</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

