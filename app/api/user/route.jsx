import { db } from "@/config/db";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { usersTable } from "@/config/schema";
export async function POST(req){

    const {email,name} =await req.json();

    const users=await db.select().from(usersTable).where(eq(usersTable.email,email));

    if(users?.length==0){
        const result =await db.insert(usersTable).values({
            name:name,
            email:email
        }).returning(usersTable);
        console.log(result);
        return NextResponse.json(result)
    }
    return NextResponse.json(users[0])
}