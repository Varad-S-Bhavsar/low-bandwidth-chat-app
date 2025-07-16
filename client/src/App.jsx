import React, { useState, useEffect, useRef } from 'react';
import { socket } from './socket';
import { compress, decompress } from './utils';
import './App.css';

function App() {
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState('');
  const [ready, setReady] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const chatRef = useRef(null);

  useEffect(() => {
    socket.on('receive_message', (data) => {
      const msg = decompress(data);
      setMessages((prev) => [...prev, msg]);
    });

    socket.on('typing', (data) => {
      setTyping(data);
      setTimeout(() => setTyping(''), 1500);
    });

    return () => {
      socket.off('receive_message');
      socket.off('typing');
    };
  }, []);

  useEffect(() => {
    chatRef.current?.scrollTo(0, chatRef.current.scrollHeight);
  }, [messages]);

  const handleSend = () => {
    if (!message.trim()) return;
    const compressed = compress({ username, text: message });
    socket.emit('send_message', compressed);
    setMessage('');
  };

  const handleKey = (e) => {
    if (e.key === 'Enter') handleSend();
    else socket.emit('typing', `${username} is typing...`);
  };

  const enterChat = () => {
    if (!username.trim()) return;
    setReady(true);
    localStorage.setItem('chatUser', username);
  };

  useEffect(() => {
    const saved = localStorage.getItem('chatUser');
    if (saved) {
      setUsername(saved);
      setReady(true);
    }
  }, []);

  return (
    <div className={`app ${darkMode ? 'dark' : ''}`}>
      <div className="sidebar">
        <h2>💬 LOW-B CHAT</h2>
        <div style={{ display: 'flex', gap: '10px', marginTop: '20px', flexWrap: 'wrap' }}>
          <button onClick={() => setDarkMode(!darkMode)} className="toggle">
            {darkMode ? '🌞 Light' : '🌙 Dark'}
          </button>
          {ready && (
            <button
              onClick={() => {
                setUsername('');
                setReady(false);
                localStorage.removeItem('chatUser');
              }}
              className="toggle"
            >
              🚪 Logout
            </button>
          )}
        </div>
      </div>

      <div className="main">
        {!ready ? (
          <div className="login-box">
            <input
              placeholder="Enter your name"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && enterChat()}
            />
            <button onClick={enterChat}>Join Chat</button>
          </div>
        ) : (
          <>
            <div ref={chatRef} className="chat-box">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`bubble ${m.username === username ? 'you' : 'other'} fade-in`}
                >
                  <span className="bubble-user">[{m.username}]</span>
                  <span>{m.text}</span>
                </div>
              ))}
            </div>

            {typing && <div className="typing">{typing}</div>}

            <div className="input-box">
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Type your message..."
              />
              <button onClick={handleSend}>Send</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
