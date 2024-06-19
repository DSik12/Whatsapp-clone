import React, { useEffect, useState, useContext } from "react";
import { Avatar, IconButton, Menu, MenuItem } from "@mui/material";
import { SearchOutlined, AttachFile, MoreVert, InsertEmoticon as InsertEmoticonIcon, Mic as MicIcon, ExitToApp as ExitToAppIcon } from "@mui/icons-material";
import { ref, onValue, push, update, set } from "firebase/database";
import { db } from "./firebase"; // Firebase database reference
import "./Chat.css";
import { ChatContext } from "./ChatContext"; 

const Chat = () => {
  const { userId } = useContext(ChatContext); 

  const [sidebarChats, setSidebarChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState({});
  const [lastSeen, setLastSeen] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [usersList, setUsersList] = useState([]);

  useEffect(() => {
    const userChatsRef = ref(db, `user_chats/${userId}/chats`);

    const unsubscribe = onValue(userChatsRef, (snapshot) => {
      const userChats = snapshot.val();
      if (userChats) {
        const chatIds = Object.values(userChats);
        const chatsData = chatIds.map((chatId) => {
          const chatRef = ref(db, `conversations/${chatId}`);
          let chatData = {};
          onValue(chatRef, (snapshot) => {
            chatData = snapshot.val();
            if (chatData) {
              const otherUserId = Object.keys(chatData.participants).find(id => id !== userId);
              const otherUserRef = ref(db, `signed_up_users/${otherUserId}`);

              onValue(otherUserRef, (snapshot) => {
                const otherUserData = snapshot.val();
                if (otherUserData) {
                  const lastMessage = chatData.lastMessage.content.slice(0, 20) + (chatData.lastMessage.content.length > 20 ? "..." : "");
                  setSidebarChats(prevChats => {
                    const existingChatIndex = prevChats.findIndex(chat => chat.chatId === chatId);
                    if (existingChatIndex !== -1) {
                    
                      const updatedChats = [...prevChats];
                      updatedChats[existingChatIndex] = {
                        ...updatedChats[existingChatIndex],
                        roomName: otherUserData.name,
                        lastMessage: lastMessage
                      };
                      return updatedChats;
                    } else {
                  
                      return [
                        ...prevChats,
                        {
                          chatId: chatId,
                          roomName: otherUserData.name,
                          lastMessage: lastMessage
                        }
                      ];
                    }
                  });
                }
              });
            }
          });

          return chatData;
        });

        if (chatsData.length > 0) {
          setActiveChat(chatsData[0]?.chatId);
        }
      } else {
        console.log(`No user chats found for ${userId}.`);
      }
    }, (error) => {
      console.error('Error fetching user chats:', error);
    });

    return () => {
      unsubscribe();
    };
  }, [userId]); 
  useEffect(() => {
    const usersRef = ref(db, 'signed_up_users');
    const unsubscribe = onValue(usersRef, (snapshot) => {
      const usersData = snapshot.val();
      if (usersData) {
        setUsersList(Object.values(usersData).map(user => ({ id: user.id, name: user.name })));
        const onlineStatus = {};
        Object.keys(usersData).forEach(userId => {
          onlineStatus[userId] = Date.now() - usersData[userId].lastOnline < 10000; // 10 seconds threshold
        });
        setOnlineUsers(onlineStatus);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    const updateLastOnline = () => {
      const userRef = ref(db, `signed_up_users/${userId}/lastOnline`);
      set(userRef, Date.now()).catch((error) => {
        console.error('Error updating lastOnline:', error);
      });
    };

    const intervalId = setInterval(updateLastOnline, 5000);

    return () => {
      clearInterval(intervalId);
    };
  }, [userId]);

  useEffect(() => {
    if (activeChat) {
      const activeChatRef = ref(db, `conversations/${activeChat}/participants/${userId}/lastRead`);
      const lastReadUpdate = Date.now();
      set(activeChatRef, lastReadUpdate).catch((error) => {
        console.error('Error updating lastRead:', error);
      });
      const chatDataRef = ref(db, `conversations/${activeChat}`);
      onValue(chatDataRef, (snapshot) => {
        const chatData = snapshot.val();
        if (chatData) {
          const otherUserId = Object.keys(chatData.participants).find(id => id !== userId);
          const otherUserLastRead = chatData.participants[otherUserId]?.lastRead || 0;
          setLastSeen(new Date(otherUserLastRead).toLocaleString());
        }
      });
    }
  }, [activeChat, userId]); 

  useEffect(() => {
    if (activeChat) {
      const chatMessagesRef = ref(db, `conversations/${activeChat}/messages`);
      const messagesListener = onValue(chatMessagesRef, (snapshot) => {
        const messagesData = snapshot.val();
        if (messagesData) {
          const messagesList = Object.keys(messagesData).map(key => ({
            id: key,
            data: messagesData[key]
          })).sort((a, b) => a.data.timestamp - b.data.timestamp);

          const updatedMessages = messagesList.map(message => {
            if (message.data.senderId !== userId && message.data.status === 'sent') {
              const messageRef = ref(db, `conversations/${activeChat}/messages/${message.id}/status`);
              update(messageRef, 'delivered').catch((error) => {
                console.error('Error updating message status to delivered:', error);
              });
            }
            return message;
          });

          setMessages(updatedMessages);
        } else {
          setMessages([]);
        }
      }, (error) => {
        console.error(`Error fetching messages for chat ID ${activeChat}:`, error);
        setMessages([]);
      });

      return () => {
        messagesListener();
      };
    } else {
      setMessages([]);
    }
  }, [activeChat, userId]); 

  const handleChatClick = (chatId) => {
    setActiveChat(chatId);
  };

  const sendMessage = (e) => {
    e.preventDefault();
    const messageInput = e.target.querySelector('input[type="text"]');
    const messageContent = messageInput.value.trim();

    if (messageContent === '') {
      return; 
    }

    const timestamp = Date.now();
    const newMessage = {
      senderId: userId,
      content: messageContent,
      timestamp: timestamp,
      status: 'sent'
    };

    const chatMessagesRef = ref(db, `conversations/${activeChat}/messages`);
    push(chatMessagesRef, newMessage)
      .then(() => {
        messageInput.value = '';

        const lastMessageRef = ref(db, `conversations/${activeChat}/lastMessage`);
        update(lastMessageRef, {
          content: messageContent,
          timestamp: timestamp
        }).catch((error) => {
          console.error('Error updating lastMessage:', error);
        });
      })
      .catch((error) => {
        console.error('Error sending message:', error);
      });
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleAddPersonToChat = (userId) => {
    const chatParticipantsRef = ref(db, `conversations/${activeChat}/participants`);
    update(chatParticipantsRef, {
      [userId]: { lastRead: 0 } 
    }).then(() => {
      setAnchorEl(null);
    }).catch((error) => {
      console.error('Error adding person to chat:', error);
    });
  };

  const handleLogout = () => {
    const userRef = ref(db, `signed_up_users/${userId}/lastOnline`);
    set(userRef, Date.now()).catch((error) => {
      console.error('Error updating lastOnline on logout:', error);
    });
  };

  return (
    <div className="chat">
      <div className="sidebar">
        <div className="sidebar__header">
          <Avatar />
          <div className="sidebar__headerRight">
            <IconButton>
              <SearchOutlined />
            </IconButton>
            <IconButton>
              <AttachFile />
            </IconButton>
            <IconButton onClick={handleMenuClick}>
              <MoreVert />
            </IconButton>
            <IconButton onClick={handleLogout}>
              <ExitToAppIcon />
            </IconButton>
          </div>
        </div>
        <div className="sidebar__chats">
          {sidebarChats.map((chat) => (
                        <div key={chat.chatId} className={`sidebarChat ${activeChat === chat.chatId ? 'active' : ''}`} onClick={() => handleChatClick(chat.chatId)}>
                        <Avatar />
                        <div className="sidebarChat__info">
                          <h2>{chat.roomName}</h2>
                          <p>{chat.lastMessage}</p>
                          <span className="sidebarChat__status">{onlineUsers[chat.chatId] ? 'Online' : ''}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
          
                <div className="chat__main">
                  <div className="chat__header">
                    <Avatar />
                    <div className="chat__headerInfo">
                      <h3>{activeChat}</h3>
                      <p>{onlineUsers[activeChat] ? 'Online' : `Last seen ${lastSeen}`}</p>
                    </div>
                    <div className="chat__headerRight">
                      <IconButton>
                        <SearchOutlined />
                      </IconButton>
                      <IconButton>
                        <AttachFile />
                      </IconButton>
                      <IconButton>
                        <MoreVert />
                      </IconButton>
                    </div>
                  </div>
          
                  <div className="chat__body">
                    {messages.map(({ id, data }) => (
                      <div key={id} className={`chat__message ${data.senderId === userId ? "chat__receiver" : ""}`}>
                        <span className="chat__name">{data.senderId}</span>
                        <p>{data.content}</p>
                        <span className="chat__timestamp">{new Date(data.timestamp).toUTCString()}</span>
                        <span className="chat__status">
                          {data.senderId === userId && (
                            <>
                              {data.status === 'sent' && <span>&#10003;</span>}
                              {data.status === 'delivered' && <span>&#10003;&#10003;</span>}
                              {data.status === 'read' && <span style={{ color: 'blue' }}>&#10003;&#10003;</span>}
                            </>
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
          
                  <div className="chat__footer">
                    <InsertEmoticonIcon />
                    <form onSubmit={sendMessage}>
                      <input
                        placeholder="Type a message"
                        type="text"
                      />
                      <button type="submit">
                        Send a message
                      </button>
                    </form>
                    <MicIcon />
                  </div>
                </div>
              </div>
            );
          };
          
          export default Chat;
          
