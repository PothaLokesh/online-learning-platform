import { NextResponse } from "next/server";
import { ai } from "../generate-course-layout/route";
import axios from "axios";
import { eq } from "drizzle-orm";
import { coursesTable } from "@/config/schema";
import { db } from "@/config/db";


const PROMPT = `Based on the chapter name and its topics, generate HTML content for each topic and return the response in JSON format.
Schema:
{
  chapterName: string,
  topics: [
    {
      topic: string,
      content: string
    }
  ]
}
User Input:
`;

export async function POST(req) {
  const { courseJson, courseTitle, courseId } = await req.json();

  const promises = courseJson?.chapters?.map(async (chapter) => {
    const model = 'gemini-2.5-flash';
    const response = await ai.models.generateContent({
      model,
      contents: PROMPT + JSON.stringify(chapter),
    });
    
    const RawResp=response.candidates[0].content.parts[0].text;
    console.log(RawResp);
    const RawJson=RawResp.replace('```json','').replace('```','').trim();
    const JSONResp=JSON.parse(RawJson);
    console.log(JSONResp);
 
    const youtubeData=await GetYoutubeVideo(chapter.chapterName);

    return {
      youtubeVideo:youtubeData,
      courseData:JSONResp,
    };
  });
  
  const CourseContent = await Promise.all(promises);
  //save to DB
  const dbResp=await db.update(coursesTable).set({
    courseContent:CourseContent
  }).where(eq(coursesTable.cid,courseId));
   
  return NextResponse.json({
    courseName: courseTitle,
    CourseContent:CourseContent,
  });
}
const YoutubeBaseUrl='https://www.googleapis.com/youtube/v3/search';
const GetYoutubeVideo=async(topic)=>{
  const params={
    part:'snippet',
    q:topic,
    maxResults:4,
    type:'video',
    key:process.env.YOUTUBE_API_KEY,
  }
  const resp=await axios.get(YoutubeBaseUrl, {params});
  const youtubeVideoListResp=resp.data.items;
  const youtubeVideoList=[];
  youtubeVideoListResp.forEach(item=>{
        const data={
              title:item.snippet.title,
              videoId:item.id.videoId
            }
            youtubeVideoList.push(data);
});
console.log(youtubeVideoList);
return youtubeVideoList;
}
