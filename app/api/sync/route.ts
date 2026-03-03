import { runSync } from '@/lib/sync/runSync';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Fire and forget (non-blocking background execution)
    runSync().catch((err) => {
        console.error("Background sync failed:", err);
    });

    return NextResponse.json(
      { success: true, accepted: true },
      { status: 202 }
    );
  } catch (error) {
    console.error("Failed to trigger sync route:", error);
    return NextResponse.json(
      { success: false },
      { status: 500 }
    );
  }
}
