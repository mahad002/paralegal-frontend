'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'

export default function ComplianceBotPage() {
  const [query, setQuery] = useState('')
  const [response, setResponse] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically send the query to your backend
    setResponse('This is a mock response from the Compliance Bot. In a real application, this would be the result of processing your query.')
  }

  return (
    <div className="flex-1">
      <main className="p-6 lg:p-8">
        <h1 className="text-3xl font-bold mb-6">Compliance Bot</h1>
        <Card>
          <CardHeader>
            <CardTitle>Ask a Compliance Question</CardTitle>
            <CardDescription>Our AI-powered bot will assist you with compliance-related queries.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <Textarea
                placeholder="Type your compliance question here..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="mb-4"
              />
              <Button type="submit">Submit Query</Button>
            </form>
          </CardContent>
          {response && (
            <CardFooter>
              <div>
                <h3 className="font-semibold mb-2">Bot Response:</h3>
                <p>{response}</p>
              </div>
            </CardFooter>
          )}
        </Card>
      </main>
    </div>
  )
}

