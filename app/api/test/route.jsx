import { db } from "@/config/db";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        // Check if DATABASE_URL is set
        if (!process.env.DATABASE_URL) {
            return NextResponse.json(
                { error: "DATABASE_URL environment variable is not set" },
                { status: 500 }
            );
        }

        // Test database connection
        const result = await db.execute("SELECT 1 as test");
        
        return NextResponse.json({
            message: "Database connection successful",
            test: result
        });
    } catch (error) {
        console.error("Database connection test failed:", error);
        return NextResponse.json(
            { 
                error: "Database connection failed", 
                details: error.message 
            },
            { status: 500 }
        );
    }
}

