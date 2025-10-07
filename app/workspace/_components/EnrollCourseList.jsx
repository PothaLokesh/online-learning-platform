"use client"
import React from 'react'
import axios from 'axios';
 import { useEffect } from 'react';
 import { useState } from 'react';

import EnrollCourseCard from './EnrollCourseCard';

function EnrollCourseList() {
    const [enrolledCourseList,setEnrolledCourseList]=useState([]);
    useEffect(()=>{
        GetEnrolledCourseList();
    },[])
    const GetEnrolledCourseList=async()=>{
        const result=await axios.get('/api/enroll-course');
    console.log(result.data);
    setEnrolledCourseList(result.data);
    }
  return enrolledCourseList?.length>0&&(
    <div className='mt-3'>
      <h2 className='font-bold text-xl'>Continue Learning the Courses</h2>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-5 mt-5'>
      {enrolledCourseList?.map((course,index)=>(
        <EnrollCourseCard course={course?.courses}  enrollCourse={course?.enrollCourse}key={index}/>
      ))}
      </div>
    </div>
  )
}

export default EnrollCourseList
