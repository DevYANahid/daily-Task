import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";

type Context = {
  params: Promise<{ id: string }>;
};

export async function PATCH(
  request: Request,
  context: Context
) {
  try {
    const { id } = await context.params;
    const personId = Number(id);

    if (!Number.isInteger(personId)) {
      return NextResponse.json(
        { error: "Invalid person ID" },
        { status: 400 }
      );
    }

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

    const person = await prisma.person.update({
      where: { id: personId },
      data: {
        name,
        phone,
        note,
      },
    });

    return NextResponse.json(person);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to update person" },
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
    const personId = Number(id);

    if (!Number.isInteger(personId)) {
      return NextResponse.json(
        { error: "Invalid person ID" },
        { status: 400 }
      );
    }

    await prisma.person.update({
      where: { id: personId },
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
      { error: "Failed to delete person" },
      { status: 500 }
    );
  }
}