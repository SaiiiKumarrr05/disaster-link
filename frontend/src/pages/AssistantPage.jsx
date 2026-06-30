import { useState, useEffect, useRef } from "react";
import { Send, Phone, Siren, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import TopBar from "../components/layout/TopBar";
import QuickTopicChip from "../components/assistant/QuickTopicChip";
import ChatBubble from "../components/assistant/ChatBubble";
import { assistantApi } from "../services/api";
import { useLanguage } from "../context/LanguageContext";

export default function AssistantPage() {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [topics, setTopics] = useState([]);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    assistantApi.topics(language).then(setTopics).catch(() => setTopics([]));
  }, [language]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const handleTopicTap = async (topic) => {
    setMessages((prev) => [...prev, { from: "user", text: topic.title }]);
    setMessages((prev) => [...prev, { from: "assistant", text: null, steps: topic.steps }]);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending) return;
    setMessages((prev) => [...prev, { from: "user", text }]);
    setInput("");
    setSending(true);
    try {
      const result = await assistantApi.query(text, language);
      setMessages((prev) => [...prev, { from: "assistant", text: result.steps ? null : result.reply, steps: result.steps }]);
    } catch {
      setMessages((prev) => [...prev, { from: "assistant", text: t.assistant.fallback, steps: null }]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-base flex flex-col">
      <TopBar title={t.assistant.title} showBack />

      <div className="bg-warning-light border-b border-warning px-4 py-2.5">
        <div className="max-w-2xl mx-auto flex items-start gap-2">
          <AlertTriangle size={16} className="text-warning flex-shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-xs font-medium text-text-primary">{t.assistant.disclaimer}</p>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 max-w-2xl w-full mx-auto">
        {messages.length === 0 && (
          <div className="mb-4">
            <p className="text-sm font-bold text-text-primary mb-3">{t.assistant.quickTopics}</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {topics.map((topic) => (
                <QuickTopicChip key={topic.topic_key} topic={topic} onClick={handleTopicTap} />
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {messages.map((m, idx) => (
            <ChatBubble key={idx} from={m.from} text={m.text} steps={m.steps} />
          ))}
          {sending && <ChatBubble from="assistant" text={t.common.loading} />}
        </div>
      </div>

      <div className="border-t border-border bg-surface px-4 py-3 max-w-2xl w-full mx-auto sticky bottom-0">
        <form onSubmit={handleSend} className="flex gap-2 mb-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t.assistant.typeMessage}
            className="flex-1 min-h-tap px-4 rounded-full border-2 border-border focus:border-gov-blue outline-none text-sm"
          />
          <button
            type="submit"
            aria-label={t.assistant.send}
            disabled={sending}
            className="flex items-center justify-center min-h-tap min-w-tap bg-gov-blue disabled:opacity-50 text-white rounded-full"
          >
            <Send size={18} aria-hidden="true" />
          </button>
        </form>

        <div className="flex gap-2">
          <button
            onClick={() => navigate("/sos")}
            className="flex-1 flex items-center justify-center gap-2 min-h-tap bg-emergency hover:bg-emergency-dark text-white font-bold rounded-lg text-sm"
          >
            <Siren size={16} aria-hidden="true" />
            {t.nav.sos}
          </button>
          <a
            href="tel:112"
            className="flex-1 flex items-center justify-center gap-2 min-h-tap border-2 border-emergency text-emergency font-bold rounded-lg text-sm"
          >
            <Phone size={16} aria-hidden="true" />
            112
          </a>
        </div>
      </div>
    </div>
  );
}
