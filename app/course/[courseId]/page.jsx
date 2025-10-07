"use client"
import { useParams } from 'next/navigation'
import { useEffect } from 'react'
import { useState } from 'react'
import axios from 'axios'
import React from 'react'
import AppHeader from '@/app/workspace/_components/AppHeader'
import ChapterListSidebar from '../_components/ChapterListSidebar'
import ChapterContent from '../_components/ChapterContent'
function Course() {
    const {courseId}=useParams();
    const [courseInfo,setCourseInfo]=useState();
    useEffect(()=>{
        GetEnrolledCourseById();

    },[])
    const GetEnrolledCourseById=async()=>{
        const result=await axios.get('/api/enroll-course?courseId='+courseId);
        console.log(result.data);
        setCourseInfo(result.data);
    }
  return (
    <div>
      <AppHeader hideSidebar={true}/>
      <div  className='flex gap-10'>
      <ChapterListSidebar courseInfo={courseInfo}/>
      <ChapterContent    courseInfo={courseInfo} refreshData={()=>GetEnrolledCourseById()}/>  
      </div>
    </div>
  )
}

export default Course
