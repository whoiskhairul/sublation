import React, { useState, useRef, useEffect } from "react";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import axios from "axios";
import ChatBotIcon from "../../assets/chatbot.png";
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
import { refreshAccessToken } from "../auth";
import config from "../../config";

const Bubble = styled(Box)(({ theme }) => ({
  position: "fixed",
  bottom: "60px",
  right: "37px",
  width: "60px",
  height: "60px",
  backgroundColor: theme.palette.primary.main,
  borderRadius: "50%",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  color: "white",
  cursor: "pointer",
  zIndex: 1000,
  boxShadow: "0px 4px 10px rgba(0,0,0,0.3)",
}));

const ChatContainer = styled(Box)(({ theme }) => ({
  position: "fixed",
  bottom: "5px",
  right: "20px",
  top:"10x",
  width: "80%", // Default to full width on small screens
  maxWidth: "400px", // Cap the width for larger screens
  height: "40%", // Dynamic height: half the viewport height
  maxHeight: "500px", // Cap the height for larger screens
  backgroundColor: "white",
  border: "1px solid #ccc",
  borderRadius: "20px 20px 0 0",
  boxShadow: "0px 4px 10px rgba(0,0,0,0.3)",
  display: "flex",
  marginTop:"3px",
  flexDirection: "column",
  zIndex: 1000,
  [theme.breakpoints.up("sm")]: {
    width: "400px", // Set specific width for medium+ screens
    height: "500px", // Set specific height for medium+ screens
  },
}));

// The scrollable messages area
const MessagesContainer = styled(Box)(() => ({
  flex: 1,
  overflowY: "auto",
  padding: "0.5rem",

  /* Scrollbar styles for modern browsers */
  "&::-webkit-scrollbar": {
    width: "8px", // Thin scrollbar
    height: "8px", // Optional: for horizontal scrollbar
  },
  "&::-webkit-scrollbar-track": {
    background: "transparent", // Subtle or transparent track
  },
  "&::-webkit-scrollbar-thumb": {
    background: "rgba(0, 0, 0, 0.2)", // Light gray thumb
    borderRadius: "10px", // Rounded corners
  },
  "&::-webkit-scrollbar-thumb:hover": {
    background: "rgba(0, 0, 0, 0.4)", // Slightly darker thumb on hover
    
  },

  /* Firefox-specific styles */
  scrollbarWidth: "thin", // Thin scrollbar
  scrollbarColor: "rgba(0, 0, 0, 0.2) transparent", // Thumb and track colors
}));

// A single chat "bubble"
const MessageBubble = styled(Paper)(({ theme, fromuser }) => ({
  marginBottom: theme.spacing(1.5),
  padding: theme.spacing(1),
  maxWidth: "75%",
  display: "inline-block",
  borderRadius: 16,
  ...(fromuser
    ? {
        backgroundColor: theme.palette.primary.main,
        color: "#fff",
        alignSelf: "flex-end",
        borderTopRightRadius: 0,
      }
    : {
        backgroundColor: "#f1f1f1",
        color: theme.palette.text.primary,
        alignSelf: "flex-start",
        borderTopLeftRadius: 0,
      }),
}));

// A row that includes the avatar + the bubble
const MessageRow = styled("div")(({ fromuser }) => ({
  display: "flex",
  flexDirection: fromuser ? "row-reverse" : "row",
  alignItems: "flex-end",
  marginBottom: "8px",
}));

const TopBar = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: theme.spacing(1),
  borderBottom: "1px solid #ccc",
  backgroundColor: theme.palette.primary.main, // Updated background color
  color: theme.palette.primary.contrastText,  // Updated text color for better contrast
  width: "100%", // Ensures the top bar spans the full width of the container
}));

// The message meta info (timestamp, etc.)
const MessageMeta = styled(Typography)(({ theme }) => ({
  fontSize: "0.75rem",
  color: theme.palette.text.secondary,
  textAlign: "right",
  marginTop: theme.spacing(0.5),
}));

// The input area (text field + send button)
const InputContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  padding: theme.spacing(1),
  borderTop: "1px solid #ccc",
}));


// const TopBar = styled(Box)(({ theme }) => ({
//   display: "flex",
//   alignItems: "center",
//   justifyContent: "space-between",
//   padding: theme.spacing(1),
//   backgroundColor: theme.palette.primary.main,
//   color: theme.palette.primary.contrastText,
//   borderRadius: "10px 10px 0 0",
// }));

const ChatSection = ({ onNewDiagram, conversation }) => {
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
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSendMessage();
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
      text: inputValue,
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
      "Sorry, there was a problem contacting the server.";
      console.error(error);
    }

    // 4. Animate bot response
    typeBotMessage(botMessageId, serverResponseText, 0);
  };

  
  const inputRef = useRef(null); // Add this ref for the input field

  // Add useEffect for auto-focus
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
      await axios.delete(`${config.apiBaseUrl}/bpmn/conversation/${encryptedID}`, 
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
          💬
        </Bubble>
      )}
      {isChatOpen && (
        <ChatContainer>

        {/* Top Bar */}
        <TopBar>
  <Box display="flex" alignItems="center">
    {/* Menu Button */}
    <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} size="small" sx={{ mr: 1 }}>
      <MoreVertIcon />
    </IconButton>
    
    {/* Avatar */}
    <Avatar
      src={ChatBotIcon} // Replace this with the path to your image/logo
      alt="Folia Logo"
      sx={{ width: 30, height: 30, mr: 1 }} // Adjust size and spacing
    />

    {/* Title */}
    <Typography variant="h6" sx={{ fontSize: "1rem", fontWeight: 500 }}>
      Folix
    </Typography>
  </Box>

  {/* Close Button */}
  <IconButton onClick={() => setIsChatOpen(false)} size="small">
    <CloseIcon style={{ color: "white" }} />
  </IconButton>

  {/* Menu for Options */}
  <Menu
    anchorEl={anchorEl}
    open={Boolean(anchorEl)}
    onClose={() => setAnchorEl(null)}
  >
    <MenuItem onClick={() => setOpenConfirmDialog(true)}>Delete Conversation</MenuItem>
  </Menu>
</TopBar>



        {/* Messages */}
      <MessagesContainer>
        {messages.map((msg) => {
          const fromuser = msg.author === "user";
          return (
            // <MessageRow key={msg.id} fromuser={fromuser}>
            //   {/* Avatar */}
            //   <Avatar
            //     sx={{ margin: "0 8px" }}
            //     style={fromuser ? { backgroundColor: "#1976d2" } : {}}
            //   >
            //     {fromuser ? <PersonIcon /> : <SmartToyIcon />}
            //   </Avatar>

            <MessageRow key={msg.id} fromuser={fromuser}>
              {/* Avatar */}
              {!fromuser && ( // Only render the avatar for bot messages
                <Avatar
                  sx={{ margin: "0 8px" }}
                  src={ChatBotIcon} // Use the Folia logo for the bot's avatar
                  alt="Folia Logo"
                />
              )}


              {/* Bubble */}
              <MessageBubble elevation={2} fromuser={fromuser}>
                <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
                  {msg.text}
                </Typography>
                {/* <MessageMeta>{msg.timestamp}</MessageMeta> */}
              </MessageBubble>
            </MessageRow>
          );
        })}

        {/* Bot "typing" indicator (optional) */}
        {botTyping && (
          <MessageRow fromuser={false} style={{ marginBottom: 16 }}>
            {/* <Avatar sx={{ margin: "0 8px" }}>
              <SmartToyIcon />
            </Avatar> */}
            <Paper
              sx={{
                padding: "8px 16px",
                borderRadius: 16,
                maxWidth: "75%",
                display: "inline-block",
                backgroundColor: "#f1f1f1",
                color: "text.primary",
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1}>
                <CircularProgress size={14} />
                <Typography variant="body2">
                  Thinking...
                </Typography>
              </Stack>
            </Paper>
          </MessageRow>
        )}

        <div ref={messagesEndRef} />
      </MessagesContainer>

      {/* Input & Send */}
      <InputContainer>
  {/* Attachment Button */}
          {/* <IconButton component="label">
            <AttachFileIcon />
            <input
              type="file"
              hidden
              onChange={handleFileUpload} // Logic for processing the uploaded file
            />
          </IconButton> */}

          {/* Message Input */}
          <TextField
            variant="outlined"
            placeholder="Type your message..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            size="small"
            fullWidth
          />

          {/* Send Button */}
          <IconButton
            color="primary"
            onClick={handleSendMessage}
            sx={{ marginLeft: 1 }}
          >
            <SendIcon />
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
