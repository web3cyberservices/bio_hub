// При использовании output: 'export' этот файл не будет включен в сборку.
// Логика обработки переносится в Nginx.
export async function GET() {
  return new Response('API available via gRPC only', { status: 405 });
}
