"use client";

import { useCompletion } from "ai/react";
import { motion } from "framer-motion";

export default function StreamPage() {
  const { completion, input, handleInputChange, handleSubmit, isLoading } = useCompletion({
    api: "/api/completion/stream",
  });

  return (
    <div className="min-h-screen bg-[#0a0a0a] relative overflow-hidden flex flex-col">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-cyan-900/20 via-transparent to-transparent" />

      {/* Noise texture overlay */}
      <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIj48ZmlsdGVyIGlkPSJnoiPjxmZVR1cmJ1bGVuY2UgdHlwZT0iZnJhY3RhbE5vaXNlIiBiYXNlRnJlcXVlbmN5PSIwLjY1IiBudW1PY3RhdmVzTMiMyIgc3RpdGNoVGlsZXM9InN0aXRjaCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNuKSIgb3BhY2l0eT0iMC41Ii8+PC9zdmc+')] pointer-events-none" />

      {/* Geometric decorative elements */}
      <div className="absolute top-20 right-20 w-64 h-64 border border-cyan-500/10 rounded-full animate-[spin_20s_linear_infinite]" />
      <div className="absolute bottom-20 left-20 w-96 h-96 border border-cyan-500/5 rounded-full animate-[spin_30s_linear_infinite_reverse]" />

      <div className="relative z-10 container mx-auto px-6 py-16 max-w-4xl grow flex flex-col">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <h1
            className="text-6xl md:text-7xl font-bold text-white mb-4 tracking-tighter"
            style={{ fontFamily: "Syne, sans-serif" }}
          >
            AI Text
            <span className="text-cyan-500">Stream</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-xl">
            Experience real-time streaming responses. Watch the AI generate text character by character.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8 grow"
        >
          {completion || isLoading ? (
            <div className="bg-[#141414] border-2 border-gray-800 rounded-xl p-8 relative overflow-hidden h-full">
              {/* Decorative corner accent */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-cyan-500/20 to-transparent rounded-bl-full" />

              <h2 className="text-sm font-medium text-gray-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${isLoading ? 'bg-cyan-500 animate-pulse' : 'bg-cyan-500'}`} />
                AI Response
                {isLoading && (
                  <span className="text-xs text-cyan-400 ml-2">Streaming...</span>
                )}
              </h2>

              {isLoading && !completion ? (
                <div className="space-y-3">
                  <div className="h-4 bg-gray-800 rounded animate-pulse" />
                  <div className="h-4 bg-gray-800 rounded animate-pulse w-5/6" />
                  <div className="h-4 bg-gray-800 rounded animate-pulse w-4/6" />
                </div>
              ) : (
                <p
                  className="text-gray-100 leading-relaxed whitespace-pre-wrap"
                  style={{ fontFamily: "DM Sans, sans-serif" }}
                >
                  {completion}
                  {isLoading && (
                    <span className="inline-block w-2 h-5 bg-cyan-500 ml-1 animate-pulse" />
                  )}
                </p>
              )}
            </div>
          ) : (
            <div className="bg-[#141414] border-2 border-dashed border-gray-800 rounded-xl p-8 text-center h-full flex items-center justify-center">
              <p className="text-gray-600">Your AI stream will appear here in real-time</p>
            </div>
          )}
        </motion.div>

        {/* Spacer to push input to bottom */}
        <div className="grow" />
      </div>

      {/* Input Section - NOW AT THE BOTTOM */}
      <div className="relative z-10 bg-[#0a0a0a]/95 backdrop-blur-sm border-t border-gray-800">
        <div className="container mx-auto px-6 py-8 max-w-4xl">
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            onSubmit={handleSubmit}
            className="mb-6"
          >
            <label className="block text-sm font-medium text-gray-300 mb-3 uppercase tracking-wider">
              Your Prompt
            </label>
            <textarea
              value={input}
              onChange={handleInputChange}
              placeholder="What would you like the AI to explain or create?"
              className="w-full h-32 bg-[#141414] border-2 border-gray-800 rounded-xl p-6 text-white placeholder-gray-600 focus:border-cyan-500 focus:outline-none transition-colors resize-none"
              style={{ fontFamily: "DM Sans, sans-serif" }}
              disabled={isLoading}
            />
          </motion.form>

          {/* Generate Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex justify-center"
          >
            <button
              onClick={handleSubmit}
              disabled={isLoading || !input.trim()}
              className="group relative px-8 py-4 bg-cyan-500 text-black font-bold text-lg rounded-lg overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed hover:bg-cyan-400 transition-all"
              style={{ fontFamily: "Syne, sans-serif" }}
            >
              <span className="relative z-10 flex items-center gap-3">
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Streaming...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                    Stream Response
                  </>
                )}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          </motion.div>

          {/* Footer */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-6 text-center text-gray-600 text-sm"
          >
            Built with Next.js 14 + Groq AI + Streaming
          </motion.p>
        </div>
      </div>

      {/* Google Fonts */}
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap");
      `}</style>
    </div>
  );
}
