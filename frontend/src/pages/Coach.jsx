import React, { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import { Send, Sparkles, Bot, User as UserIcon, Brain, Mic } from "lucide-react";
import { toast } from "sonner";

const SUGGESTIONS = [
  "Can I eat poha today?",
  "What should I avoid today?",
  "Diet advice for diabetes?",
  "I missed my BP medicine — what now?",
  "Best evening walk time in summer?",
];

export default function Coach() {
  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: "Namaste 🙏 I'm your Fittyfit health coach. Ask me about food, medicine, symptoms, or seasonal care — in Hindi or English.",
    },
  ]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const [busy, setBusy] = useState(false);
  const scroller = useRef(null);

  useEffect(() => {
    scroller.current?.scrollTo({ top: 1e9, behavior: "smooth" });
  }, [messages]);

  const send = async (text) => {
    const msg = (text || input).trim();
    if (!msg || busy) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", text: msg }]);
    setBusy(true);
    try {
      const { data } = await api.post("/coach/chat", { message: msg, session_id: sessionId });
      setSessionId(data.session_id);
      setMessages((m) => [...m, { role: "ai", text: data.reply }]);
    } catch (e) {
      toast.error(e?.response?.data?.detail || "AI failed to respond");
      setMessages((m) => [...m, { role: "ai", text: "Sorry, I had trouble answering. Please try again." }]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-5 animate-fade-up">
      <div className="glass rounded-3xl p-6 flex items-center gap-4">
        <div className="h-12 w-12 rounded-2xl bg-navy text-lime flex items-center justify-center">
          <Brain className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">AI Coach</div>
          <h1 className="font-display font-black text-2xl text-navy">Your caring health companion</h1>
        </div>
        <span className="chip"><span className="h-2 w-2 rounded-full bg-green-500" /> Online</span>
      </div>

      {/* Messages */}
      <div ref={scroller} className="glass rounded-3xl p-5 md:p-7 max-h-[62vh] overflow-y-auto" data-testid="coach-messages">
        <div className="space-y-4">
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-3 ${m.role === "user" ? "justify-end" : ""}`}>
              {m.role === "ai" && (
                <div className="h-9 w-9 rounded-2xl bg-navy text-lime flex items-center justify-center shrink-0">
                  <Bot className="h-4 w-4" />
                </div>
              )}
              <div className={`max-w-[75%] rounded-2xl px-5 py-3 ${
                m.role === "user" ? "bg-lime text-navy" : "bg-white border border-slate-100 text-slate-800"
              }`}>
                <div className="whitespace-pre-wrap leading-relaxed">{m.text}</div>
              </div>
              {m.role === "user" && (
                <div className="h-9 w-9 rounded-2xl bg-sky-glow text-navy flex items-center justify-center shrink-0">
                  <UserIcon className="h-4 w-4" />
                </div>
              )}
            </div>
          ))}
          {busy && (
            <div className="flex gap-3">
              <div className="h-9 w-9 rounded-2xl bg-navy text-lime flex items-center justify-center">
                <Bot className="h-4 w-4" />
              </div>
              <div className="bg-white border border-slate-100 rounded-2xl px-5 py-3 text-slate-500">
                Thinking…
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Suggestions */}
      <div className="flex gap-2 flex-wrap">
        {SUGGESTIONS.map((s, i) => (
          <button
            key={s}
            onClick={() => send(s)}
            data-testid={`coach-suggestion-${i}`}
            className="chip hover:bg-white transition-all"
          >
            <Sparkles className="h-3 w-3 text-lime-hover" style={{ color: "#65a30d" }} /> {s}
          </button>
        ))}
      </div>

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        className="glass rounded-3xl p-3 flex items-center gap-2"
      >
        <button type="button" className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center hover:bg-lime transition-colors" title="Voice input (coming soon)">
          <Mic className="h-5 w-5 text-navy" />
        </button>
        <input
          data-testid="coach-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything about your health…"
          className="flex-1 bg-transparent outline-none px-3 py-3 text-navy font-medium"
        />
        <button data-testid="coach-send" type="submit" disabled={busy} className="btn-cta !py-3">
          <Send className="h-4 w-4" /> Send
        </button>
      </form>
    </div>
  );
}
