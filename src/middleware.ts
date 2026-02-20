import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Lista zablokowanych user-agentów (często używane przez boty/skanery)
const BLOCKED_USER_AGENTS = [
  'sqlmap',
  'nikto',
  'dirbuster',
  'nmap',
  'python-requests',
  'curl',
  'libwww-perl',
  'wget'
];

// Prosty in-memory rate limiting (uwaga: w środowisku serverless jak Vercel, pamięć jest resetowana)
// Dla pełnej ochrony zalecane jest użycie Upstash Redis
const ipCache = new Map<string, { count: number; lastReset: number }>();
const LIMIT = 1000; // Zwiększony limit do 1000 żądań na minutę
const WINDOW = 60 * 1000; // na 1 minutę

export function middleware(request: NextRequest) {
  const userAgent = request.headers.get('user-agent')?.toLowerCase() || '';
  const ip = (request as any).ip || request.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';

  // 1. Ochrona WAF: Blokowanie znanych botów
  if (BLOCKED_USER_AGENTS.some(bot => userAgent.includes(bot))) {
    return new NextResponse('Access Denied (Security Block)', { status: 403 });
  }

  // 2. Ochrona API: Rate Limiting
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const now = Date.now();
    const userData = ipCache.get(ip) || { count: 0, lastReset: now };

    if (now - userData.lastReset > WINDOW) {
      userData.count = 1;
      userData.lastReset = now;
    } else {
      userData.count++;
    }

    ipCache.set(ip, userData);

    if (userData.count > LIMIT) {
      return new NextResponse('Too Many Requests - DDoS Protection Active', { 
        status: 429,
        headers: {
          'Retry-After': '60'
        }
      });
    }
  }

  // 3. Dodanie nagłówków bezpieczeństwa
  const response = NextResponse.next();
  
  // Ochrona przed sniffingiem typów MIME
  response.headers.set('X-Content-Type-Options', 'nosniff');
  // Ochrona XSS dla starszych przeglądarek
  response.headers.set('X-XSS-Protection', '1; mode=block');
  // Referrer Policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  return response;
}

// Konfiguracja tras, które middleware ma obsługiwać
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
