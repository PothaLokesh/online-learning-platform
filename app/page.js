import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { FaRobot, FaYoutube, FaCubes } from "react-icons/fa";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-100 text-gray-900 font-inter">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center py-24 px-4">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-4">
          Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">StreamWise</span>
        </h1>
        <p className="text-lg md:text-xl max-w-2xl text-gray-700 mb-8">
          Smart, scalable learning powered by Google & YouTube APIs. Auto-generated courses, enriched with real-time video and AI prompts.
        </p>
        <div className="flex gap-4 items-center">
          <a
            href="/workspace"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition transform hover:scale-105"
          >
            🚀 Explore Courses
          </a>

          <SignedOut>
            <SignInButton>
              <button className="border border-blue-600 text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-blue-50 transition transform hover:scale-105">
                Log In
              </button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </section>

      {/* Features Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 px-8 py-20 bg-white">
        {[
          {
            title: "Auto-Generated Content",
            desc: "Courses built dynamically using Gemini and Google APIs.",
            icon: <FaRobot className="text-blue-600 text-3xl mb-4" />,
          },
          {
            title: "YouTube Enrichment",
            desc: "Real-time video integration for every topic.",
            icon: <FaYoutube className="text-red-500 text-3xl mb-4" />,
          },
          {
            title: "Modular & Scalable",
            desc: "Built for developers. Clean architecture, reusable flows.",
            icon: <FaCubes className="text-indigo-500 text-3xl mb-4" />,
          },
        ].map((feature, idx) => (
          <div
            key={idx}
            className="p-6 border rounded-xl shadow-md hover:shadow-lg transition bg-white/70 backdrop-blur-md"
          >
            <div className="flex flex-col items-center text-center">
              {feature.icon}
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.desc}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Footer */}
      <footer className="text-center py-8 text-sm text-gray-500">
        © {new Date().getFullYear()} StreamWise. Built for devs, by devs.
      </footer>
    </main>
  );
}