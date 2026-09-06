
export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';

/**
 * API Proxy Route.
 * Проксирует запросы от фронтенда (HTTPS) к воркеру (HTTP) через параметр endpoint.
 */
const WORKER_URL = 'http://31.76.34.252:4000';

export async function GET(request: Request) {
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
        'Cache-Control': 'no-store',
        'Pragma': 'no-cache'
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Worker error', status: response.status }, { status: response.status });
    }

    const contentType = response.headers.get('content-type');
    
    // Если это JSON, пытаемся вернуть как JSON для удобства UI
    if (contentType?.includes('application/json')) {
      const data = await response.json();
      return NextResponse.json(data);
    } 
    
    // Для всех остальных типов (включая логи/текст) возвращаем как текст
    const text = await response.text();
    return new NextResponse(text, {
      headers: {
        'Content-Type': contentType || 'text/plain',
        'Cache-Control': 'no-store'
      },
    });
  } catch (error) {
    console.error(`Proxy GET Error:`, error);
    return NextResponse.json({ error: 'Worker unreachable', details: String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
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
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store'
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ error: 'Worker POST error', details: errorText }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error(`Proxy POST Error:`, error);
    return NextResponse.json({ error: 'Worker unreachable', details: String(error) }, { status: 500 });
  }
}
