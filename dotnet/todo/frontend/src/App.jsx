import { useState, useEffect } from 'react';
import TaskItem from './components/TaskItem';
import './App.css';

const API_URL = 'http://localhost:5150/tasks'; // API URL/port

function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskContent, setNewTaskContent] = useState('');
  const [error, setError] = useState(null);

  const fetchTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setTasks(data);
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to fetch tasks. Is the API running?');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask = {
      title: newTaskTitle.trim(),
      content: newTaskContent.trim(),
      concluded: false,
    };

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTask),
      });

      if (!response.ok) {
        throw new Error(`Failed to create task: ${response.statusText}`);
      }

      await fetchTasks();

      setNewTaskTitle('');
      setNewTaskContent('');
    } catch (err) {
      console.error('Creation error:', err);
      setError('Could not create the task.');
    }
  };

  
  const onDelete = async (id) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Failed to delete task: ${response.statusText}`);
      }

      setTasks(tasks.filter(task => task.id !== id));
    } catch (err) {
      console.error('Delete error:', err);
      setError('Could not delete the task.');
    }
  };

  const onToggleConclude = async (task) => {
    const newConcluded = !task.concluded;
    const url = newConcluded ? `${API_URL}/${task.id}/conclude` : `${API_URL}/${task.id}`;

    try {
        const response = await fetch(url, {
            method: newConcluded ? 'PATCH' : 'PUT', // Use PATCH for conclude, PUT for unconclude (full update)
            headers: { 'Content-Type': 'application/json' },
            body: newConcluded ? null : JSON.stringify({ // PUT requires the full object
                id: task.id,
                title: task.title,
                content: task.content,
                concluded: false, // Set back to false
            }),
        });

        if (!response.ok) {
            throw new Error(`Failed to update task: ${response.statusText}`);
        }
        
        setTasks(prevTasks =>
            prevTasks.map(t =>
                t.id === task.id ? { ...t, concluded: newConcluded } : t
            )
        );
    } catch (err) {
        console.error('Update error:', err);
        setError('Could not update the task status.');
    }
  };

  // --- Rendering ---
  if (loading) return <div className="container">Loading tasks...</div>;
  if (error) return <div className="container error-message">Error: {error}</div>;

  const pendingTasks = tasks.filter(t => !t.concluded);
  const concludedTasks = tasks.filter(t => t.concluded);

  return (
    <div className="container">
      <h1>Simple Todo List</h1>
      {/* --- Task Creation Form --- */}
      <div className="card new-task-form">
        <h2>Add New Task</h2>
        <form onSubmit={handleCreateTask}>
          <input
            type="text"
            placeholder="Task Title (Required)"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            required
          />
          <textarea
            placeholder="Task Content (Optional)"
            value={newTaskContent}
            onChange={(e) => setNewTaskContent(e.target.value)}
            rows="2"
          />
          <button type="submit" disabled={!newTaskTitle.trim()}>
            Add Task
          </button>
        </form>
      </div>

      <hr />

      {/* --- Pending Tasks List --- */}
      <div className="task-list-section">
        <h2>Pending Tasks ({pendingTasks.length})</h2>
        <div className="task-list">
          {pendingTasks.length > 0 ? (
            pendingTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onDelete={onDelete}
                onToggleConclude={onToggleConclude}
              />
            ))
          ) : (
            <p className="no-tasks">No pending tasks.</p>
          )}
        </div>
      </div>

      <hr />

      {/* --- Concluded Tasks List --- */}
      <div className="task-list-section concluded-list">
        <h2>Concluded Tasks ({concludedTasks.length})</h2>
        <div className="task-list">
          {concludedTasks.length > 0 ? (
            concludedTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onDelete={onDelete}
                onToggleConclude={onToggleConclude}
              />
            ))
          ) : (
            <p className="no-tasks">No concluded tasks yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;