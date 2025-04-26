import { useEffect, useState, useRef } from "react"
import axios from "axios"
import io from "socket.io-client"
import "./cchat.css"
import ChannelSummary from "./ChannelSummary"

const ChannelChat = ({ channel, wname }) => {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")
  const [typingUsers, setTypingUsers] = useState([])
  const [showSummary, setShowSummary] = useState(false)
  const userEmail = localStorage.getItem("email")

  // Extract username from email (everything before @)
  const userId = userEmail ? userEmail.split("@")[0] : "user"
  const messagesEndRef = useRef(null)
  const socketRef = useRef()

  // Connect to socket when component mounts
  useEffect(() => {
    socketRef.current = io("http://localhost:5001")

    // Join the channel room
    if (channel && wname) {
      socketRef.current.emit("joinChannel", { channelId: channel._id, workspaceName: wname })
    }

    // Listen for new messages
    socketRef.current.on("newMessage", (message) => {
      setMessages((prevMessages) => [...prevMessages, message])
    })

    // Listen for typing events
    socketRef.current.on("userTyping", ({ userId, isTyping }) => {
      console.log("Received userTyping event:", userId, isTyping)

      setTypingUsers((prevUsers) => {
        if (isTyping) {
          return [...new Set([...prevUsers, userId])] // Add user if typing
        } else {
          return prevUsers.filter((user) => user !== userId) // Remove if stopped typing
        }
      })
    })

    return () => {
      // Leave the channel and disconnect when component unmounts
      if (channel && wname) {
        socketRef.current.emit("leaveChannel", { channelId: channel._id, workspaceName: wname })
      }
      socketRef.current.disconnect()
    }
  }, [channel, wname])

  // Fetch messages when channel changes
  useEffect(() => {
    if (channel) {
      fetchMessages()
    }
  }, [channel])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const fetchMessages = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/workspaces/${wname}/channels/${channel._id}/messages`)
      setMessages(res.data)
    } catch (error) {
      console.error("Error fetching messages:", error)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim()) return

    try {
      // Emit stop typing event
      socketRef.current.emit("typing", {
        channelId: channel._id,
        workspaceName: wname,
        userId: userId,
        isTyping: false,
      })

      // Create message object
      const messageData = {
        senderId: userEmail,
        content: newMessage,
      }

      // Send through socket
      socketRef.current.emit("sendMessage", {
        channelId: channel._id,
        workspaceName: wname,
        message: messageData,
      })

      // Clear input (message will be added by the socket event)
      setNewMessage("")
    } catch (error) {
      console.error("Error sending message:", error)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      sendMessage()
    }
  }

  const handleTyping = (e) => {
    setNewMessage(e.target.value)

    const isTypingNow = e.target.value.trim() !== ""

    socketRef.current.emit("typing", {
      channelId: channel._id,
      workspaceName: wname,
      userId: userId,
      isTyping: isTypingNow,
    })
  }

  const toggleSummary = () => {
    setShowSummary(!showSummary)
  }

  const formatDate = (timestamp) => {
    const date = new Date(timestamp)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return `Today at ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday at ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
    } else {
      return `${date.toLocaleDateString()} at ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
    }
  }

  // Function to extract userId from email
  const extractUserId = (email) => {
    if (!email) return "unknown"
    return email.split("@")[0]
  }

  // Group messages by date
  const groupMessagesByDate = () => {
    const groups = []
    let currentDate = null

    messages.forEach((msg) => {
      const messageDate = new Date(msg.timestamp).toDateString()

      if (messageDate !== currentDate) {
        currentDate = messageDate
        const today = new Date().toDateString()
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)

        let dateLabel
        if (messageDate === today) {
          dateLabel = "Today"
        } else if (messageDate === yesterday.toDateString()) {
          dateLabel = "Yesterday"
        } else {
          dateLabel = new Date(msg.timestamp).toLocaleDateString()
        }

        groups.push({ type: "date", label: dateLabel })
      }

      groups.push({ type: "message", data: msg })
    })

    return groups
  }

  const groupedMessages = groupMessagesByDate()

  return (
    <div className="chat-container">
     <div className="chat-header">
  <h2>{channel?.name} Chat</h2>
  <div className="header-buttons" style={{ display: "flex", alignItems: "center" }}>
    <button 
      className="video-meeting-button" 
      onClick={() => window.location.href = '/videocall'}
      title="Start video meeting"
      style={{
        backgroundColor: "#4a86e8",
        color: "white",
        border: "none",
        borderRadius: "4px",
        padding: "8px 12px",
        marginRight: "10px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        fontSize: "14px"
      }}
    >
      <span style={{ marginRight: "5px" }}>📹</span> Video Meeting
    </button>
    <button 
      className="summary-button" 
      onClick={toggleSummary}
      title="Show conversation summary"
    >
      {showSummary ? "Hide Summary" : "Show Summary"}
    </button>
  </div>
</div>
      
      {showSummary && (
        <ChannelSummary 
          channelId={channel._id} 
          workspaceName={wname} 
          onClose={toggleSummary}
        />
      )}

      <div className="messages">
        {groupedMessages.map((item, index) => {
          if (item.type === "date") {
            return (
              <div key={`date-${index}`} className="date-separator">
                {item.label}
              </div>
            )
          } else {
            const msg = item.data
            return (
              <div
                key={`msg-${index}`}
                className={`message ${msg.sender.email === userEmail ? "own-message" : "other-message"}`}
              >
                <div className="message-header">
                  <span className="sender-name">{msg.sender.name || extractUserId(msg.sender.email)}</span>
                </div>
                <div className="message-content">{msg.content}</div>
                <div className="message-footer">
                  <span className="timestamp">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>
            )
          }
        })}

        {typingUsers.length > 0 && (
          <div className="typing-indicator">
            <span>
              {typingUsers.join(", ")} {typingUsers.length > 1 ? "are" : "is"} typing...
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
      <div className="chat-input-container">
        
        
        <div className="chat-input-row">
          <input
            type="text"
            className="chat-input"
            placeholder="Type a message..."
            value={newMessage}
            onChange={handleTyping}
            onKeyPress={handleKeyPress}
          />
          <button className="chat-send-button" onClick={sendMessage}>
            Send
          </button>
        </div>
      </div>
    </div>
  )
}

export default ChannelChat