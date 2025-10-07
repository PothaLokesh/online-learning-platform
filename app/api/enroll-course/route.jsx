import { enrollCourseTable } from "@/config/schema";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/config/db";
import {desc, and, eq } from "drizzle-orm";
import { coursesTable } from "@/config/schema";


export async function POST(req) {
  const { courseId } = await req.json();
  const user = await currentUser();
  const userEmail = user?.primaryEmailAddress?.emailAddress;

  if (!userEmail || !courseId) {
    return NextResponse.json({ error: "Missing user or course ID" }, { status: 400 });
  }

  const enrollCourses = await db
    .select()
    .from(enrollCourseTable)
    .where(and(eq(enrollCourseTable.userEmail, userEmail), eq(enrollCourseTable.cid, courseId)));

  if (enrollCourses.length === 0) {
    const result = await db
      .insert(enrollCourseTable)
      .values({ cid: courseId, userEmail })
      .returning();

    return NextResponse.json(result);
  }

  return NextResponse.json({ resp: "Course already enrolled" });
}

export async function GET(req) {
    const user=await currentUser();
    const {searchParams}=new URL(req.url);
    const courseId=searchParams.get('courseId')
    if(courseId){
      const result=await db.select().from(coursesTable)
      .innerJoin(enrollCourseTable,eq(coursesTable.cid,enrollCourseTable.cid))
      .where(and(eq(enrollCourseTable.userEmail,user?.primaryEmailAddress?.emailAddress),eq(coursesTable.cid,courseId)))
      .orderBy(desc(coursesTable.id));
      return NextResponse.json(result[0] ?? { error: "Course not found" }, { status: result[0] ? 200 : 404 });
    }
    else{
    const result=await db.select().from(coursesTable)
    .innerJoin(enrollCourseTable,eq(coursesTable.cid,enrollCourseTable.cid))
    .where(eq(enrollCourseTable.userEmail,user?.primaryEmailAddress?.emailAddress))
    .orderBy(desc(coursesTable.id));
    return NextResponse.json(result);
    }

}

export async function PUT(req){
  const {completedChapter,courseId}=await req.json();
  const user=await currentUser();

  const result = await db
  .update(enrollCourseTable) // fix table name spelling
  .set({ completedChapters: completedChapter }) // move .set after .update(table)
  .where(
    and(
      eq(enrollCourseTable.cid, courseId),
      eq(enrollCourseTable.userEmail, user?.primaryEmailAddress?.emailAddress)
    )
  )
  .returning(); // no need to pass table again

return NextResponse.json(result);
}