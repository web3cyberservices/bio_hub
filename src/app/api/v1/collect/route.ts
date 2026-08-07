
import { NextResponse } from 'next/server';

/**
 * @fileOverview Имитация gRPC Ingress шлюза для маскировки трафика.
 * Возвращает типичные ошибки авторизации промышленного API.
 */

export async function POST(request: Request) {
  // Имитируем задержку проверки сертификата/токена
  await new Promise(r => setTimeout(r, 150));

  return NextResponse.json(
    { 
      code: 16, // Unauthenticated в gRPC
      message: "Security handshake failed: Invalid Bearer token or expired session.",
      details: [
        {
          "@type": "type.googleapis.com/google.rpc.ErrorInfo",
          "reason": "AUTH_CREDENTIALS_INVALID",
          "domain": "api.web3cyberservices.xyz",
          "metadata": {
            "service": "telemetry-ingestion-v1",
            "method": "StreamCollect"
          }
        }
      ]
    }, 
    { status: 401 }
  );
}

export async function GET() {
  return new Response('gRPC service requires POST with application/grpc', { status: 405 });
}
