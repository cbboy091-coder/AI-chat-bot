import React, { useEffect, useRef, useState } from "react";
import "./App.css";

function App() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hi! 👋 I'm your AI assistant. What would you like to know?",
    },
  ]);

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage(event) {
    event.preventDefault();

    const text = message.trim();

    if (!text || loading) return;

    const updatedMessages = [
      ...messages,
      { role: "user", content: text },
    ];

    setMessages(updatedMessages);
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: updatedMessages.filter(
            (item) =>
              item.content !==
              "Hi! 👋 I'm your AI assistant. What would you like to know?"
          ),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong.");
      }

      setMessages((previous) => [
        ...previous,
        { role: "assistant", content: data.reply },
      ]);
    } catch (error) {
      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content:
            "Sorry, I couldn't connect. Check that the AI server is running and try again.",
        },
      ]);

      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="app">
      <section className="chat">
        <header className="chat-header">
          <div className="bot-avatar">AI</div>

          <div className="header-info">
            <h1>My AI Assistant</h1>
            <p>
              <span className="online-dot"></span>
              Ready to chat
            </p>
          </div>

          <span className="header-icon">⋮</span>
        </header>

        <div className="chat-body">
          <div className="day-label">TODAY</div>

          {messages.map((item, index) => (
            <div
              className={`message-row ${
                item.role === "user" ? "sent" : "received"
              }`}
              key={index}
            >
              <div className="bubble">
                {item.content}
                <span className="message-time">
                  {item.role === "user" ? "You" : "AI"}
                </span>
              </div>
            </div>
          ))}

          {loading && (
            <div className="message-row received">
              <div className="bubble typing">
                AI is thinking<span>.</span><span>.</span><span>.</span>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        <form className="chat-footer" onSubmit={sendMessage}>
          <input
            type="text"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Type a message..."
            aria-label="Type a message"
            disabled={loading}
          />

          <button
            type="submit"
            disabled={!message.trim() || loading}
            aria-label="Send message"
          >
            ➤
          </button>
        </form>
      </section>
    </main>
  );
}

export default App;
