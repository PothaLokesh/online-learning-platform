
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 text-gray-900 font-inter">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center py-20 px-4">
        <h1 className="text-5xl font-bold tracking-tight mb-4">
          Welcome to <span className="text-blue-600">StreamWise</span>
        </h1>
        <p className="text-lg max-w-xl text-gray-700 mb-6">
          Smart, scalable learning powered by Google & YouTube APIs. Auto-generated courses, enriched with real-time video and AI prompts.
        </p>
        <div className="flex gap-4 items-center">
          <a
            href="/workspace"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition"
          >
            Explore Courses
          </a>

          <SignedOut>
            <SignInButton>
              <button className="border border-blue-600 text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-blue-50 transition">
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
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 px-8 py-16 bg-white">
        {[
          {
            title: "Auto-Generated Content",
            desc: "Courses built dynamically using Gemini and Google APIs.",
          },
          {
            title: "YouTube Enrichment",
            desc: "Real-time video integration for every topic.",
          },
          {
            title: "Modular & Scalable",
            desc: "Built for developers. Clean architecture, reusable flows.",
          },
        ].map((feature, idx) => (
          <div key={idx} className="p-6 border rounded-lg shadow-sm hover:shadow-md transition">
            <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
            <p className="text-gray-600">{feature.desc}</p>
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