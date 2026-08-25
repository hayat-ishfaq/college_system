import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { ResultService } from "@/services/result.service";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = req.nextUrl;
  const examScheduleId = searchParams.get("examScheduleId");

  if (!examScheduleId) {
    return NextResponse.json(
      { error: "examScheduleId parameter is required" },
      { status: 400 }
    );
  }

  try {
    const data = await ResultService.getScheduleMarksRoster(examScheduleId);
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to load marks roster" },
      { status: 500 }
    );
  }
}
