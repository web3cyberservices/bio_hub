export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';

/**
 * API Proxy Route.
 * Проксирует запросы от фронтенда (HTTPS) к воркеру (HTTP) через параметр endpoint.
 * Улучшен для корректной передачи различных типов контента (JSON, Text, NDJSON).
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
        'Pragma': 'no-cache',
        'Accept': 'application/json, text/plain, */*'
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Worker error', status: response.status }, { status: response.status });
    }

    const contentType = response.headers.get('content-type') || 'text/plain';
    const text = await response.text();
    
    // Возвращаем данные с сохранением исходного типа контента
    return new NextResponse(text, {
      headers: {
        'Content-Type': contentType,
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
