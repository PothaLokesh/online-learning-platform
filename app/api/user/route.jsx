import { db } from "@/config/db";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { usersTable } from "@/config/schema";
export async function POST(req) {
    try {
        const { email, name } = await req.json();

        // Check if email is provided
        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }

        const users = await db.select().from(usersTable).where(eq(usersTable.email, email));

        if (users?.length == 0) {
            const result = await db.insert(usersTable).values({
                name: name,
                email: email
            }).returning(usersTable);
            console.log(result);
            return NextResponse.json(result)
        }
        return NextResponse.json(users[0])
    } catch (error) {
        console.error("Error in user API:", error);
        return NextResponse.json({ error: "Invalid request body or server error" }, { status: 500 });
    }
}