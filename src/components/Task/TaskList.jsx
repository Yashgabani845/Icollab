import React from "react";
import Task from "./Task";
import "../../CSS/Task/taskList.css";
const TaskList = ({ tasks  }) => {
    return (
      <div className="task-list-container">
        <h2>Task List</h2>
        {tasks.length === 0 ? (
          <p className="empty-state">No tasks available</p>
        ) : (
          <div className="task-list">
            {tasks.map((task) => (
              <Task
                key={task.id}
                title={task.title}
                description={task.description}
                activityLog={task.activityLog}
              />
            ))}
          </div>
        )}
      </div>
    );
  };
  
  export default TaskList;
  