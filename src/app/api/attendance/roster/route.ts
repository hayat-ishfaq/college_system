import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { AttendanceService } from "@/services/attendance.service";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = req.nextUrl;
  const sectionId = searchParams.get("sectionId");
  const date = searchParams.get("date");

  if (!sectionId || !date) {
    return NextResponse.json(
      { error: "sectionId and date are required" },
      { status: 400 }
    );
  }

  try {
    const roster = await AttendanceService.getDailyRoster(sectionId, date);
    return NextResponse.json(roster);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to load roster" },
      { status: 500 }
    );
  }
}
