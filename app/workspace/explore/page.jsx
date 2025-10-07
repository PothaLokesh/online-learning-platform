"use client"
import { useUser } from '@clerk/nextjs'
import axios from 'axios'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Search } from 'lucide-react'
import React from 'react'
import { Input } from '@/components/ui/input'
import CourseCard from '../_components/CourseCard'

function Explore() {
  const [courseList,setCourseList]=useState([]);
  const {user}=useUser();
  useEffect(()=>{
    user&&GetCourseList();
  },[user]);
  const GetCourseList=async()=>{
    const result=await axios.get('/api/courses?courseId=0');
    console.log(result.data);
    setCourseList(result.data);
  }
  return (
    <div>
      
      <h2 className='font-bold text-2xl mt-5'>Explore</h2>
      <div className='flex gap-5 max-w-md'>
        <Input placeholder='Search'/>
        <Button><Search/>Search</Button>
      </div>
 
       <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-5 mt-5'>
         {
          courseList.map((course,index)=>(
            <CourseCard course={course} key={index}/>
          ))
         }
        </div>
    </div>
  )
}

export default Explore
