"use client";

import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Bot, User } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "SafePath AI initialized. How can I assist you with the current disaster scenario?" }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsTyping(true);

    try {
      const response = await fetch("http://localhost:8000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      });
      
      const data = await response.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "CONNECTION LOST. Unable to reach AI core." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 left-6 p-4 bg-red-500 hover:bg-red-400 text-white rounded-full shadow-lg shadow-red-500/30 transition-all duration-300 z-50 ${isOpen ? "scale-0 opacity-0" : "scale-100 opacity-100 hover:scale-110"}`}
      >
        <MessageSquare className="w-6 h-6" />
      </button>

      {/* Chat Window */}
      <div 
        className={`fixed bottom-6 left-6 w-80 sm:w-96 bg-white dark:bg-[#0a0e1a] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col z-50 transition-all duration-300 transform origin-bottom-left ${isOpen ? "scale-100 opacity-100" : "scale-0 opacity-0 pointer-events-none"}`}
        style={{ height: "500px", maxHeight: "80vh" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 rounded-t-2xl">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-500/10 rounded-lg flex items-center justify-center">
              <Bot className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">SafePath AI</h3>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Online</span>
              </div>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === "user" ? "bg-slate-100 dark:bg-slate-800" : "bg-red-500/10"}`}>
                {msg.role === "user" ? <User className="w-4 h-4 text-slate-500 dark:text-slate-300" /> : <Bot className="w-4 h-4 text-red-500" />}
              </div>
              <div className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                msg.role === "user" 
                  ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-tr-sm" 
                  : "bg-red-500/10 border border-red-500/20 text-slate-800 dark:text-slate-200 rounded-tl-sm"
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-red-500/10 rounded-full flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-red-500" />
              </div>
              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-1.5 h-1.5 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-1.5 h-1.5 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-3 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 rounded-b-2xl">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about procedures or status..."
              className="flex-1 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:border-red-500 rounded-xl px-4 py-2 text-sm text-slate-900 dark:text-slate-200 outline-none transition-colors"
            />
            <button 
              type="submit"
              disabled={!input.trim() || isTyping}
              className="p-2 bg-red-500 hover:bg-red-400 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-xl transition-colors shrink-0"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
