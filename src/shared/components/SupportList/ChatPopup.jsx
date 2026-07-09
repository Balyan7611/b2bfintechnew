import React, { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  closeChat,
  sendChatMessage,
  setChatInput,
} from '../../../store/slices/supportSlice';
import {
  FaTimes, FaPaperPlane, FaPaperclip, FaCheckCircle, FaTimesCircle,
} from 'react-icons/fa';
import styles from './ChatPopup.module.css';

const ChatPopup = ({ isMember }) => {
  const dispatch = useDispatch();
  const { isChatOpen, activeChatTicket, chatMessages, chatInput } = useSelector(s => s.support);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const messages = activeChatTicket ? (chatMessages[activeChatTicket.id] || []) : [];

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

  // ESC key to close
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape' && isChatOpen) dispatch(closeChat());
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isChatOpen, dispatch]);

  const handleSend = () => {
    const text = chatInput.trim();
    if (!text || !activeChatTicket) return;
    dispatch(sendChatMessage({ ticketId: activeChatTicket.id, text, sender: isMember ? 'member' : 'admin' }));
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
              {getInitials(activeChatTicket.name)}
            </div>
            <div className={styles.headerInfo}>
              <span className={styles.headerName}>{isMember ? 'Admin Support' : activeChatTicket.name}</span>
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
          {/* Date separator */}
          <div className={styles.dateSeparator}>
            <span className={styles.datePill}>Today</span>
          </div>

          {messages.map((msg, idx) => {
            const isMe = msg.sender === (isMember ? 'member' : 'admin');
            return (
              <div
                key={idx}
                className={`${styles.messageRow} ${isMe ? styles.messageRowAdmin : styles.messageRowUser}`}
              >
                {/* Avatar shown only beside other's messages */}
                {!isMe && (
                  <div className={styles.msgAvatar}>
                    {getInitials(isMember ? 'Admin' : activeChatTicket.name)}
                  </div>
                )}

                <div className={`${styles.bubble} ${isMe ? styles.bubbleAdmin : styles.bubbleUser}`}>
                  <p className={styles.bubbleText}>{msg.text}</p>
                  <span className={styles.bubbleTime}>{msg.time}</span>
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
