import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function TaskModal({ isOpen, onClose, onTaskCreated, taskToEdit }) {
  const [newTask, setNewTask] = useState(taskToEdit ? { 
    title: taskToEdit.title, 
    date: taskToEdit.date, 
    time: taskToEdit.time 
  } : { title: '', date: '', time: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (taskToEdit) {
      setNewTask({ title: taskToEdit.title, date: taskToEdit.date, time: taskToEdit.time });
    } else {
      setNewTask({ title: '', date: '', time: '' });
    }
  }, [taskToEdit, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (taskToEdit) {
        const { data } = await axios.put(`/api/task/update/${taskToEdit._id}`, newTask);
        onTaskCreated(data); // Using same callback for simplicity
        toast.success('Task updated successfully');
      } else {
        const { data } = await axios.post('/api/task/create', newTask);
        onTaskCreated(data);
        setNewTask({ title: '', date: '', time: '' });
        toast.success('Task created successfully');
      }
      onClose();
    } catch (error) {
      toast.error(taskToEdit ? 'Failed to update task' : 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-xl">
         <h2 className="text-xl font-bold mb-4 text-slate-800">{taskToEdit ? 'Edit Task' : 'Add New Task'}</h2>
         <form onSubmit={handleSubmit} className="flex flex-col gap-4">
           <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Task Title</label>
              <input 
                type="text" 
                required 
                value={newTask.title} 
                onChange={e => setNewTask({...newTask, title: e.target.value})} 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-100" 
                placeholder="e.g. Server maintenance" 
              />
           </div>
           <div className="grid grid-cols-2 gap-3">
             <div>
                <label className="text-xs font-semibold text-slate-500 mb-1 block">Date</label>
                <input 
                    type="text" 
                    required 
                    value={newTask.date} 
                    onChange={e => setNewTask({...newTask, date: e.target.value})} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-100" 
                    placeholder="Oct 25, 2024" 
                />
             </div>
             <div>
                <label className="text-xs font-semibold text-slate-500 mb-1 block">Time</label>
                <input 
                    type="text" 
                    required 
                    value={newTask.time} 
                    onChange={e => setNewTask({...newTask, time: e.target.value})} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-100" 
                    placeholder="08:00 AM - ..." 
                />
             </div>
           </div>
           <div className="flex gap-2 mt-2">
             <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl font-bold text-sm text-slate-500 hover:bg-slate-100 transition-colors">Cancel</button>
             <button type="submit" disabled={loading} className="flex-1 py-2.5 rounded-xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-700 transition-colors disabled:opacity-50">
                {loading ? 'Creating...' : 'Create Task'}
             </button>
           </div>
         </form>
      </div>
    </div>
  );
}
