import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";

export async function GET() {
  try {
    const transactions = await prisma.transaction.findMany({
      orderBy: {
        date: "desc",
      },
      include: {
        account: true,
        category: true,
        person: true,
      },
    });

    return NextResponse.json(transactions);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to fetch transactions" },
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
    const accountId = Number(body.accountId);
    const categoryId = body.categoryId
      ? Number(body.categoryId)
      : null;
    const personId = body.personId
      ? Number(body.personId)
      : null;

    if (!type) {
      return NextResponse.json(
        { error: "Transaction type is required" },
        { status: 400 }
      );
    }

    if (!["INCOME", "EXPENSE", "RECEIVABLE", "PAYABLE"].includes(type)) {
      return NextResponse.json(
        { error: "Invalid transaction type" },
        { status: 400 }
      );
    }

    if (!amount || amount <= 0 || Number.isNaN(amount)) {
      return NextResponse.json(
        { error: "Amount must be greater than zero" },
        { status: 400 }
      );
    }

    if (!Number.isInteger(accountId)) {
      return NextResponse.json(
        { error: "Valid account is required" },
        { status: 400 }
      );
    }

    const transaction = await prisma.transaction.create({
      data: {
        type,
        amount,
        description,
        accountId,
        categoryId,
        personId,
      },
      include: {
        account: true,
        category: true,
        person: true,
      },
    });

    return NextResponse.json(transaction, {
      status: 201,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to create transaction" },
      { status: 500 }
    );
  }
}