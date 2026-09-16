import React, { useState, useRef, useEffect } from "react";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import axios from "axios";
import config from '../config';

import ChatBotIcon from "../assets/chatbot.png";
//import ChatBotIcon from "../assets/chat.png";


import {
  Box,
  Paper,
  Typography,
  IconButton,
  TextField,
  Stack,
  Avatar,
  CircularProgress,
  styled,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Menu,
  MenuItem
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import CloseIcon from "@mui/icons-material/Close";
import { useParams } from "react-router-dom";
import { refreshAccessToken } from "./auth";

const Bubble = styled(Box)(({ theme }) => ({
  position: "fixed",
  bottom: "24px",
  right: "24px",
  height: "52px",
  padding: "0 18px",
  background: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
  borderRadius: "26px",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  gap: "8px",
  color: "#ffffff",
  cursor: "pointer",
  zIndex: 1100,
  transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
  boxShadow: "0 10px 25px -5px rgba(37, 99, 235, 0.4), 0 8px 10px -6px rgba(37, 99, 235, 0.2)",
  userSelect: "none",
  "&:hover": {
    transform: "translateY(-3px) scale(1.03)",
    boxShadow: "0 14px 28px -4px rgba(37, 99, 235, 0.5), 0 10px 12px -6px rgba(37, 99, 235, 0.3)",
    background: "linear-gradient(135deg, #1D4ED8 0%, #1E40AF 100%)",
  },
  "&:active": {
    transform: "translateY(0) scale(0.98)",
  }
}));


const ChatContainer = styled(Box)(({ theme }) => ({   
  position: "fixed",
  bottom: "24px",
  right: "24px",
  width: "calc(100vw - 32px)",
  maxWidth: "410px",
  height: "580px",
  maxHeight: "calc(100vh - 100px)",
  backgroundColor: "#ffffff",
  borderRadius: "20px",
  boxShadow: "0 20px 35px -5px rgba(0, 0, 0, 0.15), 0 10px 15px -5px rgba(0, 0, 0, 0.08)",
  border: "1px solid #E2E8F0",
  display: "flex",
  flexDirection: "column",
  zIndex: 1100,
  overflow: "hidden",
  animation: "chatSlideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
  "@keyframes chatSlideUp": {
    "0%": {
      opacity: 0,
      transform: "translateY(18px) scale(0.97)"
    },
    "100%": {
      opacity: 1,
      transform: "translateY(0) scale(1)"
    }
  }
}));

// The scrollable messages area
const MessagesContainer = styled(Box)(() => ({
  flex: 1,
  overflowY: "auto",
  padding: "16px 14px",
  backgroundColor: "#F8FAFC",
  display: "flex",
  flexDirection: "column",
  gap: "10px",

  "&::-webkit-scrollbar": {
    width: "6px",
  },
  "&::-webkit-scrollbar-track": {
    background: "transparent",
  },
  "&::-webkit-scrollbar-thumb": {
    background: "#CBD5E1",
    borderRadius: "10px",
  },
  "&::-webkit-scrollbar-thumb:hover": {
    background: "#94A3B8",
  },
  scrollbarWidth: "thin",
  scrollbarColor: "#CBD5E1 transparent",
}));

// A single chat "bubble"
const MessageBubble = styled(Paper)(({ theme, fromuser }) => ({
  boxShadow: fromuser
    ? "0 3px 10px rgba(37, 99, 235, 0.22)"
    : "0 2px 6px rgba(0, 0, 0, 0.05)",
  padding: "10px 14px",
  maxWidth: "80%",
  display: "inline-block",
  borderRadius: fromuser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
  fontSize: "0.875rem",
  lineHeight: "1.5",
  wordBreak: "break-word",
  ...(fromuser
    ? {
        background: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
        color: "#ffffff",
        border: "none",
      }
    : {
        backgroundColor: "#ffffff",
        color: "#1E293B",
        border: "1px solid #E2E8F0",
      }),
}));

// A row that includes the avatar + the bubble
const MessageRow = styled("div")(({ fromuser }) => ({
  display: "flex",
  flexDirection: fromuser ? "row-reverse" : "row",
  alignItems: "flex-end",
  gap: "8px",
  width: "100%",
}));

const TopBar = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "12px 16px",
  background: "linear-gradient(135deg, #1E293B 0%, #0F172A 100%)",
  color: "#ffffff",
  borderBottom: "1px solid #334155",
}));

// The message meta info (timestamp, etc.)
const MessageMeta = styled(Typography)(({ fromuser }) => ({
  fontSize: "0.68rem",
  color: fromuser ? "rgba(255, 255, 255, 0.75)" : "#94A3B8",
  marginTop: "4px",
  textAlign: fromuser ? "right" : "left",
}));

// The input area (text field + send button)
const InputContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: "10px 12px",
  borderTop: "1px solid #E2E8F0",
  backgroundColor: "#ffffff",
  gap: "8px",
}));

const ChatSection = ({ onNewDiagram, conversation, Chatdisabled }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [botTyping, setBotTyping] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false); // For toggling chat visibility
  const [anchorEl, setAnchorEl] = useState(null);
  const { encryptedID } = useParams();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (conversation) {
      const formattedMessages = conversation.map((msg) => ({
        text: msg.content,
        author: msg.message_type === "user" ? "user" : "bot",
        timestamp: new Date(msg.timestamp).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      }));
      setMessages(formattedMessages);
    }
  }, [conversation]);


  
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Send on "Enter"
  // const handleKeyDown = (e) => {
  //   if (e.key === "Enter") {
  //     handleSendMessage();
  //   }
  // };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      if (e.shiftKey) {
        e.preventDefault();
  
        // Get cursor position
        const { selectionStart, selectionEnd } = inputRef.current;
  
        // Insert "\n" at cursor position
        const newText =
          inputValue.substring(0, selectionStart) +
          "\n" +
          inputValue.substring(selectionEnd);
  
        // Update the state
        setInputValue(newText);
  
        // Move cursor back to the correct position AFTER the state updates
      //   setTimeout(() => {
      //     inputRef.current.selectionStart = inputRef.current.selectionEnd =
      //       selectionStart + 1;
      //   }, 0);
      // } else {
      //   e.preventDefault();
      //   handleSendMessage();
      // }
      setTimeout(() => {
        e.target.selectionStart = e.target.selectionEnd = selectionStart + 1;
      }, 0);
    } else {
      e.preventDefault();
      handleSendMessage();
    }
    }
  };
  const typeBotMessage = (messageId, fullText, index) => {
    if (index < fullText.length) {
      setTimeout(() => {
        setMessages((prev) =>
          prev.map((msg) => {
            if (msg.id === messageId) {
              return {
                ...msg,
                text: msg.text + fullText.charAt(index),
              };
            }
            return msg;
          })
        );
        typeBotMessage(messageId, fullText, index + 1);
      }, 10); // type speed
    } else {
      setBotTyping(false);
    }
  };

  // Main send function
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    // 1. User message
    const userMessage = {
      id: Date.now(),
      text: inputValue.trim(),
      author: "user",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");

    // 2. Prepare empty bot message
    setBotTyping(true);
    const botMessageId = Date.now() + 1;
    const botMessage = {
      id: botMessageId,
      text: "",
      author: "bot",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setMessages((prev) => [...prev, botMessage]);

    // 3. Call server
    let serverResponseText;
    try {
      const url = config.apiBaseUrl + "/bpmn/generate/";
      const response = await axios.post(
        url,
      {
        message: userMessage.text,
        encrypted_id: encryptedID
      },
      {
        headers: { "Content-Type": "application/json" },
        withCredentials: true
      }
      );

      serverResponseText = response.data.reply || "";

      // If there's BPMN XML from server
      if (response.data.XMLdiagram) {
      onNewDiagram(response.data.XMLdiagram);
      }
    } catch (error) {
      serverResponseText =
        error.response?.data?.reply ||
        error.response?.data?.error ||
        `Error: ${error.message || "Failed to contact server"}`;
      console.error("Chat request failed:", error.response?.data || error);
    }

    // 4. Animate bot response
    typeBotMessage(botMessageId, serverResponseText, 0);
  };

  
  const inputRef = useRef(null); //  this ref for the input field

  // for auto-focus
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);

  const handleDeleteConversation = async () => {
    setAnchorEl(null);
    setOpenConfirmDialog(true);
  };

  const handleConfirmDelete = async () => {
    setMessages([]); // Clear messages
    setOpenConfirmDialog(false);
    try {
      const token = await refreshAccessToken();
      const url = config.apiBaseUrl + "/bpmn/conversation/" + encryptedID;
      await axios.delete(url, 
        {
          headers: { 
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true
        }
      );
    } catch (error) {
      console.error('Failed to delete conversation:', error);
    }
  };

  return (
    <>
      {!isChatOpen && (
        <Bubble onClick={() => setIsChatOpen(true)}>
          <Avatar
            src={ChatBotIcon}
            alt="AI Bot"
            sx={{ width: 28, height: 28, backgroundColor: "transparent" }}
          />
          <Typography sx={{ fontWeight: 600, fontSize: "0.875rem", letterSpacing: "0.2px" }}>
            Assistant
          </Typography>
        </Bubble>
      )}
      {isChatOpen && (
        <ChatContainer>

        {/* Top Bar */}
        <TopBar>
          <Box display="flex" alignItems="center">
            {/* Menu Button */}
            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} size="small" sx={{ mr: 0.5, color: "white" }}>
              <MoreVertIcon fontSize="small" />
            </IconButton>
            
            {/* Avatar */}
            <Avatar
              src={ChatBotIcon}
              alt="Folix"
              sx={{ width: 32, height: 32, mr: 1.2, border: "2px solid rgba(255, 255, 255, 0.2)" }}
            />

            {/* Title */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.1 }}>
                Process Assistant
              </Typography>
              <Typography variant="caption" sx={{ color: "#94A3B8", fontSize: "0.7rem" }}>
                BPMN 2.0 Modeling Support
              </Typography>
            </Box>
          </Box>

          {/* Close Button */}
          <IconButton onClick={() => setIsChatOpen(false)} size="small" sx={{ color: "#94A3B8", "&:hover": { color: "#FFFFFF" } }}>
            <CloseIcon fontSize="small" />
          </IconButton>

          {/* Menu for Options */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
          >
            <MenuItem onClick={() => { setAnchorEl(null); setOpenConfirmDialog(true); }}>Delete Conversation</MenuItem>
          </Menu>
        </TopBar>

        {/* Messages */}
        <MessagesContainer>
          {messages.length === 0 && (
            <Box sx={{ textAlign: "center", py: 4, px: 2, color: "#64748B" }}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5, color: "#334155" }}>
                Process Assistant
              </Typography>
              <Typography variant="caption" sx={{ display: "block" }}>
                Describe your workflow to generate or modify diagram elements.
              </Typography>
            </Box>
          )}

          {messages.map((msg, idx) => {
            const fromuser = msg.author === "user";
            return (
              <MessageRow key={idx} fromuser={fromuser}>
                {!fromuser && (
                  <Avatar
                    sx={{ width: 28, height: 28, flexShrink: 0 }}
                    src={ChatBotIcon}
                    alt="Folix"
                  />
                )}

                <Box sx={{ maxWidth: "80%", display: "flex", flexDirection: "column", alignItems: fromuser ? "flex-end" : "flex-start" }}>
                  <MessageBubble elevation={0} fromuser={fromuser}>
                    <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", fontSize: "0.85rem" }}>
                      {msg.text}
                    </Typography>
                  </MessageBubble>
                  {msg.timestamp && (
                    <MessageMeta fromuser={fromuser}>
                      {msg.timestamp}
                    </MessageMeta>
                  )}
                </Box>
              </MessageRow>
            );
          })}

          {/* Bot "typing" indicator */}
          {botTyping && (
            <MessageRow fromuser={false}>
              <Avatar
                sx={{ width: 28, height: 28, flexShrink: 0 }}
                src={ChatBotIcon}
                alt="Folix"
              />
              <Paper
                elevation={0}
                sx={{
                  padding: "8px 14px",
                  borderRadius: "18px 18px 18px 4px",
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #E2E8F0",
                  color: "#64748B",
                }}
              >
                <Stack direction="row" alignItems="center" spacing={1}>
                  <CircularProgress size={12} thickness={5} sx={{ color: "#2563EB" }} />
                  <Typography variant="caption" sx={{ fontWeight: 500 }}>
                    Generating diagram...
                  </Typography>
                </Stack>
              </Paper>
            </MessageRow>
          )}

          <div ref={messagesEndRef} />
        </MessagesContainer>

        {/* Input & Send */}
        <InputContainer>
          <TextField
            variant="outlined"
            placeholder={Chatdisabled ? "Chat is disabled in view mode" : "Ask Folix to edit or create BPMN..."}
            disabled={Chatdisabled}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            size="small"
            fullWidth
            multiline
            maxRows={3}
            inputRef={inputRef}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "14px",
                backgroundColor: "#F8FAFC",
                fontSize: "0.85rem",
                "& fieldset": { borderColor: "#E2E8F0" },
                "&:hover fieldset": { borderColor: "#CBD5E1" },
                "&.Mui-focused fieldset": { borderColor: "#2563EB" },
              },
            }}
          />

          <IconButton
            disabled={Chatdisabled || !inputValue.trim()}
            onClick={handleSendMessage}
            sx={{
              backgroundColor: inputValue.trim() ? "#2563EB" : "#F1F5F9",
              color: inputValue.trim() ? "#FFFFFF" : "#94A3B8",
              width: 38,
              height: 38,
              flexShrink: 0,
              borderRadius: "12px",
              "&:hover": {
                backgroundColor: inputValue.trim() ? "#1D4ED8" : "#F1F5F9",
              },
            }}
          >
            <SendIcon sx={{ fontSize: "1.1rem" }} />
          </IconButton>
        </InputContainer>

  <Dialog
    open={openConfirmDialog}
    onClose={() => setOpenConfirmDialog(false)}
  >
    <DialogTitle>Confirm Delete</DialogTitle>
    <DialogContent>
      <DialogContentText>
        Are you sure you want to delete this conversation? This action cannot be undone.
      </DialogContentText>
    </DialogContent>
    <DialogActions>
      <Button onClick={() => setOpenConfirmDialog(false)}>Cancel</Button>
      <Button onClick={handleConfirmDelete} color="error" autoFocus>
        Delete
      </Button>
    </DialogActions>
  </Dialog>
    </ChatContainer>
      )}
    </>
  );
};

export default ChatSection;
