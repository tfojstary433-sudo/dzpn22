export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ uuid: string }> }
) {
  try {
    const { uuid } = await params;
    const response = await fetch(
      `https://2cc8fdff-58f5-4de4-ba18-23c3c389e63d-00-10zd3s5b89sgn.janeway.replit.dev/api/matches/${uuid}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        next: { revalidate: 0 }
      }
    );

    if (!response.ok) {
      return Response.json(
        { error: `API returned status ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    console.error('Error fetching match details:', error);
    return Response.json(
      { error: 'Failed to fetch match details' },
      { status: 500 }
    );
  }
}
