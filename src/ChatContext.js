import React, { createContext, useState } from "react";

// Create Context
export const ChatContext = createContext();

// Create Provider Component
export const ChatProvider = ({ children }) => {
  const [userId, setUserId] = useState(null);

  return (
    <ChatContext.Provider value={{ userId, setUserId }}>
      {children}
    </ChatContext.Provider>
  );
};
