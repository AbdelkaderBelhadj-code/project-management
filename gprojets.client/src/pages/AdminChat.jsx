import React, { useEffect, useState, useRef } from "react";
import * as signalR from "@microsoft/signalr";
import axios from "axios";

const API_URL = "http://localhost:5035/notifications"; // Change if needed

export default function AdminChat({ jwt }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const connectionRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
  
    // Fetch existing messages
    axios.get("http://localhost:5035/api/messages", {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setMessages(res.data));
  
    connectionRef.current = new signalR.HubConnectionBuilder()
      .withUrl("http://localhost:5035/notifications", {
        accessTokenFactory: () => token || ""
      })
      .withAutomaticReconnect()
      .build();
  
    connectionRef.current
      .start()
      .then(() => {
        console.log("SignalR connected.");
      })
      .catch(err => {
        console.error("SignalR Connection Error:", err);
      });
  
    connectionRef.current.on("ReceiveMessage", (msg) => {
      setMessages(prev => [...prev, msg]);
    });
  
    return () => {
      if (connectionRef.current) {
        connectionRef.current.stop();
      }
    };
  }, []);
  
  

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
  
    try {
      await connectionRef.current.invoke("SendMessage", input);
      setInput("");
  
      // Re-fetch messages from backend after sending
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5035/api/messages", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(res.data);
    } catch (error) {
      console.error("Failed to send message", error);
      alert("Failed to send message");
    }
  };
  

  return (
    <div style={{maxWidth: 500, margin: "2rem auto", border: "1px solid #ccc", borderRadius: 8, padding: 16}}>
      <h3>Admin Broadcast Chat</h3>
      <div style={{height: 300, overflowY: "auto", background: "#f9f9f9", marginBottom: 12, padding: 8}}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{ margin: "8px 0" }}>
            <div><b>{msg.senderRole}</b> <small>{new Date(msg.sentAt).toLocaleString()}</small></div>
            <div>{msg.content}</div>
          </div>
        ))}
      </div>
      <form onSubmit={handleSend} style={{display:"flex", gap: 8}}>
        <input
          style={{flex:1, borderRadius:4, border:"1px solid #ccc", padding:8}}
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type a message to all users..."
        />
        <button style={{padding:"0 16px"}} type="submit">Send</button>
      </form>
    </div>
  );
}