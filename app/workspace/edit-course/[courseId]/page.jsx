"use client"
import React from 'react'
import {useParams} from  'next/navigation'
import axios from 'axios';
import { useState,useEffect } from 'react';
import CourseInfo from '../_components/CourseInfo';
import ChapterTopicList from '../_components/ChapterTopicList';
function EditCourse({viewCourse=false}) {
    const {courseId}=useParams();
    const [loading,setLoading]=useState(false);
    const [course,setCourse]=useState(null);

    useEffect(()=>{
        if(courseId){
            GetCourseInfo();
        }
    },[courseId])
    const  GetCourseInfo=async()=>{
        try{
            setLoading(true);
            const result=await axios.get('/api/courses?courseId='+courseId)
            console.log(result.data);
            setCourse(result.data);
        }catch(err){
            console.error('Failed to fetch course info', err);
        }finally{
            setLoading(false);
        }
    }
  return (
    <div>
        {loading ? (
            <div className="flex justify-center items-center h-64">
                <div className="text-lg">Loading course...</div>
            </div>
        ) : (
            <>
                <CourseInfo course={course} viewCourse={viewCourse}/>
                <ChapterTopicList course={course}/>
            </>
        )}
    </div>
  )
}

export default EditCourse
