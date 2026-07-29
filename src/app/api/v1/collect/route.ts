
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get('content-type');
    const authHeader = req.headers.get('authorization');

    if (!contentType || !contentType.includes('application/grpc')) {
      return NextResponse.json(
        { 
          status: 'error', 
          code: 415, 
          message: 'Unsupported Media Type. Expected application/grpc.' 
        }, 
        { status: 415 }
      );
    }

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { 
          status: 'error', 
          code: 401, 
          message: 'Invalid or missing Ingestion API Key.' 
        }, 
        { status: 401 }
      );
    }

    return new NextResponse(null, {
      status: 200,
      headers: {
        'grpc-status': '0',
        'grpc-message': 'OK',
        'x-cyberlog-request-id': Math.random().toString(36).substring(7),
        'x-cyberlog-processed-ms': (Math.random() * 0.8).toFixed(2),
        'content-type': 'application/grpc'
      },
    });

  } catch (error) {
    return NextResponse.json(
      { 
        status: 'error', 
        code: 500, 
        message: 'Internal ingestion pipeline failure.' 
      }, 
      { status: 500 }
    );
  }
}

export async function GET() { return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 }); }
