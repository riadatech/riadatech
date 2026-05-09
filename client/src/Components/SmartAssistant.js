import React, { useEffect, useRef, useState } from "react";

import { buildApiUrl } from "../api/httpClient";
import SiteFooter from "./SiteFooter";
import "./SmartAssistant.css";

function SmartAssistant({ locale = "ar" }) {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef(null);

  const isArabic = locale === "ar";
  const direction = isArabic ? "rtl" : "ltr";

  const copy = isArabic
    ? {
        title: "مساعد ريادتك الذكي",
        subtitle: "اسأل عن مشروعك، السوق، التمويل، أو تحليل الموقع.",
        placeholder: "اكتب سؤالك أو فكرتك هنا...",
        send: "إرسال",
        sending: "جارٍ الإرسال...",
        emptyTitle: "كيف أقدر أساعدك اليوم؟",
        loading: "يفكر",
        genericError: "حدث خطأ أثناء الاتصال بالمساعد. حاول مرة أخرى.",
        suggestions: [
          "حلّل فكرة مشروعي",
          "اقترح لي مشروع مربح",
          "كيف أحصل على تمويل؟",
        ],
      }
    : {
        title: "RiadaTach Smart Assistant",
        subtitle: "Ask about your project, market, funding, or location analysis.",
        placeholder: "Write your question or idea here...",
        send: "Send",
        sending: "Sending...",
        emptyTitle: "How can I help you today?",
        loading: "Thinking",
        genericError: "Something went wrong while contacting the assistant. Please try again.",
        suggestions: [
          "Analyze my business idea",
          "Suggest a profitable project",
          "How can I get funding?",
        ],
      };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isLoading]);

  async function sendMessage(message) {
    const trimmedMessage = String(message || "").trim();

    if (!trimmedMessage || isLoading) {
      return;
    }

    setMessages((current) => [
      ...current,
      {
        id: `user-${Date.now()}`,
        role: "user",
        text: trimmedMessage,
      },
    ]);
    setInputValue("");
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch(buildApiUrl("/api/chat"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: trimmedMessage,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error || `Request failed with status ${response.status}`);
      }

      const assistantText = data?.reply?.trim() || copy.genericError;

      setMessages((current) => [
        ...current,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          text: assistantText,
        },
      ]);
    } catch (requestError) {
      setError(requestError.message || copy.genericError);
    } finally {
      setIsLoading(false);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    sendMessage(inputValue);
  }

  function handleSuggestionClick(suggestion) {
    sendMessage(suggestion);
  }

  return (
    <div className="rt-assistant-page" dir={direction}>
      <main className="rt-assistant-main">
        <section className="rt-assistant-shell">
          <header className="rt-assistant-topbar">
            <div className="rt-assistant-title-row">
              <span className="rt-assistant-status-dot" aria-hidden="true" />
              <h1>{copy.title}</h1>
            </div>
            <p>{copy.subtitle}</p>
          </header>

          <div className="rt-assistant-chat-card">
            <div className="rt-assistant-messages">
              {messages.length === 0 ? (
                <div className="rt-assistant-empty-state">
                  <h2>{copy.emptyTitle}</h2>
                  <div className="rt-assistant-suggestions">
                    {copy.suggestions.map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        className="rt-assistant-suggestion"
                        onClick={() => handleSuggestionClick(suggestion)}
                        disabled={isLoading}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`rt-assistant-message rt-assistant-message-${message.role}`}
                >
                  <div className="rt-assistant-bubble">{message.text}</div>
                </div>
              ))}

              {isLoading ? (
                <div className="rt-assistant-message rt-assistant-message-assistant">
                  <div className="rt-assistant-bubble rt-assistant-bubble-loading">
                    <span>{copy.loading}</span>
                    <span className="rt-assistant-dots" aria-hidden="true">
                      <span />
                      <span />
                      <span />
                    </span>
                  </div>
                </div>
              ) : null}

              <div ref={messagesEndRef} />
            </div>

            <div className="rt-assistant-compose">
              {error ? <div className="rt-assistant-error">{error}</div> : null}

              <form className="rt-assistant-form" onSubmit={handleSubmit}>
                <input
                  type="text"
                  className="rt-assistant-input"
                  value={inputValue}
                  onChange={(event) => setInputValue(event.target.value)}
                  placeholder={copy.placeholder}
                  disabled={isLoading}
                />
                <button type="submit" className="rt-assistant-send" disabled={isLoading}>
                  {isLoading ? copy.sending : copy.send}
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter locale={locale} />
    </div>
  );
}

export default SmartAssistant;
