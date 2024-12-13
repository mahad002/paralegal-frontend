'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Switch } from '@/components/ui/switch'
import { Upload, LayoutList, LayoutGrid } from 'lucide-react'
import { useToast } from "@/components/ui/use-toast"

interface AnalysisResult {
  citations: string[];
  facts: string[];
  statutes: {
    acts: string[];
    sections: string[];
    articles: string[];
  };
  precedents: string[];
  ratio: string[];
  rulings: string[];
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://paralegal-backend.onrender.com';
const BOT_URL = process.env.NEXT_PUBLIC_BOT_URL || 'https://case-note-cretaion-bot.onrender.com';

export default function CaseNotesPage() {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [rawResponse, setRawResponse] = useState<string | null>(null) // Store raw response
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isTextView, setIsTextView] = useState(false) // Toggle between views
  const { toast } = useToast()

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      console.log("No file selected")
      return
    }

    setIsAnalyzing(true)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const uploadResponse = await fetch(`${API_URL}/api/s3/upload`, {
        method: "POST",
        body: formData,
      })

      if (!uploadResponse.ok) throw new Error("Failed to upload file to S3")

      const { links } = await uploadResponse.json()
      const s3Link = links[0]

      const token = localStorage.getItem("token")
      const processResponse = await fetch(`${BOT_URL}/process-judgment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ s3_link: s3Link }),
      })

      if (!processResponse.ok) throw new Error("Failed to process judgment")

      const response = await processResponse.json()

      // Extract processed_data for analysisResult
      const result: AnalysisResult = response.processed_data
      setAnalysisResult(result)

      // Store the full raw response for debugging or display
      setRawResponse(JSON.stringify(response, null, 2))

      toast({
        title: "Analysis complete",
        description: "The case note has been successfully analyzed",
      })
    } catch (error) {
      console.error("Error uploading or analyzing case note:", error)
      toast({
        title: "Operation failed",
        description: "An error occurred during upload or analysis",
        variant: "destructive",
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const renderSection = (title: string, items: string[] | undefined) => (
    <section>
      <h2 className="text-2xl font-bold mb-2">{title}</h2>
      {items && items.length > 0 ? (
        <ul className="list-disc pl-6">
          {items.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      ) : (
        <p>No {title.toLowerCase()} found.</p>
      )}
    </section>
  )

  const renderTextView = () => {
    if (!analysisResult) return null

    return (
      <ScrollArea className="h-[calc(100vh-200px)]">
        <div className="space-y-6">
          {renderSection("Citations", analysisResult.citations)}
          {renderSection("Facts", analysisResult.facts)}
          <section>
            <h2 className="text-2xl font-bold mb-2">Statutes</h2>
            <div className="space-y-4">
              {renderSection("Acts", analysisResult.statutes?.acts)}
              {renderSection("Sections", analysisResult.statutes?.sections)}
              {renderSection("Articles", analysisResult.statutes?.articles)}
            </div>
          </section>
          {renderSection("Precedents", analysisResult.precedents)}
          {renderSection("Ratio", analysisResult.ratio)}
          {renderSection("Rulings", analysisResult.rulings)}
        </div>
      </ScrollArea>
    )
  }

  const renderTabbedView = () => {
    if (!analysisResult) return null

    return (
      <Tabs defaultValue="citations">
        <TabsList className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 mb-4">
          {['Citations', 'Facts', 'Statutes', 'Precedents', 'Ratio', 'Rulings', 'Raw Response'].map((tab) => (
            <TabsTrigger key={tab} value={tab.toLowerCase()}>{tab}</TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="citations">{renderSection("Citations", analysisResult.citations)}</TabsContent>
        <TabsContent value="facts">{renderSection("Facts", analysisResult.facts)}</TabsContent>
        <TabsContent value="statutes">
          <div className="space-y-4">
            {renderSection("Acts", analysisResult.statutes?.acts)}
            {renderSection("Sections", analysisResult.statutes?.sections)}
            {renderSection("Articles", analysisResult.statutes?.articles)}
          </div>
        </TabsContent>
        <TabsContent value="precedents">{renderSection("Precedents", analysisResult.precedents)}</TabsContent>
        <TabsContent value="ratio">{renderSection("Ratio", analysisResult.ratio)}</TabsContent>
        <TabsContent value="rulings">{renderSection("Rulings", analysisResult.rulings)}</TabsContent>
        <TabsContent value="raw response">
          <ScrollArea className="h-[300px]">
            <pre className="bg-gray-100 p-4 rounded">{rawResponse}</pre>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    )
  }

  return (
    <div className="flex h-screen flex-col">
      <main className="flex-1 p-4 md:p-6 overflow-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <span>Case Notes Analysis</span>
              <div className="flex items-center space-x-2">
                <LayoutGrid className={`h-4 w-4 ${!isTextView ? 'text-primary' : 'text-muted-foreground'}`} />
                <Switch
                  id="view-mode"
                  checked={isTextView}
                  onCheckedChange={setIsTextView}
                />
                <LayoutList className={`h-4 w-4 ${isTextView ? 'text-primary' : 'text-muted-foreground'}`} />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Input type="file" onChange={handleFileUpload} className="hidden" id="file-upload" />
            <label htmlFor="file-upload">
              <Button asChild>
                <span>
                  <Upload className="mr-2" />
                  {isAnalyzing ? "Analyzing..." : "Upload Case File"}
                </span>
              </Button>
            </label>
            {analysisResult && (
              <div className="mt-6">
                {isTextView ? renderTextView() : renderTabbedView()}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
