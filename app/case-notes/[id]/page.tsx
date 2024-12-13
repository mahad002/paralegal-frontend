// 'use client'

// import { useState, useEffect } from 'react'
// import { useParams } from 'next/navigation'
// import Link from 'next/link'
// import { Button } from '@/components/ui/button'
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

// // ... (rest of the code remains the same as in the previous response)

'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const CaseNotePage = () => {
    const { id } = useParams()
    const [caseNote, setCaseNote] = useState<{ content: string } | null>(null)

    useEffect(() => {
        // Fetch the case note data from an API or database
        const fetchCaseNote = async () => {
            const response = await fetch(`/api/case-notes/${id}`)
            const data = await response.json()
            setCaseNote(data)
        }

        fetchCaseNote()
    }, [id])

    if (!caseNote) {
        return <div>Loading...</div>
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Case Note</CardTitle>
            </CardHeader>
            <CardContent>
                <p>{caseNote.content}</p>
                <Link href="/case-notes">
                    <Button>Back to Case Notes</Button>
                </Link>
            </CardContent>
        </Card>
    )
}

export default CaseNotePage;