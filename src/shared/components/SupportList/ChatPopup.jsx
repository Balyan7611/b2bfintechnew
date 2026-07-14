import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { closeChat, setChatInput } from '../../../store/slices/supportSlice';
import { FaTimes, FaPaperPlane, FaPaperclip, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import styles from './ChatPopup.module.css';
import { API } from '../../../api/endpoints';

const ChatPopup = ({ isMember }) => {
  const dispatch = useDispatch();
  const { isChatOpen, activeChatTicket, chatInput } = useSelector(s => s.support);
  
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Parse session dynamically to get senderId
  const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
  let currentUserId = isMember ? 'MEM-1001' : 'AD1001';
  if (token) {
    try {
      const payloadBase64 = token.split('.')[1];
      if (payloadBase64) {
        const decoded = JSON.parse(atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/')));
        if (decoded.LoginId) currentUserId = decoded.LoginId;
        else if (decoded.sub) currentUserId = decoded.sub;
      }
    } catch (e) {}
  }

  const normalizeMessage = (m) => {
    if (!m) return null;
    return {
      ...m,
      message: m.message || m.Message || '',
      senderType: m.senderType || m.SenderType || '',
      senderId: m.senderId || m.SenderId || '',
      createdDate: m.createdDate || m.CreatedDate || m.CreatedOn || ''
    };
  };

  const fetchMessages = async () => {
    if (!activeChatTicket || !activeChatTicket.ticketId) return;
    try {
      const res = await API.ticketConversation.getByTicketId(activeChatTicket.ticketId);
      if (res && res.status && Array.isArray(res.data)) {
        setMessages(res.data.map(normalizeMessage));
      } else if (Array.isArray(res)) {
        setMessages(res.map(normalizeMessage));
      } else {
        setMessages([]);
      }
    } catch (err) {
      console.error("Failed to fetch chat messages from DB:", err);
    }
  };

  // Scroll to bottom on new messages
  useEffect(() => {
    if (isChatOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isChatOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isChatOpen) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isChatOpen]);

  // Load messages from DB and set polling interval
  useEffect(() => {
    if (isChatOpen && activeChatTicket) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [isChatOpen, activeChatTicket]);

  // ESC key to close
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape' && isChatOpen) dispatch(closeChat());
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isChatOpen, dispatch]);

  const handleSend = async () => {
    const text = chatInput.trim();
    if (!text || !activeChatTicket) return;
    try {
      await API.ticketConversation.create({
        ticketId: activeChatTicket.ticketId,
        senderType: isMember ? 'Member' : 'Admin',
        senderId: currentUserId,
        message: text
      });
      dispatch(setChatInput(''));
      fetchMessages();
    } catch (err) {
      console.error("Failed to send reply to DB:", err);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getInitials = (name = '') =>
    name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();

  if (!isChatOpen || !activeChatTicket) return null;

  return (
    <>
      {/* Backdrop */}
      <div className={styles.backdrop} onClick={() => dispatch(closeChat())} />

      {/* Popup */}
      <div className={styles.popup}>

        {/* Status Banner */}
        {activeChatTicket.status === 'Approved' && (
          <div className={styles.bannerApproved}>
            <FaCheckCircle /> Ticket Approved
          </div>
        )}
        {activeChatTicket.status === 'Rejected' && (
          <div className={styles.bannerRejected}>
            <FaTimesCircle /> Ticket Rejected
          </div>
        )}

        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.avatar}>
              {getInitials(isMember ? 'Admin Support' : (activeChatTicket.memberName || activeChatTicket.name))}
            </div>
            <div className={styles.headerInfo}>
              <span className={styles.headerName}>{isMember ? 'Admin Support' : (activeChatTicket.memberName || activeChatTicket.name)}</span>
              <span className={styles.headerTicket}>{activeChatTicket.ticketId}</span>
            </div>
          </div>
          <button className={styles.closeBtn} onClick={() => dispatch(closeChat())}>
            <FaTimes />
          </button>
        </div>

        {/* Online status bar */}
        <div className={styles.statusBar}>
          <span className={styles.statusDot} />
          Active Ticket
        </div>

        {/* Messages Area */}
        <div className={styles.messagesArea}>
          <div className={styles.dateSeparator}>
            <span className={styles.datePill}>History</span>
          </div>

          {messages.map((msg, idx) => {
            const isMe = (msg.senderType || '').toLowerCase() === (isMember ? 'member' : 'admin');
            return (
              <div
                key={idx}
                className={`${styles.messageRow} ${isMe ? styles.messageRowAdmin : styles.messageRowUser}`}
              >
                {!isMe && (
                  <div className={styles.msgAvatar}>
                    {getInitials(isMember ? 'Admin' : (activeChatTicket.memberName || activeChatTicket.name))}
                  </div>
                )}

                <div className={`${styles.bubble} ${isMe ? styles.bubbleAdmin : styles.bubbleUser}`}>
                  <p className={styles.bubbleText}>{msg.message}</p>
                  <span className={styles.bubbleTime}>
                    {msg.createdDate ? new Date(msg.createdDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </span>
                </div>
              </div>
            );
          })}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className={styles.inputBar}>
          <button className={styles.attachBtn} title="Attach file">
            <FaPaperclip />
          </button>

          <input
            ref={inputRef}
            type="text"
            className={styles.chatInput}
            placeholder="Type a message..."
            value={chatInput}
            onChange={e => dispatch(setChatInput(e.target.value))}
            onKeyDown={handleKeyDown}
          />

          <button
            className={styles.sendBtn}
            onClick={handleSend}
            disabled={!chatInput.trim()}
            title="Send"
          >
            <FaPaperPlane />
          </button>
        </div>
      </div>
    </>
  );
};

export default ChatPopup;
