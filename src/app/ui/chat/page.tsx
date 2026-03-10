"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setStreamingContent("");
    setIsLoading(true);

    // Cancel any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    try {
      // Convert messages to UIMessage format
      const uiMessages = messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...uiMessages, userMessage],
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch: ${response.status} ${errorText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No reader");

      const decoder = new TextDecoder();
      let fullContent = "";
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");

        // Keep the last line in the buffer if it's incomplete
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (trimmedLine.startsWith("data:")) {
            try {
              const jsonStr = trimmedLine.slice(5).trim();
              if (jsonStr === "[DONE]") continue;

              const data = JSON.parse(jsonStr);

              // Handle different stream formats
              if (data.type === "text-delta" && data.textDelta) {
                fullContent += data.textDelta;
                setStreamingContent(fullContent);
              } else if (data.type === "reasoning-delta" && data.delta) {
                fullContent += data.delta;
                setStreamingContent(fullContent);
              } else if (data.delta) {
                fullContent += data.delta;
                setStreamingContent(fullContent);
              } else if (data.content) {
                fullContent += data.content;
                setStreamingContent(fullContent);
              }
            } catch (e) {
              // Ignore parse errors
            }
          }
        }
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: fullContent,
        },
      ]);
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") {
        console.error("Error:", error);
      }
    } finally {
      setIsLoading(false);
      setStreamingContent("");
      abortControllerRef.current = null;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const stop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsLoading(false);
      setStreamingContent("");
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] relative overflow-hidden flex flex-col">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent" />

      {/* Noise texture overlay */}
      <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIj48ZmlsdGVyIGlkPSJnoiPjxmZVR1cmJ1bGVuY2UgdHlwZT0iZnJhY3RhbE5vaXNlIiBiYXNlRnJlcXVlbmN5PSIwLjY1IiBudW1PY3RhdmVzTMiMyIgc3RpdGNoVGlsZXM9InN0aXRjaCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNuKSIgb3BhY2l0eT0iMC41Ii8+PC9zdmc+')] pointer-events-none" />

      {/* Geometric decorative elements */}
      <div className="absolute top-20 right-20 w-64 h-64 border border-purple-500/10 rounded-full animate-[spin_20s_linear_infinite]" />
      <div className="absolute bottom-20 left-20 w-96 h-96 border border-purple-500/5 rounded-full animate-[spin_30s_linear_infinite_reverse]" />

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
            AI
            <span className="text-purple-500">Chat</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-xl">
            Have a conversation with AI. Send messages and get intelligent responses in real-time.
          </p>
        </motion.div>

        {/* Chat Messages Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8 grow overflow-y-auto"
          style={{ maxHeight: "calc(100vh - 450px)" }}
        >
          <div className="space-y-6">
            {messages.length === 0 && !streamingContent ? (
              <div className="bg-[#141414] border-2 border-dashed border-gray-800 rounded-xl p-8 text-center h-full flex items-center justify-center">
                <p className="text-gray-600">Start a conversation with AI</p>
              </div>
            ) : (
              <>
                {messages.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-xl p-4 ${
                        message.role === "user"
                          ? "bg-purple-600 text-white"
                          : "bg-[#141414] border-2 border-gray-800 text-gray-100"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-semibold uppercase tracking-wider opacity-70">
                          {message.role === "user" ? "You" : "AI"}
                        </span>
                      </div>
                      <p
                        className="leading-relaxed whitespace-pre-wrap"
                        style={{ fontFamily: "DM Sans, sans-serif" }}
                      >
                        {message.content}
                      </p>
                    </div>
                  </motion.div>
                ))}
                {streamingContent && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start"
                  >
                    <div className="max-w-[80%] rounded-xl p-4 bg-[#141414] border-2 border-gray-800 text-gray-100">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-semibold uppercase tracking-wider opacity-70">
                          AI
                        </span>
                        <span className="text-xs text-purple-400">Typing...</span>
                      </div>
                      <p
                        className="leading-relaxed whitespace-pre-wrap"
                        style={{ fontFamily: "DM Sans, sans-serif" }}
                      >
                        {streamingContent}
                        {isLoading && (
                          <span className="inline-block w-2 h-5 bg-purple-500 ml-1 animate-pulse" />
                        )}
                      </p>
                    </div>
                  </motion.div>
                )}
              </>
            )}

            <div ref={messagesEndRef} />
          </div>
        </motion.div>

        {/* Spacer to push input to bottom */}
        <div className="grow" />
      </div>

      {/* Input Section - AT THE BOTTOM */}
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
              Your Message
            </label>
            <textarea
              value={input}
              onChange={handleInputChange}
              placeholder="Type your message here..."
              className="w-full h-32 bg-[#141414] border-2 border-gray-800 rounded-xl p-6 text-white placeholder-gray-600 focus:border-purple-500 focus:outline-none transition-colors resize-none"
              style={{ fontFamily: "DM Sans, sans-serif" }}
              disabled={isLoading}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (input.trim() && !isLoading) {
                    handleSubmit(e);
                  }
                }
              }}
            />
          </motion.form>

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex justify-center gap-4"
          >
            {isLoading ? (
              <>
                {/* Stop Button */}
                <button
                  onClick={stop}
                  className="group relative px-8 py-4 bg-red-600 text-white font-bold text-lg rounded-lg overflow-hidden hover:bg-red-500 transition-all"
                  style={{ fontFamily: "Syne, sans-serif" }}
                >
                  <span className="relative z-10 flex items-center gap-3">
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <rect x="6" y="6" width="12" height="12" rx="1" />
                    </svg>
                    Stop
                  </span>
                  <div className="absolute inset-0 bg-linear-to-r from-red-500 to-red-700 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </>
            ) : (
              <>
                {/* Send Button */}
                <button
                  onClick={handleSubmit}
                  disabled={!input.trim()}
                  className="group relative px-8 py-4 bg-purple-600 text-white font-bold text-lg rounded-lg overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-500 transition-all"
                  style={{ fontFamily: "Syne, sans-serif" }}
                >
                  <span className="relative z-10 flex items-center gap-3">
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
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                      />
                    </svg>
                    Send Message
                  </span>
                  <div className="absolute inset-0 bg-linear-to-r from-purple-500 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </>
            )}
          </motion.div>
        </div>
      </div>

      {/* Google Fonts */}
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap");
      `}</style>
    </div>
  );
}
