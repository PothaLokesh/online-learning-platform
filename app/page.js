import Header from "./_components/Header";
import { FaRobot, FaYoutube, FaLayerGroup, FaArrowRight, FaCode, FaCheckCircle } from "react-icons/fa";

export default function Home() {
  return (
    <main className="min-h-screen font-inter bg-white overflow-x-hidden selection:bg-blue-100 selection:text-blue-900">
      <Header />

      {/* Decorative Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-100/40 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3 animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-100/40 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 animate-pulse" style={{ animationDuration: '10s' }} />
      </div>

      {/* Hero Section */}
      <section className="pt-32 pb-24 px-4 container mx-auto text-center relative">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-sm font-medium mb-8 animate-fade-in-up">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          Next-Gen AI Learning Platform
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 text-gray-900 leading-[1.1]">
          Master Coding with <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 animate-gradient-x">
            AI-Powered Intelligence
          </span>
        </h1>

        <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
          StreamWise generates personalized courses, enriches them with real-world videos, and guides you with an intelligent RAG chatbot.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <a
            href="/workspace"
            className="group bg-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-blue-500/25 flex items-center gap-2 transform hover:-translate-y-1"
          >
            Start Learning Free
            <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
          </a>
          <a
            href="#features"
            className="px-8 py-4 rounded-xl font-bold text-lg text-gray-700 hover:bg-gray-50 border border-gray-200 transition-all duration-300 flex items-center gap-2"
          >
            View Demo
            <FaYoutube className="text-red-500" />
          </a>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-gray-50/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why Learning with StreamWise is Better</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">Traditional courses are static. Ours are dynamic, continuously updated, and tailored just for you.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "AI Course Generation",
                desc: "Type any topic. Our Gemini-powered engine builds a structured curriculum in seconds.",
                icon: <FaRobot className="w-8 h-8 text-white" />,
                bg: "bg-gradient-to-br from-blue-500 to-blue-600"
              },
              {
                title: "Smart Video Curation",
                desc: "We don't just generate text. We fetch the best YouTube tutorials for every single chapter.",
                icon: <FaYoutube className="w-8 h-8 text-white" />,
                bg: "bg-gradient-to-br from-red-500 to-red-600"
              },
              {
                title: "Contextual RAG Chatbot",
                desc: "Stuck? Ask the AI assistant. It knows your course content inside out and answers instantly.",
                icon: <FaLayerGroup className="w-8 h-8 text-white" />,
                bg: "bg-gradient-to-br from-violet-500 to-violet-600"
              }
            ].map((feature, idx) => (
              <div key={idx} className="group p-8 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300 hover:-translate-y-2 relative overflow-hidden">
                <div className={`w-14 h-14 rounded-xl ${feature.bg} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Code/Tech Section */}
      <section className="py-24 border-t border-gray-100">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center gap-16">
          <div className="flex-1 space-y-8">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900">Built for Modern Developers</h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              Experience a learning environment that feels like a professional workspace. Clean code blocks, markdown support, and distraction-free reading.
            </p>

            <ul className="space-y-4">
              {[
                "Next.js 15 & React Server Components",
                "Google Gemini AI Integration",
                "Pgvector for Semantic Search",
                "Real-time Clerk Authentication"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-gray-700 font-medium">
                  <FaCheckCircle className="text-green-500 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <a
              href="/workspace"
              className="inline-block mt-4 text-blue-600 font-bold hover:text-blue-800 transition-colors"
            >
              Start building your skills &rarr;
            </a>
          </div>

          <div className="flex-1 w-full max-w-lg aspect-square relative">
            {/* Abstract visual representation of code/platform */}
            <div className="absolute inset-0 bg-gradient-to-tr from-gray-900 to-gray-800 rounded-2xl shadow-2xl p-6 flex flex-col transform rotate-3 hover:rotate-0 transition-transform duration-500">
              <div className="flex items-center gap-2 mb-4 border-b border-gray-700 pb-4">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <div className="space-y-3 font-mono text-sm text-gray-300 overflow-hidden">
                <p><span className="text-purple-400">const</span> <span className="text-blue-400">course</span> = <span className="text-yellow-300">await</span> ai.generate({'{'}</p>
                <p className="pl-4"><span className="text-red-300">topic</span>: <span className="text-green-300">"Next.js Architecture"</span>,</p>
                <p className="pl-4"><span className="text-red-300">level</span>: <span className="text-green-300">"Advanced"</span></p>
                <p>{'}'});</p>
                <p className="text-gray-500">// Generating curriculum...</p>
                <div className="h-2 bg-blue-500/20 rounded-full mt-4 overflow-hidden">
                  <div className="h-full w-3/4 bg-blue-500 animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-white border-t border-gray-100">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            <FaCode className="w-5 h-5 text-gray-400" />
            <span className="font-semibold text-gray-500">StreamWise Platform</span>
          </div>
          <p className="text-gray-400 text-sm">© {new Date().getFullYear()} StreamWise. Built with ❤️ for the community.</p>
        </div>
      </footer>
    </main>
  );
}