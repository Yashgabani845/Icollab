import React, { useState, useEffect, useRef } from "react";
import { Users, Tag, CheckSquare, Calendar, Paperclip, Image, Move, Copy, Archive, Share, X, ChevronDown, Edit, Send, Trash2 } from 'lucide-react';
import axios from "axios";
import "../../CSS/Task/tasks.css";

const Task = ({ taskId, title, description, taskListId, onArchive, onMove, fetchTasks }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [labels, setLabels] = useState([]);
    const [checklist, setChecklist] = useState([]);
    const [members, setMembers] = useState([]);
    const [dueDate, setDueDate] = useState(null);
    const [activePanel, setActivePanel] = useState(null);
    const [taskLists, setTaskLists] = useState([]);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [coverPhoto, setCoverPhoto] = useState("");
    const [isEditingDesc, setIsEditingDesc] = useState(false);
    const [taskDescription, setTaskDescription] = useState(description || "");
    const [newChecklistItem, setNewChecklistItem] = useState("");
    const [newLabel, setNewLabel] = useState("");
    const fileInputRef = useRef(null);
    const [isLoading, setIsLoading] = useState(false);
    const [taskListName, setTaskListName] = useState("");
    
    useEffect(() => {
        if (isExpanded) {
            // Fetch all task data when expanded
            fetchTaskData();
            fetchTaskLists();
        }
    }, [isExpanded, taskId]);

    const fetchTaskData = async () => {
        try {
            setIsLoading(true);
    
            // Fetch the task details
            const response = await fetch(`http://localhost:5000/api/task/${taskId}`);
            if (!response.ok) {
                throw new Error(`Failed to fetch task: ${response.statusText}`);
            }
            const taskData = await response.json(); // Convert response to JSON
    
            if (!taskData) {
                throw new Error("Task data is undefined");
            }
    
            setLabels(taskData.labels || []);
            setChecklist(taskData.checklist || []);
            setMembers(taskData.assignedTo || []);
            setDueDate(taskData.dates?.deadline || null);
            setComments(taskData.comments || []);
            setTaskDescription(taskData.description || "");
    
            // Ensure taskListId is a string
            const taskListId = taskData.taskListId?._id || taskData.taskListId;  
            if (!taskListId || typeof taskListId !== "string") {
                throw new Error(`Invalid taskListId: ${JSON.stringify(taskListId)}`);
            }
    
            // Fetch the task list details
            const taskListResponse = await fetch(`http://localhost:5000/api/tasklist/${taskListId}`);
            if (!taskListResponse.ok) {
                throw new Error(`Failed to fetch task list: ${taskListResponse.statusText}`);
            }
            const taskListData = await taskListResponse.json();
            setTaskListName(taskListData.name || "");
    
        } catch (error) {
            console.error("Error fetching task data:", error);
        } finally {
            setIsLoading(false);
        }
    };
    

    const fetchTaskLists = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/tasklists?userEmail=${localStorage.email}`);
            setTaskLists(response.data);
        } catch (error) {
            console.error("Error fetching task lists:", error);
        }
    };

    const toggleMode = () => {
        setIsExpanded((prev) => !prev);
        setActivePanel(null);
    };

    const togglePanel = (panelName) => {
        setActivePanel(activePanel === panelName ? null : panelName);
    };

   const handleAddComment = async () => {
        if (!newComment.trim()) return;

        try {
            await fetch(`http://localhost:5000/api/tasks/${taskId}/comments`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: newComment , user: localStorage.email })
            });
            setNewComment("");
            fetchTaskData();
        } catch (error) {
            console.error("Error adding comment:", error);
        }
    };
    const handleUpdateDescription = async () => {
      try {
          await fetch(`http://localhost:5000/api/tasks/${taskId}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ description: taskDescription })
          });
          setIsEditingDesc(false);
          fetchTaskData();
      } catch (error) {
          console.error("Error updating description:", error);
      }
  };
  const handleAddChecklistItem = async () => {
    if (!newChecklistItem.trim()) return;

    try {
        await fetch(`http://localhost:5000/api/tasks/${taskId}/checklist`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: newChecklistItem , user: localStorage.email })
        });
        setNewChecklistItem("");
        fetchTaskData();
    } catch (error) {
        console.error("Error adding checklist item:", error);
    }
};
const handleToggleChecklistItem = async (itemId, currentStatus) => {
  try {
      await fetch(`http://localhost:5000/api/tasks/${taskId}/checklist/${itemId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: !currentStatus })
      });
      fetchTaskData();
  } catch (error) {
      console.error("Error updating checklist item:", error);
  }
};
const handleDeleteChecklistItem = async (itemId) => {
  try {
      await fetch(`http://localhost:5000/api/tasks/${taskId}/checklist/${itemId}`, { method: "DELETE" });
      fetchTaskData();
  } catch (error) {
      console.error("Error deleting checklist item:", error);
  }
}; const handleAddLabel = async () => {
  if (!newLabel.trim()) return;

  try {
      await fetch(`http://localhost:5000/api/tasks/${taskId}/labels`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ label: newLabel })
      });
      setNewLabel("");
      fetchTaskData();
  } catch (error) {
      console.error("Error adding label:", error);
  }
};

const handleRemoveLabel = async (label) => {
  try {
      await fetch(`http://localhost:5000/api/tasks/${taskId}/labels/${encodeURIComponent(label)}`, { method: "DELETE" });
      fetchTaskData();
  } catch (error) {
      console.error("Error removing label:", error);
  }
};

const handleSetDueDate = async (date) => {
    try {
        const response = await fetch(`http://localhost:5000/api/tasks/${taskId}/deadline`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ deadline: date }),
        });

        if (!response.ok) {
            throw new Error(`Failed to update due date: ${response.statusText}`);
        }

        setDueDate(date);
        fetchTaskData(); // Refresh task data after updating
    } catch (error) {
        console.error("Error setting due date:", error);
    }
};


    

  

const handleMoveTask = async (newTaskListId) => {
    try {
        await fetch(`http://localhost:5000/api/tasks/${taskId}/move`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ newTaskListId })
        });
        if (onMove) onMove(taskId, newTaskListId);
        setIsExpanded(false);
        if (fetchTasks) fetchTasks();
    } catch (error) {
        console.error("Error moving task:", error);
    }
};



    const handleCopyToClipboard = () => {
        const textToCopy = `${title}\n\n${taskDescription}`;
        navigator.clipboard.writeText(textToCopy);
        alert("Task copied to clipboard!");
    };

    
  

    const formatDate = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toLocaleString();
    };

    return (
        <>
            {isExpanded && <div className="modal-overlay" onClick={toggleMode} />}
            <div className={`task-container ${isExpanded ? "expanded" : "simple"}`}>
                <div className="task-header">
                   
                    <h3>{title}</h3>
                    {!isExpanded && labels.length > 0 && (
                        <div className="header-labels">
                            {labels.map((label, index) => (
                                <span key={index} className="label">{label}</span>
                            ))}
                        </div>
                    )}
                    {!isExpanded && dueDate && (
                        <div className="header-due-date">
                            <Calendar size={12} />
                            <span>{new Date(dueDate).toLocaleDateString()}</span>
                        </div>
                    )}
                    <button onClick={toggleMode} className="toggle-button">
                        {isExpanded ? <X size={16} /> : <ChevronDown size={16} />}
                    </button>
                </div>

                {isExpanded && (
                    <div className="task-details">
                        <div className="general">
                            <div className="general_info">
                               
                                {labels.length > 0 && (
                                    <div className="labels-container">
                                        {labels.map((label, index) => (
                                            <div key={index} className="label-with-delete">
                                                <span className="label">{label}</span>
                                                <button className="delete-label" onClick={() => handleRemoveLabel(label)}>
                                                    <X size={12} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="description-container">
                                    <div className="description-header">
                                        <h4>Description</h4>
                                        <button 
                                            className="edit-button" 
                                            onClick={() => setIsEditingDesc(!isEditingDesc)}
                                        >
                                            <Edit size={14} />
                                        </button>
                                    </div>
                                    
                                    {isEditingDesc ? (
                                        <div className="description-edit">
                                            <textarea 
                                                className="description-input" 
                                                value={taskDescription}
                                                onChange={(e) => setTaskDescription(e.target.value)}
                                                placeholder="Add a more detailed description..."
                                            />
                                            <div className="description-actions">
                                                <button 
                                                    className="save-button" 
                                                    onClick={handleUpdateDescription}
                                                >
                                                    Save
                                                </button>
                                                <button 
                                                    className="cancel-button" 
                                                    onClick={() => {
                                                        setIsEditingDesc(false);
                                                        setTaskDescription(description || "");
                                                    }}
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="description-text">
                                            {taskDescription ? taskDescription : "No description provided."}
                                        </div>
                                    )}
                                </div>

                                {dueDate && (
                                    <div className="due-date-container">
                                        <Calendar size={14} />
                                        <span>Due: {new Date(dueDate).toLocaleDateString()}</span>
                                    </div>
                                )}

                                {checklist.length > 0 && (
                                    <div className="checklist-container">
                                        <h4>Checklist</h4>
                                        <div className="checklist-progress">
                                            <div 
                                                className="progress-bar" 
                                                style={{ 
                                                    width: `${(checklist.filter(item => item.status).length / checklist.length) * 100}%` 
                                                }}
                                            ></div>
                                        </div>
                                        <p className="checklist-stats">
                                            {checklist.filter(item => item.status).length}/{checklist.length} completed
                                        </p>
                                        
                                        {checklist.map((item) => (
                                            <div key={item._id} className="checklist-item">
                                                <input 
                                                    type="checkbox" 
                                                    checked={item.status}
                                                    onChange={() => handleToggleChecklistItem(item._id, item.status)}
                                                    id={`checklist-${item._id}`}
                                                />
                                                <label 
                                                    htmlFor={`checklist-${item._id}`}
                                                    className={item.status ? "completed" : ""}
                                                >
                                                    {item.title}
                                                </label>
                                                <button 
                                                    className="delete-checklist-item" 
                                                    onClick={() => handleDeleteChecklistItem(item._id)}
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                            </div>

                            <div className="general_activity">
                                <h4>Comments</h4>
                                <div className="comment-section">
                                    <div className="comment-input-container">
                                        <input 
                                            type="text" 
                                            className="comment-input"
                                            placeholder="Write a comment..."
                                            value={newComment}
                                            onChange={(e) => setNewComment(e.target.value)}
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter') {
                                                    handleAddComment();
                                                }
                                            }}
                                        />
                                        <button 
                                            className="send-comment" 
                                            onClick={handleAddComment}
                                        >
                                            <Send size={14} />
                                        </button>
                                    </div>
                                </div>
                                
                                {comments.length > 0 ? (
                                    <div className="comments-list">
                                        {comments.map((comment) => (
                                            <div key={comment._id} className="activity-item">
                                                <div className="avatar">
                                                    {comment.user.firstName?.[0]}{comment.user.lastName?.[0]}
                                                </div>
                                                <div className="activity-content">
                                                    <span className="username">
                                                        {comment.user.firstName} {comment.user.lastName}
                                                    </span>
                                                    <p className="comment-text">{comment.text}</p>
                                                    <div className="activity-time">
                                                        {formatDate(comment.time)}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="no-comments">No comments yet.</div>
                                )}
                                
                               
                            </div>
                        </div>

                        <div className="special">
                            <div className="special_section">
                                <h5>Add to card</h5>
                                <div className="special_schedule">
                                    
                                    <button 
                                        className="action-button"
                                        onClick={() => togglePanel('labels')}
                                    >
                                        <Tag size={14} />
                                        <span>Labels</span>
                                    </button>
                                    {activePanel === 'labels' && (
                                        <div className="panel labels-panel">
                                            <div className="new-label-form">
                                                <input 
                                                    type="text" 
                                                    placeholder="Add new label"
                                                    value={newLabel}
                                                    onChange={(e) => setNewLabel(e.target.value)}
                                                    onKeyPress={(e) => {
                                                        if (e.key === 'Enter') {
                                                            handleAddLabel();
                                                        }
                                                    }}
                                                />
                                                <button onClick={handleAddLabel}>Add</button>
                                            </div>
                                            {labels.length > 0 && (
                                                <div className="existing-labels">
                                                    <h6>Existing Labels</h6>
                                                    {labels.map((label, index) => (
                                                        <div key={index} className="label-item">
                                                            <span className="label">{label}</span>
                                                            <button 
                                                                className="remove-label"
                                                                onClick={() => handleRemoveLabel(label)}
                                                            >
                                                                <X size={12} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <button 
                                        className="action-button"
                                        onClick={() => togglePanel('checklist')}
                                    >
                                        <CheckSquare size={14} />
                                        <span>Checklist</span>
                                    </button>
                                    {activePanel === 'checklist' && (
                                        <div className="panel checklist-panel">
                                            <div className="new-checklist-form">
                                                <input 
                                                    type="text" 
                                                    placeholder="Add checklist item"
                                                    value={newChecklistItem}
                                                    onChange={(e) => setNewChecklistItem(e.target.value)}
                                                    onKeyPress={(e) => {
                                                        if (e.key === 'Enter') {
                                                            handleAddChecklistItem();
                                                        }
                                                    }}
                                                />
                                                <button onClick={handleAddChecklistItem}>Add</button>
                                            </div>
                                        </div>
                                    )}

                                    <button 
                                        className="action-button"
                                        onClick={() => togglePanel('dates')}
                                    >
                                        <Calendar size={14} />
                                        <span>Dates</span>
                                    </button>
                                    {activePanel === 'dates' && (
                                        <div className="panel dates-panel">
                                            <div className="date-picker">
                                                <label>Due Date:</label>
                                                <input 
                                                    type="date"
                                                    value={dueDate ? new Date(dueDate).toISOString().split('T')[0] : ''}
                                                    onChange={(e) => handleSetDueDate(e.target.value)}
                                                />
                                                {dueDate && (
                                                    <button 
                                                        className="remove-date"
                                                        onClick={() => handleSetDueDate(null)}
                                                    >
                                                        Remove
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                   
                                    

                                   
                                </div>
                            </div>

                            <div className="special_section">
                                <h5>Actions</h5>
                                <div className="Actions">
                                    <button 
                                        className="action-button"
                                        
                                    >
                                        <Move size={14} />
                                        <span>Move</span>
                                    </button>
                                    {activePanel === 'move' && (
                                        <div className="panel move-panel">
                                            <h6>Select destination list:</h6>
                                            <div className="tasklist-options">
                                                {taskLists.map((list) => (
                                                    <button 
                                                        key={list._id} 
                                                        className={`tasklist-option ${list._id === taskListId ? 'current' : ''}`}
                                                        onClick={() => handleMoveTask(list._id)}
                                                        disabled={list._id === taskListId}
                                                    >
                                                        {list.name}
                                                        {list._id === taskListId && " (current)"}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    
                                    <button 
                                        className="action-button"
                                        onClick={handleCopyToClipboard}
                                    >
                                        <Copy size={14} />
                                        <span>Copy</span>
                                    </button>
                                    
                                    <button 
                                        className="action-button"
                                        onClick={() => {
                                            if (onArchive) onArchive(taskId);
                                            setIsExpanded(false);
                                        }}
                                    >
                                        <Archive size={14} />
                                        <span>Archive</span>
                                    </button>
                                    
                                    <button 
                                        className="action-button"
                                        onClick={() => {
                                            // Share functionality - perhaps copy a link
                                            const taskUrl = `${window.location.origin}/tasks/${taskId}`;
                                            navigator.clipboard.writeText(taskUrl);
                                            alert("Task link copied to clipboard!");
                                        }}
                                    >
                                        <Share size={14} />
                                        <span>Share</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default Task;