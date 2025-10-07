"use client";

import { Clock, PlaneIcon, PlayCircle } from 'lucide-react';
import React from 'react'
import { Book } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
function CourseInfo({course,viewCourse}) {
    // Handle both nested and flat course structure
    const courseLayout = course?.courseJson?.course
    
    const router=useRouter();
    
    const [loading, setLoading] = useState(false);
    const GenerateCourseContent=async()=>{
      //call API to Generate Content
      setLoading(true);
      try{
      const result=await axios.post('/api/generate-course-content',{
        courseJson:courseLayout,
        courseTitle:course?.name,
        courseId:course?.cid
      });
      console.log(result.data);
      setLoading(false);
      router.replace('/workspace');
      toast.success('Course content generated successfully');
    }
    catch(e){
        console.log(e);
         setLoading(false);
         toast.error('Failed to generate course content');
    }
      
    }
  return (
    <div className='flex flex-col md:flex-row gap-5 p-5 rounded-2xl shadow'>
      <div className='flex flex-col gap-3 flex-1'>
            <h2 className='font-bold text-3xl'>{courseLayout?.name}</h2>
            
            <p className='line-comp-2 text-gray-500'>{courseLayout?.description}</p>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-5'>
                <div className='flex gap-5 items-center p-3 rounded-lg shadow'>
                    <Clock className='text-blue-500'/>
                    <section>
                        <h2 className='font-bold'>Duration</h2>
                        <h2>2 hours</h2>
                    </section>
                </div>
                <div className='flex gap-5 items-center p-3 rounded-lg shadow'>
                    <Book className='text-green-500'/>
                    <section>
                        <h2 className='font-bold'>Chapters</h2>
                        <h2>2 hours</h2>
                    </section>
                </div>
                <div className='flex gap-5 items-center p-3 rounded-lg shadow'>
                    <Clock className='text-red-500'/>
                    <section>
                        <h2 className='font-bold'>Difficulty Level</h2>
                        <h2>{course?.level}</h2>
                    </section>
                </div>
            </div>
           {!viewCourse ?<Button className={'max-w-lg'} onClick={GenerateCourseContent} disabled={loading}>
  {loading ? 'Generating...' : 'Generate Content'}
</Button>
:<Link href={'/course/'+course?.cid}>
  <Button><PlayCircle/>Continue Learning</Button></Link>}
      </div>
       <div className='flex justify-center md:justify-end'>
         {course?.bannerImageUrl && course.bannerImageUrl.trim() !== '' ? (
           <Image src={course.bannerImageUrl} alt={'banner Image'}
             width={300}
             height={240}
             className='w-full max-w-[300px] h-[240px] rounded-2xl object-cover aspect-auto'
           />
         ) : null}
       </div>
    </div>
  )
}

export default CourseInfo
