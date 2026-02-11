import { NextRequest, NextResponse } from 'next/server';
import { updateLiveMatch, getLiveMatch } from '@/lib/firebase';

export async function POST(request: NextRequest) {
  try {
    const currentMatch = await getLiveMatch();
    
    if (currentMatch) {
        await updateLiveMatch({
            ...currentMatch,
            active: false
        });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error ending match:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
