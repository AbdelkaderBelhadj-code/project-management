import React, { useEffect, useState } from "react";
import * as signalR from "@microsoft/signalr";
import axios from "axios";

const API_URL = "http://localhost:5035/notifications"; // Change if needed

export default function UserChat({ jwt }) {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    // Fetch existing messages
    axios.get(`http://localhost:5035/api/messages`, {
      headers: { Authorization: `Bearer ${jwt}` }
    }).then(res => setMessages(res.data));

    // Setup SignalR connection
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${API_URL}`, { accessTokenFactory: () => jwt })
      .withAutomaticReconnect()
      .build();

    connection.on("ReceiveMessage", (msg) => {
      setMessages(prev => [...prev, msg]);
    });

    connection.start()
      .catch(err => console.error("SignalR Connection Error: ", err));

    return () => {
      connection.stop();
    };
  }, [jwt]);

  return (
    <div style={{maxWidth: 500, margin: "2rem auto", border: "1px solid #ccc", borderRadius: 8, padding: 16}}>
      <h3>Admin Announcements</h3>
      <div style={{height: 300, overflowY: "auto", background: "#f9f9f9", padding: 8}}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{ margin: "8px 0" }}>
            <div><b>{msg.senderRole}</b> <small>{new Date(msg.sentAt).toLocaleString()}</small></div>
            <div>{msg.content}</div>
          </div>
        ))}
        {messages.length === 0 && <div>No messages yet.</div>}
      </div>
    </div>
  );
}