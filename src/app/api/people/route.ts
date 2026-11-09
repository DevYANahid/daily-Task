import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";

export async function GET() {
  try {
    const people = await prisma.person.findMany({
      where: { active: true },
      orderBy: { id: "desc" },
      include: {
        debts: {
          include: {
            payments: true,
          },
        },
      },
    });

    const peopleWithBalance = people.map((person) => {
      let receivable = 0;
      let payable = 0;

      for (const debt of person.debts) {
        const paid = debt.payments.reduce(
          (total, payment) => total + payment.amount,
          0
        );

        const remaining = Math.max(debt.amount - paid, 0);

        if (debt.type === "RECEIVABLE") {
          receivable += remaining;
        }

        if (debt.type === "PAYABLE") {
          payable += remaining;
        }
      }

      return {
        id: person.id,
        name: person.name,
        phone: person.phone,
        note: person.note,
        active: person.active,
        receivable,
        payable,
        balance: receivable - payable,
      };
    });

    return NextResponse.json(peopleWithBalance);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to fetch people" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const name = body.name?.trim();
    const phone = body.phone?.trim() || null;
    const note = body.note?.trim() || null;

    if (!name) {
      return NextResponse.json(
        { error: "Person name is required" },
        { status: 400 }
      );
    }

    const person = await prisma.person.create({
      data: {
        name,
        phone,
        note,
      },
    });

    return NextResponse.json(person, { status: 201 });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to create person" },
      { status: 500 }
    );
  }
}