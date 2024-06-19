# Chat Application

A real-time chat application allowing users to sign up, log in, and engage in conversations. The application leverages Firebase for real-time database management and synchronization.

## Features

- **User Authentication**: Users can sign up and log in with a unique user ID and password.
- **Multiple Chats**: Users can participate in multiple chat conversations.
- **Real-time Updates**: Messages and user statuses are updated in real-time.
- **Conversation Management**: Each conversation includes participants, messages, and the last message details.
- **User Interface**: Sidebar displays active chats, and the main chat window shows messages with timestamps.

## Functional Requirements

1. **User Authentication and Management**:
    - Users can sign up with a unique `user_id` and password.
    - Login requires validation against `signed_up_users`.

2. **Chat Functionality**:
    - Users can participate in multiple chats.
    - Chat details are stored in `user_chats` with references to `chatId`.
    - Each `chatId` links to a conversation stored in `conversations`.

3. **Conversation Management**:
    - Conversations (`conversations`) store messages, participants, and last message details.
    - Messages include `senderId`, `content`, `timestamp`, and status (`sent`, `delivered`, `read`).

4. **Real-time Updates**:
    - Online status and last seen are updated every 5 seconds in `signed_up_users`.
    - Chat messages are synced in real-time using Firebase's capabilities.

5. **User Interface**:
    - Chat page displays a sidebar with active chats.
    - Main chat window shows messages with timestamps aligned based on sender.

6. **Notifications**:
    - Message statuses (`sent`, `delivered`, `read`) are updated based on receiver actions.
    - Visual indicators (ticks) show message delivery and read statuses.

## Database Schema

### `signed_up_users`
```json
{
  "signed_up_users": {
    "userId1": {
      "email": "user1@example.com",
      "password": "hashedPassword",
      "name": "User 1",
      "photoURL": "https://example.com/user1.jpg",
      "lastOnline": 1624440000
    },
    "userId2": {
      "email": "user2@example.com",
      "password": "hashedPassword",
      "name": "User 2",
      "photoURL": "https://example.com/user2.jpg",
      "lastOnline": 1624441200
    }
  },
  "user_chats": {
    "userId1": {
      "username": "User 2",
      "chats": ["chatId1", "chatId2"]
    },
    "userId2": {
      "username": "User 1",
      "chats": ["chatId1"]
    }
  },
  "conversations": {
    "chatId1": {
      "participants": {
        "userId1": {
          "lastRead": 1624376400
        },
        "userId2": {
          "lastRead": 1624380000
        }
      },
      "messages": {
        "messageId1": {
          "senderId": "userId1",
          "content": "Hello User 2!",
          "timestamp": 1624372800,
          "status": "read"
        },
        "messageId2": {
          "senderId": "userId2",
          "content": "Hi User 1!",
          "timestamp": 1624376400,
          "status": "read"
        }
      },
      "lastMessage": {
        "content": "How are you?",
        "timestamp": 1624378800
      }
    },
    "chatId2": {
      "participants": {
        "userId1": {
          "lastRead": 1624383600
        },
        "userId3": {
          "lastRead": 1624387200
        }
      },
      "messages": {
        "messageId1": {
          "senderId": "userId1",
          "content": "Hey User 3!",
          "timestamp": 1624380000,
          "status": "sent"
        },
        "messageId2": {
          "senderId": "userId3",
          "content": "Hi User 1!",
          "timestamp": 1624383600,
          "status": "delivered"
        }
      },
      "lastMessage": {
        "content": "Hi User 1!",
        "timestamp": 1624383600
      }
    }
  }
}```
