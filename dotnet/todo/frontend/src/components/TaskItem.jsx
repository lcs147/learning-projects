// src/components/TaskItem.jsx
import PropTypes from 'prop-types';
import './TaskItem.css'; // Create this CSS file next

function TaskItem({ task, onDelete, onToggleConclude }) {
  const { id, title, content, concluded } = task;

  return (
    <div className={`task-card ${concluded ? 'concluded' : ''}`}>
      <div className="task-info">
        <h3 className="task-title">{title}</h3>
        {content && <p className="task-content">{content}</p>}
      </div>
      <div className="task-actions">
        <button
          className={`action-btn ${concluded ? 'btn-unconclude' : 'btn-conclude'}`}
          onClick={() => onToggleConclude(task)}
        >
          {concluded ? 'Undo' : 'Complete'}
        </button>
        <button
          className="action-btn btn-delete"
          onClick={() => onDelete(id)}
        >
          Delete
        </button>
      </div>
    </div>
  );
}

TaskItem.propTypes = {
    task: PropTypes.shape({
        id: PropTypes.number.isRequired,
        title: PropTypes.string.isRequired,
        content: PropTypes.string,
        concluded: PropTypes.bool.isRequired,
    }).isRequired,
    onDelete: PropTypes.func.isRequired,
    onToggleConclude: PropTypes.func.isRequired,
};

export default TaskItem;