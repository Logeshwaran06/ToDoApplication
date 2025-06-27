const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

const PORT = process.env.PORT || 8000;
const DB_URL = process.env.MONGO_URL;

app.use(cors());
app.use(express.json());

mongoose.connect(DB_URL, {useNewUrlParser: true, useUnifiedTopology: true})
    .then(() => console.log('MongoDB connected successfully!'))
    .catch(err => {console.error('MongoDB connection error: ', err)})

const Tasks = new mongoose.Schema({
    name: { type: String, required: true},
    completed: { type: Boolean, default: false },
    timestamp: { type: Date, default: Date.now }
})

const Task = mongoose.model('task', Tasks);

app.post('/tasks', async(req, res) => {
    try{
        console.log("Received Request Body:", req.body);
        
        const newTask = new Task(req.body);
        await newTask.save();
        res.status(201).json(newTask);
    }

    catch(error){
        console.error("Error creating task:", error);
        res.status(500).json({ error: 'Failed to create task' });
    }
})

app.get('/tasks', async(req, res) => {
    try{
        const tasks = await Task.find();
        res.status(200).json(tasks);
    }
    catch(error){
        res.status(500).json({ error: "Failed to fetch tasks"})
        
    }
})

app.delete('/tasks/:id', async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ message: "Task ID is required" });
        }

        const result = await Task.findByIdAndDelete(id); // Use the correct model name

        if (!result) {
            return res.status(404).json({ message: "Task not found" });
        }

        res.json({ message: "Task deleted successfully" });
    } catch (error) {
        console.error("Error deleting task:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

app.patch('/tasks/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { completed } = req.body;

        const updatedTask = await Task.findByIdAndUpdate(
            id,
            { completed },
            { new: true }
        );

        if (!updatedTask) {
            return res.status(404).json({ message: "Task not found" });
        }

        res.json(updatedTask);
    } catch (error) {
        console.error("Error updating task:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

app.listen(PORT, () => {
    console.log('server is listening on port: ', PORT);
})