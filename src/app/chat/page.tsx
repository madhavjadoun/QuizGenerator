"use client";

import { useState, useRef, useEffect } from "react";
import AppShell from "@/components/app/AppShell";
import OrbitLoader from "@/components/app/OrbitLoader";

interface Msg {
  id: string;
  role: "user" | "assistant";
  text: string;
  sources?: string[];
  chunks?: number;
  ms?: number;
}

const SOURCES = [
  "RAG_Knowledge_Flow.md",
  "Sentence_Transformers_Specs.txt",
  "Vector_DB_Prisma_Schema.sql",
  "Standard_Layout_Notes.pdf",
  "Research_Paper_Embeddings.pdf",
];

const REPLIES = [
  (q: string) => ({
    text: `Based on your indexed documents, I found relevant context matching "${q}". The RAG flow document describes how vector embeddings are generated using sentence transformers, then stored in pgvector for cosine similarity lookup.`,
    sources: [SOURCES[0], SOURCES[1]],
    chunks: 3,
    ms: 143,
  }),
  (q: string) => ({
    text: `Semantic search complete for "${q}". In your Prisma schema, the vector index is defined with cosine similarity — computed similarity score: 0.914. The index spans ${Math.floor(Math.random() * 30 + 10)} matched chunks.`,
    sources: [SOURCES[2]],
    chunks: 2,
    ms: 198,
  }),
  (q: string) => ({
    text: `Found 3 highly relevant chunks for "${q}" across your knowledge base. The research paper (page 4) explains how sentence transformers project text into high-dimensional vector space, achieving state-of-the-art recall on retrieval benchmarks.`,
    sources: [SOURCES[3], SOURCES[4]],
    chunks: 4,
    ms: 221,
  }),
];

const INIT: Msg[] = [
  {
    id: "0",
    role: "assistant",
    text: "Hello! I'm your AI knowledge assistant. Ask me anything about your uploaded documents — I'll search the vector index and surface the most relevant information with source citations.",
  },
];

const SUGGESTED = [
  "Summarize this document",
  "Generate viva questions",
  "Explain chapter 3",
  "Find important concepts"
];

const HISTORY = {
  today: [
    { id: "h1", title: "Summarize Research Paper" },
    { id: "h2", title: "Vector Ingestion Pipeline" }
  ],
  yesterday: [
    { id: "h3", title: "Sentence Transformer Specs" },
    { id: "h4", title: "Supabase RLS Debugging" }
  ]
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Msg[]>(INIT);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, thinking]);

  const send = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || thinking) return;
    setInput("");
    setThinking(true);

    const userMsg: Msg = { id: Math.random().toString(), role: "user", text };
    setMessages((p) => [...p, userMsg]);

    await new Promise((r) => setTimeout(r, 900 + Math.random() * 600));

    const pick = REPLIES[Math.floor(Math.random() * REPLIES.length)](text);
    const aiMsg: Msg = { id: Math.random().toString(), role: "assistant", ...pick };
    setMessages((p) => [...p, aiMsg]);
    setThinking(false);
    inputRef.current?.focus();
  };

  const onKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const loadHistoryItem = (title: string) => {
    setMessages([
      ...INIT,
      { id: Math.random().toString(), role: "user", text: `Load context: ${title}` },
      { id: Math.random().toString(), role: "assistant", text: `I have restored the context for "${title}". Ask me any questions about these documents.`, sources: [SOURCES[0]], chunks: 2, ms: 85 }
    ]);
  };

  return (
    <AppShell
      title="AI Chat"
      subtitle="Semantic query workspace across indexed knowledge base."
      action={
        <button
          onClick={() => setMessages(INIT)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold border border-[var(--border)] hover:bg-[var(--bg-2)] transition-colors text-[var(--text-2)] cursor-pointer"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
          Reset Session
        </button>
      }
    >
      <div
        className="max-w-6xl mx-auto flex gap-6 overflow-hidden"
        style={{ height: "calc(100vh - 52px - 148px)" }}
      >
        {/* Chat History Sidebar — Visible only on medium and larger screens */}
        <aside
          className="hidden md:flex flex-col w-56 flex-shrink-0 glass-card rounded-xl overflow-hidden p-3.5 space-y-4"
        >
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-4)] mb-2">
              Today
            </h3>
            <div className="space-y-1">
              {HISTORY.today.map((item) => (
                <button
                  key={item.id}
                  onClick={() => loadHistoryItem(item.title)}
                  className="w-full text-left truncate text-sm px-2.5 py-1.5 rounded-lg text-[var(--text-3)] hover:bg-[var(--bg-2)] hover:text-[var(--text-1)] transition-colors cursor-pointer"
                >
                  💬 {item.title}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-4)] mb-2">
              Yesterday
            </h3>
            <div className="space-y-1">
              {HISTORY.yesterday.map((item) => (
                <button
                  key={item.id}
                  onClick={() => loadHistoryItem(item.title)}
                  className="w-full text-left truncate text-sm px-2.5 py-1.5 rounded-lg text-[var(--text-3)] hover:bg-[var(--bg-2)] hover:text-[var(--text-1)] transition-colors cursor-pointer"
                >
                  💬 {item.title}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Conversation Window */}
        <div className="flex-1 flex flex-col min-w-0 glass-card rounded-xl overflow-hidden p-4">
          
          {/* Messages Feed */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto space-y-4 pr-1 scroll-smooth"
          >
            {messages.length === 1 && (
              /* Empty Workspace State */
              <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-5">
                <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-[var(--bg-2)] border border-[var(--border)] text-[var(--text-4)]">
                  <svg className="w-5 h-5 text-[var(--indigo)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.85}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375" />
                  </svg>
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-semibold text-[var(--text-2)]">
                    Ask anything from your knowledge base.
                  </h3>
                  <p className="text-sm text-[var(--text-4)] max-w-[320px]">
                    Query across all stored vector chunks to search your knowledge base and receive cited document answers.
                  </p>
                </div>

                {/* Suggested prompts grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-[360px] w-full">
                  {SUGGESTED.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => send(prompt)}
                      className="text-xs text-left px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg-2)]/20 hover:bg-[var(--bg-2)] text-[var(--text-3)] hover:text-[var(--text-1)] hover:border-slate-300 dark:hover:border-zinc-700 transition-all font-medium cursor-pointer"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.length > 1 && messages.map((m) =>
              m.role === "user" ? (
                <div key={m.id} className="flex justify-end pl-10">
                  <div className="chat-user-bubble px-4 py-3 text-[16px] leading-[1.7] font-medium">
                    {m.text}
                  </div>
                </div>
              ) : (
                <div key={m.id} className="flex gap-3 items-start pr-10">
                  {/* AI Avatar icon */}
                  <div className="flex-shrink-0 mt-0.5">
                    <div className="h-7 w-7 rounded-lg flex items-center justify-center border border-[var(--border)] bg-[var(--bg-2)] text-[var(--indigo)]">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 21m0 0l-.813-5.096M9 21h3m-3.375-10.125h3.375" />
                      </svg>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0 space-y-3.5">
                    <div className="chat-ai-bubble px-4 py-3 text-[16px] leading-[1.7] text-[var(--text-2)]">
                      {m.text}
                    </div>

                    {/* Metadata citations card row */}
                    {(m.sources || m.ms) && (
                      <div className="space-y-2 mt-2 pt-2 border-t border-[var(--border)]/40">
                        {m.sources && m.sources.length > 0 && (
                          <div className="space-y-1.5">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-4)]">Document Sources</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {m.sources.map((s, idx) => (
                                <div
                                  key={s}
                                  className="flex flex-col gap-1 p-2.5 rounded-lg border border-[var(--border)] bg-[var(--bg-2)]/30 hover:bg-[var(--bg-2)]/75 transition-all text-xs"
                                >
                                  <span className="text-[13px] font-semibold text-[var(--text-2)] truncate">📄 {s}</span>
                                  <div className="flex items-center justify-between text-[13px] font-medium text-[var(--text-4)] mt-0.5">
                                    <span>Page {idx + 1}</span>
                                    <span>Ref: chunk_{Math.floor(Math.random() * 50 + 10)}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between text-[13px] font-medium text-[var(--text-4)] pt-1">
                          {m.ms && (
                            <span>Vector search completed in {m.ms}ms</span>
                          )}
                          {m.chunks && (
                            <span>Retrieval depth: {m.chunks} chunks</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            )}

            {/* Ingestion load indicator (Thinking state) */}
            {thinking && (
              <div className="flex gap-3 items-start">
                <div className="h-7 w-7 rounded-lg flex items-center justify-center flex-shrink-0 border border-[var(--border)] bg-[var(--bg-2)] text-[var(--indigo)] mt-0.5">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 21m0 0l-.813-5.096M9 21h3m-3.375-10.125h3.375" />
                  </svg>
                </div>

                <div className="chat-ai-bubble flex items-center gap-3 px-4 py-3 text-sm text-[var(--text-2)]">
                  <OrbitLoader size={20} />
                  <div>
                    <p className="font-semibold text-[var(--text-1)]">Searching vector index</p>
                    <p className="text-[13px] font-medium text-[var(--text-4)]">Retrieving relevant document chunks...</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Input bar wrapper */}
          <div className="flex-shrink-0 pt-3">
            <div className="glass-chat-input rounded-xl p-3 flex flex-col">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKey}
                placeholder="Ask anything about your documents..."
                rows={1}
                className="w-full resize-none bg-transparent text-sm leading-relaxed outline-none border-none p-0 text-[var(--text-1)]"
                style={{ maxHeight: "100px" }}
              />

              <div
                className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-[var(--border)]"
              >
                <p className="text-xs text-[var(--text-4)]">
                  <kbd className="px-1.5 py-0.5 rounded font-mono text-[11px] bg-[var(--bg-2)] border border-[var(--border)] text-[var(--text-4)]">
                    Enter
                  </kbd>{" "}
                  to send · Shift+Enter for newline
                </p>

                <button
                  onClick={() => send()}
                  disabled={!input.trim() || thinking}
                  className="grad-btn flex items-center gap-1.5 px-4.5 py-1.5 rounded-lg text-sm font-semibold"
                >
                  {thinking ? (
                    <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                    </svg>
                  )}
                  Send
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </AppShell>
  );
}
