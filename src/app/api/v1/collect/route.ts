
import { NextResponse } from 'next/server';

/**
 * @fileOverview Эндпоинт приема телеметрии.
 * В промышленной эксплуатации этот эндпоинт может перехватываться Nginx (gRPC pass-through).
 * Данная реализация служит заглушкой для корректной обработки неавторизованных HTTP-запросов.
 */

export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json(
      { error: 'AUTH_FAILED', message: 'Missing or malformed Bearer token.' },
      { status: 401 }
    );
  }

  // В этой реализации предполагается, что gRPC трафик идет через отдельный порт/прокси.
  return new Response('API available via gRPC tunnel only', { status: 405 });
}

export async function GET() {
  return new Response('Method Not Allowed', { status: 405 });
}
