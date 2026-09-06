
import { NextRequest, NextResponse } from 'next/server';

/**
 * API Proxy Route.
 * Проксирует запросы от фронтенда (HTTPS) к воркеру (HTTP),
 * предотвращая ошибки Mixed Content и CORS.
 */
const WORKER_URL = 'http://31.76.34.252:4000';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get('endpoint');

  if (!endpoint) {
    return NextResponse.json({ error: 'Missing endpoint parameter' }, { status: 400 });
  }

  try {
    const targetUrl = `${WORKER_URL}${endpoint}`;
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store'
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Worker error' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error(`Proxy GET Error:`, error);
    return NextResponse.json({ error: 'Worker unreachable' }, { status: 502 });
  }
}

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get('endpoint');

  if (!endpoint) {
    return NextResponse.json({ error: 'Missing endpoint parameter' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const targetUrl = `${WORKER_URL}${endpoint}`;
    
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      cache: 'no-store',
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error(`Proxy POST Error:`, error);
    return NextResponse.json({ error: 'Worker unreachable' }, { status: 502 });
  }
}
