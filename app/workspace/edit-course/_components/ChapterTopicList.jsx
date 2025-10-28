"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

function ChapterTopicList({ course }) {
    const [chapters, setChapters] = useState([]);
    const [editingChapter, setEditingChapter] = useState(null);
    const [editingTopic, setEditingTopic] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (course && course.courseContent) {
            setChapters(course.courseContent);
        } else {
            setChapters([]);
        }
    }, [course]);

    const handleAddChapter = () => {
        const newChapter = {
            chapterName: `Chapter ${chapters.length + 1}`,
            topics: []
        };
        setChapters([...chapters, newChapter]);
        setEditingChapter(chapters.length);
    };

    const handleAddTopic = (chapterIndex) => {
        const newTopic = {
            topic: 'New Topic',
            content: 'Enter topic content here...'
        };
        const updatedChapters = [...chapters];
        if (!updatedChapters[chapterIndex].topics) {
            updatedChapters[chapterIndex].topics = [];
        }
        updatedChapters[chapterIndex].topics.push(newTopic);
        setChapters(updatedChapters);
        setEditingTopic({ chapterIndex, topicIndex: updatedChapters[chapterIndex].topics.length - 1 });
    };

    const handleSaveCourse = async () => {
        try {
            setLoading(true);
            await axios.put('/api/courses', {
                courseId: course.cid,
                courseContent: chapters
            });
            toast.success('Course content saved successfully!');
        } catch (error) {
            console.error('Error saving course:', error);
            toast.error('Failed to save course content');
        } finally {
            setLoading(false);
        }
    };

    const handleChapterNameChange = (index, newName) => {
        const updatedChapters = [...chapters];
        updatedChapters[index].chapterName = newName;
        setChapters(updatedChapters);
    };

    const handleTopicChange = (chapterIndex, topicIndex, field, value) => {
        const updatedChapters = [...chapters];
        if (!updatedChapters[chapterIndex].topics) {
            updatedChapters[chapterIndex].topics = [];
        }
        updatedChapters[chapterIndex].topics[topicIndex][field] = value;
        setChapters(updatedChapters);
    };

    const handleDeleteTopic = (chapterIndex, topicIndex) => {
        const updatedChapters = [...chapters];
        if (updatedChapters[chapterIndex].topics) {
            updatedChapters[chapterIndex].topics.splice(topicIndex, 1);
        }
        setChapters(updatedChapters);
    };

    const handleDeleteChapter = (chapterIndex) => {
        const updatedChapters = chapters.filter((_, index) => index !== chapterIndex);
        setChapters(updatedChapters);
    };

    return (
        <div className="space-y-6 p-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Course Content</h2>
                <div className="flex gap-2">
                    <Button onClick={handleAddChapter} variant="outline">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Chapter
                    </Button>
                    <Button onClick={handleSaveCourse} disabled={loading}>
                        <Save className="w-4 h-4 mr-2" />
                        {loading ? 'Saving...' : 'Save Course'}
                    </Button>
                </div>
            </div>

            {chapters?.map((chapter, chapterIndex) => (
                <Card key={chapterIndex} className="w-full">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Badge variant="secondary">Chapter {chapterIndex + 1}</Badge>
                                {editingChapter === chapterIndex ? (
                                    <input
                                        type="text"
                                        value={chapter.chapterName}
                                        onChange={(e) => handleChapterNameChange(chapterIndex, e.target.value)}
                                        className="font-semibold text-lg bg-transparent border-b border-gray-300 focus:border-blue-500 focus:outline-none"
                                        onBlur={() => setEditingChapter(null)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') setEditingChapter(null);
                                        }}
                                        autoFocus
                                    />
                                ) : (
                                    <h3 
                                        className="font-semibold text-lg cursor-pointer hover:text-blue-600"
                                        onClick={() => setEditingChapter(chapterIndex)}
                                    >
                                        {chapter.chapterName}
                                    </h3>
                                )}
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteChapter(chapterIndex)}
                                className="text-red-500 hover:text-red-700"
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {chapter.topics?.map((topic, topicIndex) => (
                                <div key={topicIndex} className="border rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <Badge variant="outline">Topic {topicIndex + 1}</Badge>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDeleteTopic(chapterIndex, topicIndex)}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <input
                                            type="text"
                                            value={topic.topic}
                                            onChange={(e) => handleTopicChange(chapterIndex, topicIndex, 'topic', e.target.value)}
                                            className="w-full font-medium text-gray-900 bg-transparent border-b border-gray-200 focus:border-blue-500 focus:outline-none"
                                            placeholder="Topic title..."
                                        />
                                        <textarea
                                            value={topic.content}
                                            onChange={(e) => handleTopicChange(chapterIndex, topicIndex, 'content', e.target.value)}
                                            className="w-full min-h-[100px] p-2 border border-gray-200 rounded focus:border-blue-500 focus:outline-none"
                                            placeholder="Enter topic content..."
                                        />
                                    </div>
                                </div>
                            ))}
                            
                            <Button
                                variant="outline"
                                onClick={() => handleAddTopic(chapterIndex)}
                                className="w-full"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Add Topic to Chapter {chapterIndex + 1}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ))}

            {(!chapters || chapters.length === 0) && (
                <Card className="w-full">
                    <CardContent className="text-center py-12">
                        <p className="text-gray-500 mb-4">No chapters added yet</p>
                        <Button onClick={handleAddChapter}>
                            <Plus className="w-4 h-4 mr-2" />
                            Add First Chapter
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

export default ChapterTopicList;