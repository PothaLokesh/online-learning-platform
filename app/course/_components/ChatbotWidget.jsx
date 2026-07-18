import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageCircle, Send, Loader2, X, Bot } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

function ChatbotWidget({ courseId, isMobile = false, onClose }) {
    const [question, setQuestion] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [chatHistory, setChatHistory] = useState([]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!question.trim()) return;

        setIsLoading(true);
        try {
            // Format history for Gemini
            // Expected format: [{ role: "user", parts: [{ text: "..." }] }, { role: "model", parts: [{ text: "..." }] }]
            const history = chatHistory.flatMap(chat => [
                { role: "user", parts: [{ text: chat.question }] },
                { role: "model", parts: [{ text: chat.answer }] }
            ]);

            const response = await axios.post('/api/chat', {
                question: question.trim(),
                courseId: courseId,
                history: history
            });

            const newChat = {
                question: question.trim(),
                answer: response.data.answer,
                timestamp: new Date().toLocaleTimeString()
            };

            setChatHistory(prev => [...prev, newChat]);
            setQuestion('');
            toast.success('Question answered!');
        } catch (error) {
            console.error('Error asking question:', error);
            toast.error('Failed to get answer. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const clearChat = () => {
        setChatHistory([]);
        setQuestion('');
    };

    return (
        <div className={`${isMobile ? 'fixed inset-0 z-50 bg-background' : 'w-full h-full'} bg-white rounded-lg shadow-lg border flex flex-col`}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-t-lg">
                <div className="flex items-center gap-2">
                    <Bot className="w-5 h-5" />
                    <h3 className="font-semibold">Course Assistant</h3>
                </div>
                <div className="flex gap-2">
                    <Button
                        onClick={clearChat}
                        variant="ghost"
                        size="sm"
                        className="text-primary-foreground hover:bg-primary-foreground/20"
                    >
                        Clear Chat
                    </Button>
                    {isMobile && onClose && (
                        <Button
                            onClick={onClose}
                            variant="ghost"
                            size="sm"
                            className="text-primary-foreground hover:bg-primary-foreground/20"
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    )}
                </div>
            </div>

            {/* Chat History */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {chatHistory.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                        <Bot className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <h4 className="font-medium text-lg mb-2">Welcome to Course Assistant!</h4>
                        <p className="text-sm mb-4">
                            I'm here to help you understand the course content better.
                        </p>
                        <div className="text-left space-y-2 text-sm">
                            <p className="font-medium">You can ask me about:</p>
                            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                                <li>Explaining complex concepts</li>
                                <li>Providing code examples</li>
                                <li>Clarifying topics from the lessons</li>
                                <li>Summarizing key points</li>
                            </ul>
                        </div>
                    </div>
                ) : (
                    chatHistory.map((chat, index) => (
                        <div key={index} className="space-y-3">
                            {/* User Question */}
                            <div className="flex justify-end">
                                <div className="bg-primary text-primary-foreground p-3 rounded-lg max-w-[80%]">
                                    <p className="text-sm font-medium mb-1">You</p>
                                    <p className="text-sm">{chat.question}</p>
                                    <p className="text-xs opacity-70 mt-1">{chat.timestamp}</p>
                                </div>
                            </div>

                            {/* Assistant Response */}
                            <div className="flex justify-start">
                                <div className="bg-muted p-3 rounded-lg max-w-[80%]">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Bot className="w-4 h-4 text-primary" />
                                        <p className="text-sm font-medium">Assistant</p>
                                    </div>
                                    <div className="text-sm prose prose-sm max-w-none prose-p:mb-2 prose-ul:my-2 prose-li:my-0.5">
                                        <ReactMarkdown
                                            remarkPlugins={[remarkGfm]}
                                            components={{
                                                strong: ({ node, ...props }) => (
                                                    <span className="font-semibold text-primary bg-primary/10 px-1 py-0.5 rounded text-[0.9em]" {...props} />
                                                ),
                                                ul: ({ node, ...props }) => (
                                                    <ul className="list-disc pl-4 space-y-1" {...props} />
                                                ),
                                                ol: ({ node, ...props }) => (
                                                    <ol className="list-decimal pl-4 space-y-1" {...props} />
                                                ),
                                                a: ({ node, ...props }) => (
                                                    <a className="text-primary underline underline-offset-2 hover:text-primary/80" target="_blank" rel="noopener noreferrer" {...props} />
                                                ),
                                                code: ({ node, inline, className, children, ...props }) => {
                                                    return inline ? (
                                                        <code className="bg-muted px-1 py-0.5 rounded font-mono text-[0.9em]" {...props}>
                                                            {children}
                                                        </code>
                                                    ) : (
                                                        <div className="bg-muted/50 p-3 rounded-lg my-2 overflow-x-auto">
                                                            <code className="font-mono text-xs block" {...props}>
                                                                {children}
                                                            </code>
                                                        </div>
                                                    );
                                                }
                                            }}
                                        >
                                            {chat.answer}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Input Form */}
            <div className="p-4 border-t bg-muted/30">
                <form onSubmit={handleSubmit} className="space-y-3">
                    <Textarea
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="Ask a question about this course content..."
                        className="w-full min-h-[80px] resize-none"
                        disabled={isLoading}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSubmit(e);
                            }
                        }}
                    />
                    <div className="flex justify-between items-center">
                        <p className="text-xs text-muted-foreground">
                            Press Enter to send, Shift+Enter for new line
                        </p>
                        <Button
                            type="submit"
                            disabled={isLoading || !question.trim()}
                            className="px-6"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Thinking...
                                </>
                            ) : (
                                <>
                                    <Send className="w-4 h-4 mr-2" />
                                    Ask Question
                                </>
                            )}
                        </Button>
                    </div>
                </form>

                {/* Quick Question Suggestions */}
                {chatHistory.length === 0 && (
                    <div className="mt-4 space-y-2">
                        <p className="text-xs font-medium text-muted-foreground">Try asking:</p>
                        <div className="flex flex-wrap gap-2">
                            {[
                                "Explain this concept",
                                "Give me an example",
                                "What are the key points?",
                                "How does this work?"
                            ].map((suggestion, index) => (
                                <Button
                                    key={index}
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setQuestion(suggestion)}
                                    className="text-xs h-7"
                                >
                                    {suggestion}
                                </Button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ChatbotWidget;
