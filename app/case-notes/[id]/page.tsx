// import { Card } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';
// import { Edit, Trash } from 'lucide-react';

// export default function CaseNoteDetails({ params }: { params: { id: string } }) {
//   return (
//     <div className="container mx-auto p-6">
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-3xl font-bold">Case Note Details</h1>
//         <div className="space-x-2">
//           <Button variant="outline" size="sm">
//             <Edit className="w-4 h-4 mr-2" />
//             Edit
//           </Button>
//           <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
//             <Trash className="w-4 h-4 mr-2" />
//             Delete
//           </Button>
//         </div>
//       </div>

//       <Card className="mb-6">
//         <div className="p-6">
//           <div className="flex items-center justify-between mb-4">
//             <div>
//               <h2 className="text-2xl font-semibold">Note #{params.id}</h2>
//               <p className="text-gray-600">Created on March 1, 2024</p>
//             </div>
//             <Badge>Case #1234</Badge>
//           </div>
          
//           <div className="prose max-w-none">
//             <p>
//               Detailed case note content will appear here...
//             </p>
//           </div>
//         </div>
//       </Card>

//       <Card>
//         <div className="p-6">
//           <h3 className="text-lg font-semibold mb-4">Compliance Analysis</h3>
//           <div className="space-y-4">
//             <div>
//               <h4 className="font-medium mb-2">Issues Found</h4>
//               <ul className="list-disc list-inside text-gray-600">
//                 <li>No issues found</li>
//               </ul>
//             </div>
//             <div>
//               <h4 className="font-medium mb-2">Recommendations</h4>
//               <ul className="list-disc list-inside text-gray-600">
//                 <li>No recommendations at this time</li>
//               </ul>
//             </div>
//           </div>
//         </div>
//       </Card>
//     </div>
//   );
// }

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