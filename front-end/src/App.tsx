import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import io from 'socket.io-client';
import { useForm, SubmitHandler } from "react-hook-form"
import PerfectScrollbar from 'perfect-scrollbar';
import 'mdb-ui-kit/css/mdb.min.css';
import 'perfect-scrollbar/css/perfect-scrollbar.css';

interface Message {
  id: number;
  text: string;
  sender: string;
  recipient: string;
  status: 'pending' | 'received';
  read: boolean;
  time: Date;
}
type Inputs = {
  message: string
  senderId: string
  recipient: string
}
const socket = io('http://localhost:5000');

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [user, setUser] = useState('User1');
  const chatBodyRef = useRef<HTMLDivElement>(null);
  const [collapse, setCollapse] = useState('');
  const {
    register,
    handleSubmit,
    resetField
  } = useForm<Inputs>()
  // Identificar o usuário ao conectar
  useEffect(() => {
    socket.emit('identify', user);
  }, [user]);

  // Carregar mensagens relevantes e escutar novas mensagens
  useEffect(() => {
    const loadMessagesHandler = (loadedMessages: Message[]) => {
      setMessages(loadedMessages);
    };

    const newMessageHandler = (newMessage: Message) => {
      setMessages(prevMessages => [...prevMessages, newMessage]);
    };

    const messageReadHandler = ({ id }: { id: number }) => {
      setMessages(prevMessages =>
        prevMessages.map(msg =>
          msg.id === id ? { ...msg, read: true } : msg
        )
      );
    };

    socket.on('loadMessages', loadMessagesHandler);
    socket.on('newMessage', newMessageHandler);
    socket.on('messageRead', messageReadHandler);

    return () => {
      socket.off('loadMessages', loadMessagesHandler);
      socket.off('newMessage', newMessageHandler);
      socket.off('messageRead', messageReadHandler);
    };
  }, []);

  useEffect(() => {
    if (chatBodyRef.current) {
      new PerfectScrollbar(chatBodyRef.current);
    }
  }, []);

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages]);

  const handleAddMessage = useCallback((message: string, userId: string, recipient: string) => {
    if (message.trim() === '') return;

    const newMessage: Message = {
      id: messages.length + 1,
      text: message,
      sender: userId,
      recipient: recipient,
      status: 'pending',
      read: false,
      time: new Date(),
    };

    // setMessages(prevMessages => [...prevMessages, newMessage]);
    socket.emit('sendMessage', newMessage);
  }, [messages.length]);

  const handleReadMessage = async (id: number) => {
    try {
      await fetch('http://localhost:5000/read-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, username: user }),
      });
    } catch (error) {
      console.error('Failed to mark message as read', error);
    }
  };
  const onsubmit: SubmitHandler<Inputs> = (data: Inputs) => {
    handleAddMessage(data.message, data.senderId, data.recipient);
    resetField('message')
  }
  const chatMessages = useMemo(() => messages.map((message, i) => {
    const orientation = message.sender !== user ? `justify-content-start` : 'justify-content-end mb-4 pt-1';
    const avatar = message.sender !== user ? `ava2-bg.webp` : 'ava5-bg.webp';
    const lastItem = i == messages.length - 1
    if (message.recipient == user || message.recipient == 'all') {
      if (!message.read)
        handleReadMessage(message.id)
    }
    return (
      <div key={i} className={`d-flex flex-row ${orientation}`}>
        <img src={`https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/${avatar}`}
          alt="avatar 1" style={{ width: "25px", height: "100%" }} />
        <div>
          <p className="small ms-3 rounded-3 text-muted"
            style={{ fontSize: 8 }}
          >{new Date(message?.time).toLocaleString()}</p>

          <p className={`small pb-2 px-2 ms-3 mb-1 rounded-3 bg-body-tertiary  ${message.read ? 'text-muted' : ''}`}>{message.text}</p>

          {lastItem && <p className="small ms-3 mb-3 rounded-3 text-muted text-end"
            style={{ fontSize: 8 }}
          > <span className={!message.read ? 'text-secondary' : 'text-info'}>{message.read ? 'Read' : 'Sent'}</span></p>}

        </div>
      </div>
    );
  }), [messages, user]);

  return (
    <>
      <div style={{ padding: '20px' }}>
        <h1>Event-Driven Chat App</h1>
      </div>
      <section>
        <div className="container py-5">
          <div className="row d-flex justify-content-center">
            <div className="col-md-12 col-lg-12 col-xl-12">
              <a
                data-mdb-ripple-init
                className="btn btn-info btn-lg btn-block"
                data-mdb-collapse-init
                href="#collapseExample"
                role="button"
                aria-expanded="false"
                aria-controls="collapseExample"
                onClick={() => setCollapse(collapse ? '' : 'collapse')}
              >
                <div className="d-flex justify-content-between align-items-center">
                  <span>Collapsible Chat App</span>
                  <i className="fas fa-chevron-down"></i>
                </div>
              </a>

              <div className={`${collapse} mt-3`} id="collapseExample">
                <div className="card" id="chat4">
                  <div
                    className="card-body"
                    ref={chatBodyRef}
                    style={{ position: "relative", height: "400px", overflowY: "auto" }}
                  >
                    {chatMessages}
                  </div>
                  <form
                    onSubmit={handleSubmit(onsubmit)}
                    className="card-footer text-muted d-flex justify-content-start align-items-center p-3">
                    <img
                      src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava5-bg.webp"
                      alt="avatar 3"
                      style={{ width: "40px", height: "100%" }}
                    />
                    <select
                      value={user}
                      {...register('senderId', { required: true })}
                      onChange={(e) => setUser(e.target.value)}
                    >
                      <option value="User1">User1</option>
                      <option value="User2">User2</option>
                      <option value="User3">User3</option>
                    </select>
                    <textarea
                      className="form-control form-control-lg mx-1"
                      id="messageContent"
                      {...register('message', { required: true })}
                      placeholder="Type message"
                    />
                    <select
                      {...register('recipient', { required: true })}
                    >
                      <option value="all">All</option>
                      <option value="User1">User1</option>
                      <option value="User2">User2</option>
                      <option value="User3">User3</option>
                    </select>
                    <button className="btn btn-outline-secondary" type="submit">
                      <i className="fas fa-paper-plane"></i>
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default App;
