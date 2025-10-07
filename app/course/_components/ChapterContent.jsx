import React from 'react'
import { useContext } from 'react';
import { SelectedChapterIndexContext } from '@/context/SelectedChapterIndexContext';
import Youtube from 'react-youtube';
import { CheckCircle, X } from 'lucide-react';
import {Button} from '@/components/ui/button';
import { toast } from 'sonner';
import axios from 'axios';

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
            <div className='flex justify-between items-center'>
            <h2 className="text-2xl font-semibold mb-4">{selectedChapterIndex+1}.
  {courseContent?.[selectedChapterIndex]?.courseData?.chapterName ?? "No chapter selected"}
</h2>
          {!completedChapter?.includes(selectedChapterIndex)?<Button onClick={()=>markChapterCompleted()}> <CheckCircle/> Mark as Completed</Button>:
            <Button variant='outline'><X/>Mark incomplete</Button>}
            </div>

<h2 className='my-2 font-bodl text-lg'>Related Videos</h2>
 <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
    {videoData?.map((video,index)=>index<2 &&(
              <div key={index}>
                       <Youtube  videoId={video.videoId} opts={{height:'250',width:'400' }}/>
              </div>
    ))}
 </div>
     <div className='mt-7'>
          {topics?.map((topic,index)=>(
            <div key={index} className='mt-10 p05 bg-secondary rounded-2xl'>
              <h2 className='font-bold text-2xl text-primary'>
                {index+1}.{topic.topic}

              </h2>
              {/*<p>{topic?.content}</p>*/}
              <div dangerouslySetInnerHTML={{__html:topic?.content}} style={{lineHeight:'2.5'}}></div>
            </div>
          ))}
     </div>
  </div>
  )
}

export default ChapterContent
