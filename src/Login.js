import React, { useState, useContext } from "react";
import { ref, get, child } from "firebase/database"; // Import from firebase/database
import { useNavigate } from "react-router-dom";
import { ChatContext } from "./ChatContext";
import { db } from "./firebase"; // Ensure db is correctly imported
import "./Login.css";

const Login = () => {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { setChatId } = useContext(ChatContext);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const userRef = child(ref(db), `signed_up_users/${userId}`);
      console.log(userRef);
      const userSnapshot = await get(userRef);
      const user = userSnapshot.val();

      if (user && user.password === password) {
        const defaultChatId = Object.keys(user.chats || {})[0] || "defaultChatId";
        setChatId(defaultChatId);
        navigate("/chat");
      } else {
        setError("Invalid credentials. Please try again.");
      }
    } catch (error) {
      console.error("Error signing in:", error.message);
      setError("Error signing in. Please try again later.");
    }
  };

  return (
    <div className="login">
      <div className="login__container">
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
          alt="WhatsApp Logo"
        />
        <div className="login__text">
          <h1>Sign in to WhatsApp</h1>
        </div>
        <form className="login__form" onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="User ID"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit">Sign In</button>
          {error && <p className="login__error">{error}</p>}
        </form>
      </div>
    </div>
  );
};

export default Login;
