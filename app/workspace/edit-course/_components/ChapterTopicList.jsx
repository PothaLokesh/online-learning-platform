import React from 'react';
import { Gift } from 'lucide-react';

function ChapterTopicList({ course }) {
  // Handle both nested and flat course structure
  const courseLayout = course?.courseJson?.course || course?.courseJson;

  return (
    <div>
      <h2 className="font-bold text-3xl mt-10 text-center">Chapters & Topics</h2>
      <div className="flex flex-col items-center justify-center mt-10">
        {courseLayout?.chapters?.map((chapter, index) => (
          <div key={index} className="flex flex-col items-center mb-10 w-full max-w-xl">
            {/* Chapter Header */}
            <div className="p-4 border shadow rounded-xl bg-primary text-white w-full text-center">
              <h2>Chapter {index + 1}</h2>
              <h2 className="font-bold text-lg">{chapter?.chapterName}</h2>
              <div className="text-xs flex justify-between mt-2">
                <span>Duration: {chapter?.duration}</span>
                <span>No. of Topics: {chapter?.topics?.length}</span>
              </div>
            </div>

            {/* Timeline */}
            <div className="mt-6 relative">
              {(chapter?.topic || []).map((topic, topicIndex) => (
                <div key={topicIndex} className="flex flex-col items-center">
                  {/* Line above node */}
                  {topicIndex !== 0 && <div className="w-1 bg-gray-300 h-10"></div>}

                  {/* Node + Topic */}
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-gray-300 text-gray-700 flex items-center justify-center font-bold">
                      {topicIndex + 1}
                    </div>
                    <div className="text-sm font-medium text-gray-700 max-w-xs">{topic}</div>
                  </div>
                </div>
              ))}

              {/* Gift Node */}
              <div className="flex flex-col items-center mt-6">
                <div className="w-1 bg-gray-300 h-10"></div>
                <Gift className="h-10 w-10 text-gray-500 bg-gray-300 rounded-full p-2" />
                <div className="w-1 bg-gray-300 h-10"></div>
                <div className="mt-2 text-sm text-gray-600">Congratulations! You've completed this chapter.</div>
              </div>
            </div>
          </div>
        ))}

        {/* Finish Block */}
        <div className="p-4 border shadow rounded-xl bg-green-600 text-white mt-6">
          <h2>Finish</h2>
        </div>
      </div>
    </div>
  );
}

export default ChapterTopicList;