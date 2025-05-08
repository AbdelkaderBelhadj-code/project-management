import React, { useEffect, useState, useRef } from "react";
import * as signalR from "@microsoft/signalr";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const API_URL = "http://localhost:5035/notifications";
const MESSAGES_API = "http://localhost:5035/api/messages";

export default function Chat({ jwt }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const connectionRef = useRef(null);

  // Decode JWT once
  let email = "unknown";
  let role = "unknown";
  try {
    const decoded = jwtDecode(jwt);
    email = decoded.Email || decoded.email || "unknown";
    role = decoded.Role || decoded.role || "unknown";
  } catch (e) {
    // Token invalid
  }

  useEffect(() => {
    // Fetch existing messages
    axios
      .get(MESSAGES_API, {
        headers: { Authorization: `Bearer ${jwt}` },
      })
      .then((res) => setMessages(res.data))
      .catch((err) => console.error("Failed to fetch messages", err));

    connectionRef.current = new signalR.HubConnectionBuilder()
      .withUrl(API_URL, { accessTokenFactory: () => jwt })
      .withAutomaticReconnect()
      .build();

    connectionRef.current
      .start()
      .then(() => {
        console.log("SignalR connected.");
      })
      .catch((err) => {
        console.error("SignalR Connection Error:", err);
      });

    connectionRef.current.on("ReceiveMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      if (connectionRef.current) {
        connectionRef.current.stop();
      }
    };
  }, [jwt]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    try {
      // Pass message, senderEmail, senderRole
      await connectionRef.current.invoke("SendMessage", input, email, role);
      setInput("");
    } catch (error) {
      console.error("Failed to send message", error);
      alert("Failed to send message");
    }
  };

  return (
    <div style={{
      maxWidth: 500, margin: "2rem auto",
      border: "1px solid #ccc", borderRadius: 8, padding: 16, background: "#fff"
    }}>
      <h3>Group Chat</h3>
      <div style={{
        height: 300, overflowY: "auto", background: "#f9f9f9",
        marginBottom: 12, padding: 8, borderRadius: 4
      }}>
        {messages.length === 0 && <div>No messages yet.</div>}
        {messages.map((msg, idx) => (
          <div key={idx} style={{ margin: "8px 0" }}>
            <div>
              <b style={{
                color:
                  msg.senderRole?.toLowerCase() === "admin"
                    ? "#b33"
                    : msg.senderRole?.toLowerCase() === "chef"
                    ? "#2a7"
                    : "#09f"
              }}>
                {msg.senderEmail} ({msg.senderRole})
              </b>
              <small style={{ marginLeft: 8, color: "#888" }}>
                {new Date(msg.sentAt).toLocaleString()}
              </small>
            </div>
            <div style={{ marginLeft: 10 }}>{msg.content}</div>
          </div>
        ))}
      </div>
      <form onSubmit={handleSend} style={{ display: "flex", gap: 8 }}>
        <input
          style={{
            flex: 1, borderRadius: 4, border: "1px solid #ccc", padding: 8
          }}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
        />
        <button style={{ padding: "0 16px" }} type="submit">
          Send
        </button>
      </form>
    </div>
  );
}