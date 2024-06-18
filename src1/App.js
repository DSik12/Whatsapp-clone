import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./Login";
import Chat from "./Chat";
import { ChatProvider, ChatContext } from "./ChatContext";
import "./App.css";

const App = () => {
  return (
    <div className="app">
      <ChatProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/chat" element={<Chat />} />
          </Routes>
        </Router>
      </ChatProvider>
    </div>
  );
};