import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { getContacts, getConversation, sendMessage, authFetchJson, API_BASE_URL } from "../services/api";

const getUserIdFromToken = (token) => {
  try {
    return JSON.parse(atob(token.split(".")[1])).user_id;
  } catch {
    return null;
  }
};

// Format timestamps (e.g., "À l'instant", "Il y a 2 min", "Hier")
const formatTimestamp = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const secondsAgo = Math.floor((now - date) / 1000);

  if (secondsAgo < 60) return "À l'instant";
  if (secondsAgo < 3600) return `Il y a ${Math.floor(secondsAgo / 60)}m`;
  if (secondsAgo < 86400) return `Il y a ${Math.floor(secondsAgo / 3600)}h`;
  
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return "Hier";
  
  return date.toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' });
};

export default function Messages() {
  const [contacts, setContacts] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("access");
    setCurrentUserId(token ? getUserIdFromToken(token) : null);
    loadContacts();
  }, []);

  // Auto-refresh messages every 3 seconds when a conversation is open
  useEffect(() => {
    if (!selectedUser) return;
    
    const interval = setInterval(() => {
      loadConversation(selectedUser.id);
    }, 3000);

    return () => clearInterval(interval);
  }, [selectedUser]);

  const loadContacts = async () => {
    try {
      const data = await getContacts();
      setContacts(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error("Impossible de charger les conversations");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadConversation = async (userId) => {
    try {
      const data = await getConversation(userId);
      setMessages(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
    }
  };

  // Mark unread messages as read
  const markMessagesAsRead = async (messagesToMark) => {
    const unreadMessages = messagesToMark.filter(
      (msg) => !msg.is_read && msg.receiver === currentUserId
    );

    for (const msg of unreadMessages) {
      try {
        await authFetchJson(`${API_BASE_URL}/messages/${msg.id}/`, {
          method: "PATCH",
          body: JSON.stringify({ is_read: true }),
        });
      } catch (error) {
        console.error("Failed to mark message as read:", error);
      }
    }
  };

  const handleSelectConversation = async (user) => {
    setSelectedUser(user);
    try {
      const data = await getConversation(user.id);
      const messagesArray = Array.isArray(data) ? data : [];
      setMessages(messagesArray);
      // Mark messages as read
      await markMessagesAsRead(messagesArray);
    } catch (error) {
      toast.error("Erreur lors du chargement des messages");
      console.error(error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedUser) return;

    try {
      console.log(selectedUser);
      await sendMessage(
  selectedUser.id,
  null,
  newMessage
);
      setNewMessage("");
      toast.success("Message envoyé");
      await loadConversation(selectedUser.id);
    } catch (error) {
      toast.error(error.message || "Erreur lors de l'envoi du message");
      console.error(error);
    }
  };

  return (
    <main className="messages-page">
      <style>
        {`
          .messages-page {
            min-height: 100vh;
            padding: 42px 24px;
            background: linear-gradient(135deg, #f8fafc 0%, #ecfdf5 50%, #ffffff 100%);
            color: #10201c;
            font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          }

          .messages-container {
            width: min(1200px, 100%);
            margin: 0 auto;
            display: grid;
            grid-template-columns: 350px 1fr;
            gap: 24px;
            height: calc(100vh - 84px);
          }

          .conversations-list {
            background: white;
            border-radius: 22px;
            border: 1px solid rgba(15, 118, 110, 0.12);
            box-shadow: 0 18px 45px rgba(15, 23, 42, 0.08);
            overflow: hidden;
          }

          .conversations-header {
            padding: 24px;
            border-bottom: 1px solid rgba(15, 118, 110, 0.12);
          }

          .conversations-title {
            margin: 0;
            font-size: 22px;
            font-weight: 900;
          }

          .conversation-item {
            padding: 20px 24px;
            border-bottom: 1px solid rgba(15, 118, 110, 0.08);
            cursor: pointer;
            transition: background 160ms ease;
          }

          .conversation-item:hover,
          .conversation-item.active {
            background: rgba(15, 118, 110, 0.04);
          }

          .conversation-name {
            margin: 0 0 6px;
            font-weight: 700;
            color: #0f172a;
          }

          .conversation-last-message {
            margin: 0;
            color: #64748b;
            font-size: 14px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .conversation-timestamp {
            margin: 0;
            color: #94a3b8;
            font-size: 12px;
          }

          .chat-area {
            background: white;
            border-radius: 22px;
            border: 1px solid rgba(15, 118, 110, 0.12);
            box-shadow: 0 18px 45px rgba(15, 23, 42, 0.08);
            display: flex;
            flex-direction: column;
            overflow: hidden;
          }

          .chat-header {
            padding: 24px;
            border-bottom: 1px solid rgba(15, 118, 110, 0.12);
          }

          .chat-title {
            margin: 0;
            font-size: 22px;
            font-weight: 900;
          }

          .messages-container {
            flex: 1;
            padding: 24px;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            gap: 16px;
          }

          .message {
            max-width: 70%;
            padding: 12px 16px;
            border-radius: 18px;
            font-size: 15px;
            line-height: 1.5;
          }

          .message.sent {
            align-self: flex-end;
            background: #0f766e;
            color: white;
          }

          .message.received {
            align-self: flex-start;
            background: #f1f5f9;
            color: #0f172a;
          }

          .message-sender {
            font-weight: 700;
            margin-bottom: 4px;
            font-size: 13px;
          }

          .message.sent .message-sender {
            color: #dcfce7;
          }

          .message.received .message-sender {
            color: #64748b;
          }

          .message-time {
            font-size: 12px;
            margin-top: 4px;
            opacity: 0.7;
          }

          .message.sent .message-time {
            color: #dcfce7;
          }

          .message.received .message-time {
            color: #64748b;
          }

          .message-input-area {
            padding: 24px;
            border-top: 1px solid rgba(15, 118, 110, 0.12);
            display: flex;
            gap: 12px;
          }

          .message-input {
            flex: 1;
            padding: 12px 16px;
            border: 1px solid rgba(15, 118, 110, 0.2);
            border-radius: 12px;
            background: #f8fafc;
            color: #0f172a;
            font-size: 16px;
            resize: none;
          }

          .message-input:focus {
            outline: none;
            border-color: #0f766e;
            box-shadow: 0 0 0 3px rgba(15, 118, 110, 0.1);
          }

          .send-button {
            padding: 12px 24px;
            border: 0;
            border-radius: 12px;
            background: #0f766e;
            color: white;
            font-size: 16px;
            font-weight: 900;
            cursor: pointer;
            transition: transform 160ms ease, background 160ms ease;
          }

          .send-button:hover {
            transform: translateY(-2px);
            background: #115e59;
          }

          .empty-state {
            display: grid;
            place-items: center;
            height: 100%;
            text-align: center;
            color: #64748b;
          }

          .empty-state h2 {
            margin: 0 0 10px;
            font-size: 25px;
          }

          .empty-state p {
            margin: 0;
            max-width: 300px;
            line-height: 1.6;
          }

          @media (max-width: 768px) {
            .messages-container {
              grid-template-columns: 1fr;
              height: auto;
            }

            .conversations-list {
              display: none;
            }

            .chat-area {
              height: 600px;
            }
          }
        `}
      </style>

      <div className="messages-container">
        <div className="conversations-list">
          <div className="conversations-header">
            <h1 className="conversations-title">Messages</h1>
          </div>

          {loading ? (
            <div className="empty-state">
              <div>
                <h2>Chargement...</h2>
              </div>
            </div>
          ) : contacts.length === 0 ? (
            <div className="empty-state">
              <div>
                <h2>Aucune conversation disponible.</h2>
                <p>Vous n'avez encore aucune conversation à afficher.</p>
              </div>
            </div>
          ) : (
            contacts.map((contact) => (
              <div
                key={contact.id}
                className={`conversation-item ${selectedUser?.id === contact.id ? 'active' : ''}`}
                onClick={() => handleSelectConversation(contact)}
              >
                <h3 className="conversation-name">{contact.name}</h3>
                <p className="conversation-last-message">{contact.lastMessage}</p>
                <p className="conversation-timestamp">{formatTimestamp(contact.timestamp)}</p>
              </div>
            ))
          )}
        </div>

        <div className="chat-area">
          {selectedUser ? (
            <>
              <div className="chat-header">
                <h2 className="chat-title">Conversation avec {selectedUser.name || selectedUser.username}</h2>
              </div>

              <div className="messages-container">
                {messages.length === 0 ? (
                  <div className="empty-state">
                    <div>
                      <h2>Aucun message</h2>
                      <p>Commencez la conversation avec votre coach.</p>
                    </div>
                  </div>
                ) : (
                  messages.map((message) => {
                    const isSender = currentUserId && message.sender === currentUserId;

                    return (
                      <div
                        key={message.id}
                        className={`message ${isSender ? 'sent' : 'received'}`}
                      >
                        {!isSender && (
                          <div className="message-sender">{message.sender_name}</div>
                        )}
                        <div>{message.content}</div>
                        <div className="message-time">{formatTimestamp(message.created_at)}</div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="message-input-area">
                <textarea
                  className="message-input"
                  placeholder="Tapez votre message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  rows={1}
                />
                <button
                  className="send-button"
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                >
                  Envoyer
                </button>
              </div>
            </>
          ) : (
            <div className="empty-state">
              <div>
                <h2>Sélectionnez un coach pour commencer.</h2>
                <p>Choisissez une conversation pour afficher et envoyer des messages.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}