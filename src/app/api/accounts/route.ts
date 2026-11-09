import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";

export async function GET() {
  try {
    const accounts = await prisma.account.findMany({
      where: {
        active: true,
      },
      orderBy: {
        id: "asc",
      },
      include: {
        transactions: true,
      },
    });

    const accountsWithBalance = accounts.map((account) => {
      let balance = account.openingBalance;

      for (const transaction of account.transactions) {
        if (
          transaction.type === "INCOME"
        ) {
          balance += transaction.amount;
        }

        if (
          transaction.type === "EXPENSE"
        ) {
          balance -= transaction.amount;
        }

        if (
          transaction.type === "RECEIVABLE"
        ) {
          balance -= transaction.amount;
        }

        // PAYABLE does not change account balance
        // until the actual payment is made.
      }

      return {
        id: account.id,
        name: account.name,
        type: account.type,
        openingBalance: account.openingBalance,
        currentBalance: balance,
        active: account.active,
      };
    });

    return NextResponse.json(accountsWithBalance);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Failed to fetch accounts",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(
  request: Request
) {
  try {
    const body = await request.json();

    const name = body.name?.trim();
    const type = body.type?.trim();
    const openingBalance = Number(
      body.openingBalance ?? 0
    );

    if (!name || !type) {
      return NextResponse.json(
        {
          error:
            "Name and account type are required",
        },
        {
          status: 400,
        }
      );
    }

    if (
      Number.isNaN(openingBalance) ||
      openingBalance < 0
    ) {
      return NextResponse.json(
        {
          error:
            "Opening balance must be a valid number",
        },
        {
          status: 400,
        }
      );
    }

    const account =
      await prisma.account.create({
        data: {
          name,
          type,
          openingBalance,
        },
      });

    return NextResponse.json(
      {
        ...account,
        currentBalance:
          account.openingBalance,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Failed to create account",
      },
      {
        status: 500,
      }
    );
  }
}