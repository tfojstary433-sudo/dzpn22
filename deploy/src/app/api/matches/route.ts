export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const response = await fetch(
      'https://88602c77-02c7-4b06-8b56-454baca5488c-00-38bejx2g3vlpx.picard.replit.dev/api/matches',
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      return Response.json(
        { error: `API returned status ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    // Ensure we always return an array to the frontend
    return Response.json(Array.isArray(data) ? data : []);
  } catch (error) {
    console.error('Error fetching matches:', error);
    return Response.json(
      { error: 'Failed to fetch matches' },
      { status: 500 }
    );
  }
}
