import dotenv from 'dotenv';
import { GoogleGenAI } from "@google/genai";
import { auth } from '@clerk/nextjs/server';

dotenv.config();

import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { db } from '@/config/db';
import { coursesTable } from '@/config/schema';
import axios from 'axios';
const PROMPT=`Genrate Learning Course depends oon following details.In which Make sure to add Course Name,Description ,Course Banner Image Prompt (create a modern ,flat-style 2D digital illustratio representing ser Topic.Include UI/Ux elements such as Mockup screens,ext blocks ,icons,buttons,and creative workspace tools.Add symbolic elements related to user Course ,like Sticky notes,design components,and visual aids .Use a vibrant color palette (blues,purples,Oranges) with a clean ,professional look.The illustraaction should feel creative ,tech-savy ,and eductaional ,ideal for visualizing concepts in user Course) for Course Bannet in 3d format Chapter Name,Topic under each chapters ,Duration for esach chapters etc,in JSON format only
Schema:
{
"course":{
"name":"string",
"description":"string",
"category":"string",
"level":"string",
"includeVideo":"boolean",
"noOfChapters":"number",
"bannerImagePrompt":"string",
"chapters":[
{
"chapterName":"string",
"duration":"string",
"topic":[
"string"
],
}
]
}
}
,User Input:`
export const ai = new GoogleGenAI({
  apiKey:process.env.GEMINI_API_KEY

});
export async function POST(req){
  try {
      const {courseId,...formData}=await req.json();
      const user=await currentUser();
      const {has} =await auth();
      const hasPremiumAccess=has({plan:'starter'})

      if(!hasPremiumAccess){
        const result=await db.select().from(coursesTable).where(eq(coursesTable.userEmail,user?.primaryEmailAddress?.emailAddress));
         if(result?.length>=1){
            return NextResponse.json({'resp':'limit exceeded'})
         }

      }
      // Check if user is authenticated
      if (!user) {
          return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
      }

      // Check if API key is available
      if (!process.env.GEMINI_API_KEY) {
          return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 });
      }

      // Check if database URL is available
      if (!process.env.DATABASE_URL) {
          return NextResponse.json({ error: 'DATABASE_URL not configured' }, { status: 500 });
      }

      
      const model = 'gemini-2.5-pro';
      const prompt = PROMPT + JSON.stringify(formData);
  
     
      const response = await ai.models.generateContent({
        model,
        contents:prompt,
      });
      
     
      console.log('----------------------------------------')
      const RawResp=response.text;
      const RawJson=RawResp.replace('```json','').replace('```','');
      const JSONResp=JSON.parse(RawJson);

      const ImagePrompt=JSONResp.course?.bannerImagePrompt;
      
      //generate Image
      const bannerImageUrl= await GenerateImage(ImagePrompt);
      // save to database
      const result=await db.insert(coursesTable).values({
          ...formData,
          courseJson:JSONResp,
          userEmail:user?.primaryEmailAddress?.emailAddress,
          cid:courseId,
          bannerImageUrl:bannerImageUrl
      });

      return NextResponse.json({ success: true, courseId });
  } catch (error) {
      console.error('Error in generate-course-layout:', error);
      return NextResponse.json({ 
          error: 'Internal server error', 
          details: error.message 
      }, { status: 500 });
  }
}

const GenerateImage=async(ImagePrompt)=>{
  const BASE_URL='https://aigurulab.tech';
const result = await axios.post(BASE_URL+'/api/generate-image',
      {
          width: 1024,
          height: 1024,
          input: ImagePrompt,
          model: 'flux',//'flux'
          aspectRatio:"16:9"//Applicable to Flux model only
      },
      {
          headers: {
              'x-api-key': process.env?.AI_GURU_LAB_API, // Your API Key
              'Content-Type': 'application/json', // Content Type
          },
      })
console.log(result.data.image)
//Output Result: Base 64 Image
return result.data.image;
}