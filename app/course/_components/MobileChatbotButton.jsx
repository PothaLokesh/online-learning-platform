import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle, Bot } from 'lucide-react';
import ChatbotWidget from './ChatbotWidget';

function MobileChatbotButton({ courseId }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Floating Button for Mobile */}
            <div className="fixed bottom-4 right-4 z-40 xl:hidden">
                <Button
                    onClick={() => setIsOpen(true)}
                    className="rounded-full w-14 h-14 shadow-lg bg-primary hover:bg-primary/90"
                    size="icon"
                >
                    <MessageCircle className="w-6 h-6" />
                </Button>
            </div>

            {/* Mobile Chatbot Modal */}
            {isOpen && (
                <div className="fixed inset-0 z-50 xl:hidden">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setIsOpen(false)} />
                    <div className="absolute inset-4 bg-white rounded-lg shadow-xl">
                        <ChatbotWidget courseId={courseId} isMobile={true} onClose={() => setIsOpen(false)} />
                    </div>
                </div>
            )}
        </>
    );
}

export default MobileChatbotButton;
