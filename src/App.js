import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./Login";
import Chat from "./Chat";
import { ChatProvider } from "./ChatContext";

const App = () => {
  return (
    <ChatProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/chat" element={<Chat />} />
          {/* Other routes */}
        </Routes>
      </Router>
    </ChatProvider>
  );
};

export default App;
