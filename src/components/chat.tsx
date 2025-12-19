"use client";
import { useState, useRef, useEffect } from "react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage],
        }),
      });

      if (!response.ok) throw new Error("Failed to fetch response");

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      let assistantMessage = "";
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value);
        const lines = text.split("\n");

        for (const line of lines) {
          if (line.startsWith("0:")
) {
            const content = line.slice(2);
            try {
              const parsed = JSON.parse(content);
              if (parsed.type === "text_delta") {
                assistantMessage += parsed.delta;
              }
            } catch {}
          }
        }
      }

      if (assistantMessage) {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: assistantMessage,
          },
        ]);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: 20 }}>
      <h1>Berkshire Hathaway Intelligence</h1>

      <div style={{ minHeight: 400, marginBottom: 20, border: "1px solid #ddd", borderRadius: 8, padding: 12, overflowY: "auto" }}>
        {messages.map((m) => (
          <div
            key={m.id}
            style={{
              padding: 12,
              margin: "8px 0",
              background: m.role === "user" ? "#e3f2fd" : "#f5f5f5",
              borderRadius: 8,
            }}
          >
            <strong>{m.role === "user" ? "You" : "Analyst"}:</strong>
            <p style={{ whiteSpace: "pre-wrap", margin: "8px 0 0 0" }}>{m.content}</p>
          </div>
        ))}
        {isLoading && <p style={{ fontStyle: "italic", color: "#666" }}>Analyzing...</p>}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about Berkshire Hathaway..."
          disabled={isLoading}
          style={{ flex: 1, padding: 12, fontSize: 16, borderRadius: 4, border: "1px solid #ddd" }}
        />
        <button
          type="submit"
          disabled={isLoading}
          style={{
            padding: "12px 24px",
            borderRadius: 4,
            border: "none",
            background: isLoading ? "#ccc" : "#007bff",
            color: "white",
            cursor: isLoading ? "not-allowed" : "pointer",
          }}
        >
          Send
        </button>
      </form>
    </div>
  );
}