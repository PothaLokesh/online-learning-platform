import React from 'react'
import { useContext } from 'react';
import { SelectedChapterIndexContext } from '@/context/SelectedChapterIndexContext';
import Youtube from 'react-youtube';
import { CheckCircle, X } from 'lucide-react';
import {Button} from '@/components/ui/button';
import { toast } from 'sonner';
import axios from 'axios';
import Image from 'next/image';
import ChatbotWidget from './ChatbotWidget';
import MobileChatbotButton from './MobileChatbotButton';
function ChapterContent({courseInfo,refreshData}) {
   
    const course=courseInfo?.courses;
    const enrollCourse=courseInfo?.enrollCourse;
    const courseContent=courseInfo?.courses?.courseContent;
    const {selectedChapterIndex,setSelectedChapterIndex}=useContext(SelectedChapterIndexContext);
    const videoData=courseContent?.[selectedChapterIndex].youtubeVideo;
    const topics=courseContent?.[selectedChapterIndex].courseData?.topics;
    const courseId=courseInfo?.courses?.cid;
    
    let completedChapter=enrollCourse?.completedChapter??[];
    const markChapterCompleted=async()=>{
      
      
        completedChapter.push(selectedChapterIndex);

        const result=await axios.put('/api/enroll-course',{
             courseId:courseId,
             completedChapter:completedChapter
        });
        console.log(result);
        refreshData();
        toast.success('Chapter marked as completed');

      
    }
  return (
    <div className='p-10'>
      {/* Header Section */}
      <div className='flex justify-between items-center mb-6'>
        <h2 className="text-2xl font-semibold">
          {selectedChapterIndex + 1}. {courseContent?.[selectedChapterIndex]?.courseData?.chapterName ?? "No chapter selected"}
        </h2>
        {!completedChapter?.includes(selectedChapterIndex) ? (
          <Button onClick={() => markChapterCompleted()}>
            <CheckCircle />
            <Image src="/gemini.png" alt="Gemini Logo" width={20} height={20} className="ml-2" />
            Mark as Completed
          </Button>
        ) : (
          <Button variant='outline'>
            <X />
            Mark incomplete
          </Button>
        )}
      </div>

      {/* Main Content Layout */}
      <div className='grid grid-cols-1 xl:grid-cols-4 gap-8'>
        {/* Left Column - Course Content */}
        <div className='xl:col-span-3 space-y-8'>
          {/* Videos Section */}
          <div>
            <h2 className='mb-4 font-bold text-lg'>Related Videos</h2>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
              {videoData?.map((video,index)=>index<2 &&(
                <div key={index}>
                  <Youtube videoId={video.videoId} opts={{height:'250',width:'400' }}/>
                </div>
              ))}
            </div>
          </div>

          {/* Topics Section */}
          <div>
            {topics?.map((topic,index)=>(
              <div key={index} className='mb-8 p-6 bg-secondary rounded-2xl'>
                <h2 className='font-bold text-2xl text-primary mb-4'>
                  {index+1}. {topic.topic}
                </h2>
                <div 
                  dangerouslySetInnerHTML={{__html:topic?.content}} 
                  style={{lineHeight:'2.5'}}
                  className="prose prose-sm max-w-none"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Right Column - Chatbot Widget (Desktop) */}
        <div className='xl:col-span-1 hidden xl:block'>
          <div className='sticky top-4 h-[calc(100vh-2rem)]'>
            <ChatbotWidget courseId={courseId} />
          </div>
        </div>
      </div>

      {/* Mobile Chatbot Button */}
      <MobileChatbotButton courseId={courseId} />
    </div>
  )
}

export default ChapterContent
