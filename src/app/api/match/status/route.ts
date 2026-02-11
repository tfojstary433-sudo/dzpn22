import { NextRequest, NextResponse } from 'next/server';
import { getLiveMatch } from '@/lib/firebase';

export async function GET() {
  try {
    const matchData = await getLiveMatch();
    return NextResponse.json(matchData || { active: false });
  } catch (error) {
    console.error('Error fetching match status:', error);
    return NextResponse.json({ active: false }, { status: 500 });
  }
}
