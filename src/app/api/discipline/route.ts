import { NextResponse } from "next/server";
import  prisma from "@/src/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const month = searchParams.get("month");

  if (!month || !/^\d{4}-\d{2}$/.test(month)) {
    return NextResponse.json(
      { error: "Invalid month" },
      { status: 400 }
    );
  }

  const start = new Date(`${month}-01T00:00:00.000Z`);

  if (Number.isNaN(start.getTime()) ||
      start.toISOString().slice(0, 7) !== month) {
    return NextResponse.json(
      { error: "Invalid month" },
      { status: 400 }
    );
  }

  const end = new Date(Date.UTC(
    start.getUTCFullYear(),
    start.getUTCMonth() + 1,
    1
  ));

  const plans = await prisma.dailyPlan.findMany({
    where: {
      date: {
        gte: start,
        lt: end,
      },
    },
    select: {
      date: true,
      completed: true,
      tasks: {
        select: { completed: true },
      },
    },
  });

  return NextResponse.json(plans);
}