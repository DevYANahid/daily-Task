import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";

const DEBT_TYPES = ["RECEIVABLE", "PAYABLE"];

export async function GET() {
  try {
    const debts = await prisma.debt.findMany({
      orderBy: { date: "desc" },
      include: {
        person: true,
        payments: {
          include: {
            account: true,
          },
          orderBy: {
            date: "desc",
          },
        },
      },
    });

    const debtsWithBalance = debts.map((debt) => {
      const paid = debt.payments.reduce(
        (total, payment) => total + payment.amount,
        0
      );

      const remaining = Math.max(debt.amount - paid, 0);

      return {
        id: debt.id,
        type: debt.type,
        amount: debt.amount,
        paid,
        remaining,
        description: debt.description,
        date: debt.date,
        status: remaining === 0
          ? "PAID"
          : paid > 0
            ? "PARTIAL"
            : "OPEN",
        person: debt.person,
        payments: debt.payments,
      };
    });

    return NextResponse.json(debtsWithBalance);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to fetch debts" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const type = body.type?.trim();
    const amount = Number(body.amount);
    const description = body.description?.trim() || null;
    const personId = Number(body.personId);

    if (!DEBT_TYPES.includes(type)) {
      return NextResponse.json(
        { error: "Invalid debt type" },
        { status: 400 }
      );
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        { error: "Amount must be greater than zero" },
        { status: 400 }
      );
    }

    if (!Number.isInteger(personId)) {
      return NextResponse.json(
        { error: "Valid person is required" },
        { status: 400 }
      );
    }

    const person = await prisma.person.findFirst({
      where: {
        id: personId,
        active: true,
      },
    });

    if (!person) {
      return NextResponse.json(
        { error: "Person not found" },
        { status: 404 }
      );
    }

    const debt = await prisma.debt.create({
      data: {
        type,
        amount,
        description,
        personId,
      },
      include: {
        person: true,
      },
    });

    return NextResponse.json(
      {
        ...debt,
        paid: 0,
        remaining: debt.amount,
        status: "OPEN",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to create debt" },
      { status: 500 }
    );
  }
}