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
  const [searchQuery,setSearchQuery]=useState('');
  const {user}=useUser();
  
  useEffect(()=>{
    user&&GetCourseList();
  },[user]);

  const GetCourseList=async()=>{
    const result=await axios.get('/api/courses?courseId=0');
    console.log(result.data);
    setCourseList(result.data);
  }

  const filteredCourses = courseList.filter((course) => {
    const courseJson = course?.courseJson?.course;
    const name = courseJson?.name || course?.name || '';
    const description = courseJson?.description || course?.description || '';
    const category = course?.category || '';
    const query = searchQuery.toLowerCase();
    return (
      name.toLowerCase().includes(query) ||
      description.toLowerCase().includes(query) ||
      category.toLowerCase().includes(query)
    );
  });

  return (
    <div>
      <h2 className='font-bold text-2xl mt-5'>Explore</h2>
      <p className='text-gray-500 text-sm mb-4'>Discover fully generated courses created by the community.</p>
      
      <div className='flex gap-5 max-w-md mb-6'>
        <Input 
          placeholder='Search courses...' 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Button><Search className="mr-2 h-4 w-4"/>Search</Button>
      </div>
 
      {filteredCourses.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-10 border rounded-xl bg-secondary text-gray-500">
          <p className="text-lg font-semibold">No courses found</p>
          <p className="text-sm">Try adjusting your search terms or generate a new course!</p>
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-5 mt-5'>
          {
           filteredCourses.map((course,index)=>(
             <CourseCard course={course} key={index}/>
           ))
          }
        </div>
      )}
    </div>
  )
}

export default Explore
