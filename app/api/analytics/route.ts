import { NextResponse } from 'next/server';
import { getSystemMetrics } from '@/lib/utils/metrics';

export async function GET() {
  const metrics = getSystemMetrics();
  return NextResponse.json(metrics);
}
