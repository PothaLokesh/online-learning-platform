
import React from 'react';
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Bot } from 'lucide-react';

const Header = () => {
    return (
        <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                {/* Logo */}
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <Bot className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-bold text-xl text-gray-900">StreamWise</span>
                </div>

                {/* Navigation / Actions */}
                <div className="flex items-center gap-4">
                    <SignedOut>
                        <SignInButton mode="modal">
                            <button className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                                Log In
                            </button>
                        </SignInButton>
                        <SignInButton mode="modal">
                            <button className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md">
                                Get Started
                            </button>
                        </SignInButton>
                    </SignedOut>

                    <SignedIn>
                        <a
                            href="/workspace"
                            className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors mr-4 hidden md:block"
                        >
                            Dashboard
                        </a>
                        <UserButton afterSignOutUrl="/" />
                    </SignedIn>
                </div>
            </div>
        </header>
    );
};

export default Header;
