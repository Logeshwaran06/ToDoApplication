import './App.css';  
import axios from 'axios';
import { useState, useEffect } from 'react';
import { PlusCircle, CheckCircle2, Circle, Trash2, StickyNote } from 'lucide-react';


export default function App() {
    const [tasks, setTasks] = useState([]);
    const [newTask, setNewTask] = useState('');
    const [isComplete, setIsComplete ] = useState(false);

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const response = await axios.get('http://localhost:8000/tasks');
                const fetchedTasks = response.data.map(task => ({
                    id: task._id, // Map MongoDB's _id to id
                    text: task.name,
                    completed: task.completed, // Fix the field name to match the backend
                    timestamp: task.timestamp || Date.now()
                }));
                setTasks(fetchedTasks);
            } catch (error) {
                console.error("Error fetching tasks:", error);
            }
        };
    
        fetchTasks();
    }, []);

    const categorizeTasks = () => {
        const todayTasks = [];
        const yesterdayTasks = [];
        const previousTasks = [];

        const today = new Date();
        const todayDate = new Date(today.setHours(0, 0, 0, 0)).getTime();
        const yesterdayDate = todayDate - 86400000;

        tasks.forEach(task => {
            const taskDate = new Date(task.timestamp).setHours(0, 0, 0, 0);
            if (taskDate === todayDate) {
                todayTasks.push(task);
            } else if (taskDate === yesterdayDate) {
                yesterdayTasks.push(task);
            } else {
                previousTasks.push(task);
            }
        });

        return { todayTasks, yesterdayTasks, previousTasks };
    };

    const { todayTasks, yesterdayTasks, previousTasks } = categorizeTasks();
    const completedTasksCount = tasks.filter(task => task.completed).length;

    const addTask = async () => {
        if (newTask.trim()) {
            const newTaskObj = { 
                id: Date.now(), 
                text: newTask, 
                completed: false, 
                timestamp: new Date().getTime()
            };
            
            setTasks([...tasks, newTaskObj]);

            try {
                await axios.post('http://localhost:8000/tasks', {
                    name: newTask,  
                    complete: false
                });
            } catch (error) {
                console.error("Error adding task:", error);
            }
        }
        setNewTask('');
    };

    const toggleTask = async (id) => {
        const taskToUpdate = tasks.find(task => task.id === id);
        if (!taskToUpdate) return;
    
        const updatedTask = { ...taskToUpdate, completed: !taskToUpdate.completed };
    
        try {
            // Update the task in the database
            await axios.patch(`http://localhost:8000/tasks/${id}`, {
                completed: updatedTask.completed,
            });
    
            // Update the task in the frontend state
            setTasks(tasks.map(task =>
                task.id === id ? updatedTask : task
            ));
        } catch (error) {
            console.error("Error updating task:", error);
        }
    };

    const deleteTask = async (id) => {
        try {
            console.log("Deleting task with ID:", id);
    
            setTasks(tasks.filter(task => task.id !== id));
            await axios.delete(`http://localhost:8000/tasks/${id}`);
        } catch (error) {
            console.error("Error deleting task:", error);
        }
    }; 

    const TaskItem = ({ task, toggleTask, deleteTask }) => (
        <div className="taskContainer">
            {task.completed ? (
                <CheckCircle2 className="circleIcon" size={20}  onClick={() => toggleTask(task.id)} />
            ) : (
                <Circle className="circleIcon" size={20} onClick={() => toggleTask(task.id)} />
            )}
            
            <div className="taskItem">
            <span className={`taskName ${task.completed ? 'completed' : ''}`} onClick={() => toggleTask(task.id)}>
                {task.text}
            </span>

                <Trash2 className="trashIcon" size={20} onClick={() => deleteTask(task.id)} />
            </div>
        </div>
    );

    return (
        <div className="container">
            <div className="headerTag">
                <div className='header'>
                    <StickyNote className='StickyNote' width={30} height={40}/>
                    <h1 className='heading'>To Do Application</h1>
                </div>
                <div className='inputContainer'>
                    <input 
                        type="text" 
                        className='input'
                        placeholder="Add a new task.." 
                        value={newTask} 
                        onChange={e => setNewTask(e.target.value)} 
                        onKeyDown={e => e.key === 'Enter' && addTask()}
                    />
                    <button className='btn' onClick={addTask}>
                        <PlusCircle className='addIcon' width={30} height={30} />
                        Add
                    </button>
                </div>
            </div>

            {tasks.length > 0 ? (
                <>
                    <div className='scrollBar'>
                        {todayTasks.length > 0 && <h3>Today</h3>}
                        {todayTasks.map(task => (
                            <TaskItem key={task.id} task={task} toggleTask={toggleTask} deleteTask={deleteTask} />
                        ))}

                        {yesterdayTasks.length > 0 && <h3>Yesterday</h3>}
                        {yesterdayTasks.map(task => (
                            <TaskItem key={task.id} task={task} toggleTask={toggleTask} deleteTask={deleteTask} />
                        ))}

                        {previousTasks.length > 0 && <h3>Previous Days</h3>}
                        {previousTasks.map(task => (
                            <TaskItem key={task.id} task={task} toggleTask={toggleTask} deleteTask={deleteTask} />
                        ))}
                    </div>

                    <div className="footer">
                        <p>{completedTasksCount} of {tasks.length} tasks completed</p>
                    </div>
                </>
            ) : (
                <div className="displayTask">
                    <p className='displayText'>No tasks yet. Add one to get started!</p>
                </div>
            )}
        </div>
    );
}