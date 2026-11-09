import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";

type Context = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(
  request: Request,
  context: Context
) {
  try {
    const { id } = await context.params;
    const accountId = Number(id);

    if (!Number.isInteger(accountId)) {
      return NextResponse.json(
        { error: "Invalid account ID" },
        { status: 400 }
      );
    }

    const body = await request.json();

    const name = body.name?.trim();
    const type = body.type?.trim();
    const openingBalance = Number(body.openingBalance);

    if (!name || !type) {
      return NextResponse.json(
        { error: "Name and account type are required" },
        { status: 400 }
      );
    }

    if (Number.isNaN(openingBalance)) {
      return NextResponse.json(
        { error: "Invalid opening balance" },
        { status: 400 }
      );
    }

    const account = await prisma.account.update({
      where: {
        id: accountId,
      },
      data: {
        name,
        type,
        openingBalance,
      },
    });

    return NextResponse.json(account);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to update account" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  context: Context
) {
  try {
    const { id } = await context.params;
    const accountId = Number(id);

    if (!Number.isInteger(accountId)) {
      return NextResponse.json(
        { error: "Invalid account ID" },
        { status: 400 }
      );
    }

    await prisma.account.update({
      where: {
        id: accountId,
      },
      data: {
        active: false,
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to delete account" },
      { status: 500 }
    );
  }
}