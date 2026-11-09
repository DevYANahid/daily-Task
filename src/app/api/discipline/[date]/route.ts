import { NextResponse } from "next/server";
import  prisma  from "@/src/lib/prisma";

const defaultTasks = [
  {
    slug: "english",
    title: "English Speaking",
    description: "Practice speaking English for 3 minutes. Choose any topic.",
    targetMinutes: 3,
  },
  {
    slug: "linux-aws",
    title: "Linux & AWS Learning",
    description: "Study Linux, AWS, networking and DevOps.",
    targetMinutes: null,
  },
  {
    slug: "softvivo",
    title: "SoftVivo Development",
    description: "Work on SoftVivo projects, clients and business growth.",
    targetMinutes: 180,
  },
];

function parseDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;

  const date = new Date(`${value}T00:00:00.000Z`);

  return date.toISOString().slice(0, 10) === value ? date : null;
}

async function getOrCreatePlan(date: Date) {
  return prisma.dailyPlan.upsert({
    where: { date },
    update: {},
    create: {
      date,
      tasks: {
        create: defaultTasks,
      },
    },
    include: {
      tasks: true,
    },
  });
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ date: string }> }
) {
  try {
    const { date: dateString } = await params;
    const date = parseDate(dateString);

    if (!date) {
      return NextResponse.json(
        { error: "Invalid date" },
        { status: 400 }
      );
    }

    const plan = await getOrCreatePlan(date);

    return NextResponse.json(plan);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Unable to load daily plan" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ date: string }> }
) {
  try {
    const { date: dateString } = await params;
    const date = parseDate(dateString);

    if (!date) {
      return NextResponse.json(
        { error: "Invalid date" },
        { status: 400 }
      );
    }

    const body = await request.json();

    if (
      !["english", "linux-aws", "softvivo"].includes(body.slug) ||
      typeof body.completed !== "boolean"
    ) {
      return NextResponse.json(
        { error: "Invalid task update" },
        { status: 400 }
      );
    }

    const plan = await getOrCreatePlan(date);

    const task = await prisma.dailyTask.update({
      where: {
        dailyPlanId_slug: {
          dailyPlanId: plan.id,
          slug: body.slug,
        },
      },
      data: {
        completed: body.completed,
        completedAt: body.completed ? new Date() : null,
      },
    });

    const tasks = await prisma.dailyTask.findMany({
      where: { dailyPlanId: plan.id },
    });

    const allCompleted =
      tasks.length === 3 && tasks.every((task) => task.completed);

    const updatedPlan = await prisma.dailyPlan.update({
      where: { id: plan.id },
      data: { completed: allCompleted },
      include: { tasks: true },
    });

    return NextResponse.json(updatedPlan);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Unable to update task" },
      { status: 500 }
    );
  }
}