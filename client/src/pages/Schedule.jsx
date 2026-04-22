import AnimatedPage from '../components/AnimatedPage';
import { FaInbox, FaReply, FaCalendarAlt, FaClock, FaCheckCircle, FaExclamationCircle, FaPaperPlane } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import TaskModal from '../components/TaskModal';
import useAdaptivePolling from '../hooks/useAdaptivePolling';
import useDocumentTitle from '../hooks/useDocumentTitle';

export default function Schedule() {
  useDocumentTitle('Schedule | Co-Spaces');
  const { currentUser } = useSelector((state) => state.user);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [activeContactId, setActiveContactId] = useState(null);
  const messagesEndRef = useRef(null);

  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', date: '', time: '' });

  const fetchMessages = async () => {
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/message/all`);
      setMessages(data);
    } catch (error) {
      toast.error('Failed to load messages');
    } finally {
       setLoading(false);
    }
  };

  const fetchTasks = async () => {
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/task/all`);
      setUpcomingEvents(data);
    } catch (error) {
      console.log('Failed to fetch tasks');
    }
  };

  useEffect(() => {
    fetchMessages();
    fetchTasks();
  }, []);

  // Use Adaptive Polling for new messages
  const handleNewMessages = (newMessages) => {
    if (newMessages && newMessages.length > 0) {
      setMessages((prev) => {
        const existingIds = new Set(prev.map(m => m._id));
        const actuallyNew = newMessages.filter(m => !existingIds.has(m._id));
        
        if (actuallyNew.length === 0) return prev; // no real new messages
        
        // Show a toast if any of these new messages are NOT from the current user
        const newFromOthers = actuallyNew.filter(m => m.sender._id !== currentUser._id);
        if (newFromOthers.length > 0) {
            toast(`✉️ New message: ${newFromOthers[0].content.substring(0, 30)}...`, {
                duration: 4000,
                icon: '💬'
            });
        }
        
        return [...prev, ...actuallyNew];
      });
    }
  };

  const { resetPolling } = useAdaptivePolling(`${import.meta.env.VITE_API_BASE_URL}/api/message/new`, handleNewMessages, !!currentUser);

  // Scroll to bottom when thread changes or new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeContactId]);

  // Group messages by contact
  const threads = {};
  messages.forEach(msg => {
    const isSender = msg.sender._id === currentUser._id;
    const otherUser = isSender ? msg.receiver : msg.sender;
    const contactId = otherUser._id;
    
    if (!threads[contactId]) {
      threads[contactId] = {
        contact: otherUser,
        messages: [],
        unreadCount: 0,
        listing: msg.listing
      };
    }
    
    // Sort logic will just append if they come sorted from DB, but we do order them explicitly later
    threads[contactId].messages.push(msg);
    if (!msg.read && !isSender) {
      threads[contactId].unreadCount++;
    }
  });

  const threadList = Object.values(threads).map(t => ({
    ...t,
    // Sort thread messages oldest to newest
    messages: t.messages.sort((a,b) => new Date(a.createdAt) - new Date(b.createdAt))
  })).sort((a, b) => {
    // Sort threads by newest message
    const aLast = a.messages[a.messages.length - 1];
    const bLast = b.messages[b.messages.length - 1];
    return new Date(bLast.createdAt) - new Date(aLast.createdAt);
  });

  const activeThread = activeContactId ? threadList.find(t => t.contact._id === activeContactId) : null;

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !activeThread) return;
    
    const lastMessage = activeThread.messages[activeThread.messages.length - 1];
    
    try {
      const { data } = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/message/send`, {
        receiverId: activeThread.contact._id,
        listingId: lastMessage.listing?._id,
        content: replyText
      });
      setReplyText('');
      
      // Update local state immediately for a snappy feel
      setMessages((prev) => [...prev, data]);
      // Reset polling interval to check for immediate replies
      resetPolling(); 
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  const selectThread = async (thread) => {
    setActiveContactId(thread.contact._id);
    setReplyText('');
    
    // Mark all unread from this contact as read
    const unreadMessages = thread.messages.filter(m => !m.read && m.receiver._id === currentUser._id);
    if (unreadMessages.length > 0) {
       for (let msg of unreadMessages) {
         try {
           await axios.put(`${import.meta.env.VITE_API_BASE_URL}/api/message/read/${msg._id}`);
         } catch(e) {}
       }
       fetchMessages();
    }
  };

  const handleDeleteConversation = async () => {
    if (!activeContactId) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/message/conversation/${activeContactId}`);
      toast.success('Conversation has been deleted from your inbox.');
      setActiveContactId(null);
      fetchMessages();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete conversation');
    }
  };

  const handleTaskCreated = (task) => {
    setUpcomingEvents([task, ...upcomingEvents]);
  };

  const handleMarkTaskDone = async (taskId) => {
    try {
      const { data } = await axios.put(`${import.meta.env.VITE_API_BASE_URL}/api/task/update/${taskId}`, { status: 'Done' });
      setUpcomingEvents(upcomingEvents.map(ev => ev._id === taskId ? data : ev));
    } catch (error) {
      toast.error('Failed to mark task as done');
    }
  };

  return (
    <AnimatedPage>
      <div className='min-h-screen pt-28 pb-10 px-4 max-w-6xl mx-auto'>
        <div className='flex flex-col sm:flex-row sm:items-end sm:justify-between mb-8 gap-4'>
          <div>
            <h1 className='text-3xl font-extrabold text-slate-900 mb-2'>Inbox & Schedule</h1>
            <p className='text-slate-500 font-light max-w-xl'>
              Manage your direct messages from clients and view your upcoming workspace events.
            </p>
          </div>
          <Link to='/dashboard' className='text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors self-start sm:self-auto flex items-center gap-2'>
            Go back to Dashboard
          </Link>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          
          {/* Main Inbox Area */}
          <div className='lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-[600px]'>
            <div className='px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3'>
               <FaInbox className='text-slate-400' size={20} />
               <h2 className='text-lg font-bold text-slate-800'>Direct Messages</h2>
            </div>
            
            <div className='flex flex-1 overflow-hidden'>
               {/* Contact List Pane */}
               <div className='w-1/3 border-r border-slate-100 overflow-y-auto custom-scrollbar bg-slate-50/30 flex flex-col'>
                 {loading ? (
                    <div className='p-6 text-center text-slate-400 text-sm'>Loading...</div>
                 ) : threadList.length === 0 ? (
                    <div className='p-6 text-center text-slate-400 text-sm'>No messages yet.</div>
                 ) : (
                    threadList.map((thread) => {
                      const lastMsg = thread.messages[thread.messages.length - 1];
                      const isActive = activeContactId === thread.contact._id;
                      
                      return (
                        <div 
                          key={thread.contact._id} 
                          onClick={() => selectThread(thread)}
                          className={`p-4 border-b border-slate-100 cursor-pointer transition-colors flex items-center gap-3 ${isActive ? 'bg-indigo-50 border-l-4 border-l-indigo-500' : 'hover:bg-white border-l-4 border-l-transparent'}`}
                        >
                          <div className='relative'>
                            <img src={thread.contact.avatar} className='w-10 h-10 rounded-full object-cover border border-slate-200' alt='avatar' />
                            {thread.unreadCount > 0 && (
                              <span className='absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm'>
                                {thread.unreadCount}
                              </span>
                            )}
                          </div>
                          <div className='flex-1 min-w-0'>
                            <div className='flex justify-between items-baseline mb-0.5'>
                              <span className={`text-sm truncate ${thread.unreadCount > 0 ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'}`}>
                                {thread.contact.username}
                              </span>
                            </div>
                            <p className={`text-[11px] truncate ${thread.unreadCount > 0 ? 'font-semibold text-slate-800' : 'text-slate-500'}`}>
                              {lastMsg.sender._id === currentUser._id ? 'You: ' : ''}{lastMsg.content}
                            </p>
                          </div>
                        </div>
                      )
                    })
                 )}
               </div>
               
               {/* Message Thread Pane */}
               <div className='w-2/3 flex flex-col bg-slate-50/50'>
                 {activeThread ? (
                    <>
                      {/* Thread Header */}
                      <div className='px-5 py-4 border-b border-slate-100 bg-white flex justify-between items-center z-10 shadow-sm'>
                        <div className='flex items-center gap-3'>
                          <img 
                            src={activeThread.contact.avatar} 
                            className='w-10 h-10 rounded-full object-cover border border-slate-200' alt='avatar' 
                          />
                          <div>
                            <p className='text-sm font-bold text-slate-900'>
                              {activeThread.contact.username}
                            </p>
                            {activeThread.listing && (
                              <Link to={`/listing/${activeThread.listing._id}`} className='text-[10px] text-indigo-600 hover:text-indigo-800 transition-colors block truncate max-w-[200px]'>
                                RE: {activeThread.listing.name}
                              </Link>
                            )}
                          </div>
                        </div>
                        <button onClick={handleDeleteConversation} className="text-[11px] font-bold text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors border border-transparent hover:border-red-100">
                          Delete Conversation
                        </button>
                      </div>
                      
                      {/* Chat History */}
                      <div className='flex-1 overflow-y-auto p-5 custom-scrollbar flex flex-col gap-4'>
                         {activeThread.messages.map(msg => {
                           const isMe = msg.sender._id === currentUser._id;
                           return (
                             <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                               <div className={`max-w-[75%] p-3.5 rounded-2xl shadow-sm ${isMe ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white text-slate-800 border border-slate-100 rounded-bl-none'}`}>
                                 <p className='text-[13px] leading-relaxed whitespace-pre-wrap'>{msg.content}</p>
                                 <p className={`text-[9px] mt-1 text-right ${isMe ? 'text-indigo-200' : 'text-slate-400'}`}>
                                   {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                 </p>
                               </div>
                             </div>
                           );
                         })}
                         <div ref={messagesEndRef} />
                      </div>
                      
                      {/* Chat Input */}
                      <div className='p-4 bg-white border-t border-slate-100'>
                        <form onSubmit={handleReply} className='flex items-end gap-2 bg-slate-50 border border-slate-200 rounded-2xl p-1.5 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-100 focus-within:border-indigo-400 transition-all'>
                          <textarea 
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleReply(e);
                              }
                            }}
                            className='flex-1 bg-transparent border-none focus:ring-0 resize-none max-h-32 text-sm p-2 custom-scrollbar'
                            rows='1'
                            placeholder='Type a message...'
                          ></textarea>
                          <button 
                            type='submit'
                            disabled={!replyText.trim()}
                            className='w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:bg-slate-300 shrink-0 mb-0.5 mr-0.5'
                            title='Send Message (Enter)'
                          >
                            <FaPaperPlane size={14} className='relative -left-0.5 ml-1' />
                          </button>
                        </form>
                        <p className='text-[9px] text-slate-400 mt-2 text-center'>Press <span className='font-bold bg-slate-100 px-1 py-0.5 rounded'>Enter</span> to send, <span className='font-bold bg-slate-100 px-1 py-0.5 rounded'>Shift + Enter</span> for new line</p>
                      </div>
                    </>
                 ) : (
                    <div className='flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center bg-white'>
                      <div className='w-24 h-24 mb-6 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 shadow-inner'>
                        <FaInbox size={40} className='text-slate-300' />
                      </div>
                      <h3 className='text-lg font-bold text-slate-800 mb-2'>Your Messages</h3>
                      <p className='text-sm text-slate-500 max-w-xs'>Select a conversation from the left to start viewing your thread history.</p>
                    </div>
                 )}
               </div>
            </div>
          </div>

          {/* Upcoming Snapshot Overview */}
          {currentUser?.role !== 'client' && (
            <div className='flex flex-col gap-6 lg:h-[600px]'>
              <div className='bg-slate-900 rounded-3xl p-6 text-white shadow-lg overflow-hidden relative'>
                <div className='absolute top-0 right-0 w-32 h-32 bg-white bg-opacity-[0.03] rounded-full -mr-10 -mt-10'></div>
                <div className='flex items-center justify-between mb-6 relative z-10'>
                  <h3 className='text-lg font-bold flex items-center gap-2'>
                    <FaClock className='text-indigo-400' /> Upcoming Week
                  </h3>
                  {['admin', 'superadmin'].includes(currentUser?.role) && (
                    <button onClick={() => setIsTaskModalOpen(true)} className='text-[10px] bg-white text-indigo-900 font-bold px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors'>
                      + Add Task
                    </button>
                  )}
                </div>
                
                <div className='flex flex-col gap-4 relative z-10 custom-scrollbar overflow-y-auto max-h-[300px]'>
                  {upcomingEvents.length === 0 ? (
                     <p className='text-xs text-slate-400'>No tasks for this week.</p>
                  ) : upcomingEvents.map(event => (
                  <div key={event._id} className='bg-slate-800/50 hover:bg-slate-800 transition-colors rounded-2xl p-4 border border-slate-700/50 backdrop-blur-md'>
                    <div className='flex items-start justify-between mb-2'>
                      <h4 className={`font-semibold text-sm truncate pr-4 ${event.status === 'Done' ? 'line-through text-slate-400' : ''}`}>{event.title}</h4>
                      <div className="flex items-center gap-2">
                        {event.status === 'Done' ? (
                          <FaCheckCircle className='text-emerald-400 shrink-0 mt-0.5' size={14} title="Done" />
                        ) : (
                          <FaExclamationCircle className='text-amber-400 shrink-0 mt-0.5' size={14} title="Pending" />
                        )}
                        {['admin', 'superadmin'].includes(currentUser?.role) && event.status !== 'Done' && (
                           <button onClick={() => handleMarkTaskDone(event._id)} className='text-[9px] bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500 hover:text-white transition-colors px-2 py-0.5 rounded'>
                             Done
                           </button>
                        )}
                      </div>
                    </div>
                    <div className='text-xs text-slate-400 flex flex-col gap-1'>
                      <span className='flex items-center gap-1.5'><FaCalendarAlt size={10} /> {event.date}</span>
                      <span className='flex items-center gap-1.5'><FaClock size={10} /> {event.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className='bg-indigo-50 border border-indigo-100 rounded-3xl p-6 relative overflow-hidden flex-1 flex flex-col justify-center'>
               <div className='relative z-10'>
                 <h3 className='text-indigo-900 font-bold mb-2'>Need to block days out?</h3>
                 <p className='text-indigo-700 text-xs mb-4 leading-relaxed'>
                   You can temporarily disable listings from your dashboard if your space is under maintenance or privately booked.
                 </p>
                 <Link to='/dashboard' className='text-xs font-bold text-white bg-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors inline-block'>
                   Go to Workspace Settings
                 </Link>
               </div>
               <div className='absolute -bottom-4 -right-4 opacity-10 text-indigo-900'>
                 <FaCalendarAlt size={100} />
               </div>
            </div>
          </div>
          )}
        </div>
      </div>

      <TaskModal 
        isOpen={isTaskModalOpen} 
        onClose={() => setIsTaskModalOpen(false)} 
        onTaskCreated={handleTaskCreated} 
      />
    </AnimatedPage>
  );
}
