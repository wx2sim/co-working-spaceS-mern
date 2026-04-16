import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: true 
    },
    date: { 
        type: String, 
        required: true 
    },
    time: { 
        type: String, 
        required: true 
    },
    status: { 
        type: String, 
        default: 'Pending' 
    }
}, { timestamps: true });

const Task = mongoose.model('Task', taskSchema); 

export default Task;
