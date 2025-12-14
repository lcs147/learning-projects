import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheck,
  faPlusSquare,
  faTrash,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import './App.css';

function TaskList({ tasks, setTasks }) {
  const deleteHandler = (task) => {
    setTasks(tasks.filter((cur) => cur !== task));
  };

  const finishedHandler = (task) => {
    const ntasks = tasks.map((cur) =>
      cur === task ? { ...task, todo: !task.todo } : cur
    );
    setTasks(ntasks);
  };
  const listItems = tasks.map((task) => (
    <li key={task.id}>
      <span className={task.todo ? '' : 'donetask'}>{task.name}</span>{' '}
      <button className='checkButton' onClick={() => finishedHandler(task)}>
        {task.todo ? (
          <FontAwesomeIcon icon={faCheck} />
        ) : (
          <FontAwesomeIcon icon={faXmark} />
        )}
      </button>{' '}
      <button onClick={() => deleteHandler(task)}>
        <FontAwesomeIcon icon={faTrash} />
      </button>{' '}
    </li>
  ));
  return <ul>{listItems}</ul>;
}

function AddComp({ tasks, setTasks }) {
  const [name, setName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name === '') return;

    const id = tasks.length > 0 ? tasks[tasks.length - 1].id + 1 : 0;
    setTasks([...tasks, { id, name, todo: true }]);
    setName('');
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label>
          Enter your task:{' '}
          <input
            type='text'
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>{' '}
        <button type='submit' value='add'>
          <FontAwesomeIcon icon={faPlusSquare} />
        </button>
      </form>
    </div>
  );
}

function App() {
  const [tasks, setTasks] = useState([
    { id: 0, name: 'Task A', todo: true },
    { id: 1, name: 'Task B', todo: true },
  ]);

  return (
    <>
      <h1>To-Do List</h1>
      <TaskList tasks={tasks} setTasks={setTasks} />
      <AddComp tasks={tasks} setTasks={setTasks} />
    </>
  );
}

export default App;
