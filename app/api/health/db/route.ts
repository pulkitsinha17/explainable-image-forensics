import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { connectToDatabase, PIXENTRA_DB_NAME } from "@/lib/mongodb";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const connection = await connectToDatabase();
    const db = connection.connection.db;

    if (!db) {
      return NextResponse.json(
        { success: false, error: "Database unavailable" },
        { status: 503 }
      );
    }

    await db.command({ ping: 1 });

    if (db.databaseName !== PIXENTRA_DB_NAME) {
      return NextResponse.json(
        { success: false, error: "Unexpected database" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      database: PIXENTRA_DB_NAME,
    }, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Database unavailable" },
      { status: 503 }
    );
  }
}
