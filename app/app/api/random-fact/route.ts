import { NextRequest, NextResponse } from 'next/server'
import { getRandomQuestions } from '@/lib/strapi-server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const mode = (searchParams.get('mode') as 'normal' | 'expert' | 'first-visit') || 'normal'
    const count = parseInt(searchParams.get('count') || '1', 10)
    
    const questions = await getRandomQuestions(count, mode)
    
    // Filter to only return questions with explanations
    const questionsWithExplanations = questions.filter(q => q.explanation && q.explanation.trim().length > 0)
    
    return NextResponse.json(questionsWithExplanations, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-store, max-age=0'
      }
    })
  } catch (error) {
    console.error('Failed to fetch random fact:', error)
    return NextResponse.json(
      { error: 'Failed to fetch random fact' },
      { status: 500 }
    )
  }
}
