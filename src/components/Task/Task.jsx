import React, { useState } from "react";
import { Users, Tag, CheckSquare, Calendar, Paperclip, Image, Move, Copy, Archive, Share, X, ChevronDown } from 'lucide-react';
import "../../CSS/Task/tasks.css";

const Task = ({ title, description, activityLog }) => {
    const [isExpanded, setIsExpanded] = useState(false);
  
    const toggleMode = () => {
      setIsExpanded((prev) => !prev);
    };
  
    return (
      <>{isExpanded && <div className="modal-overlay" onClick={toggleMode} />}
        <div className={`task-container ${isExpanded ? "expanded" : "simple"}`}>
          <div className="task-header">
            <h3>{title}</h3>
            <button onClick={toggleMode}>
              {isExpanded ? <X size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>
        {isExpanded && (
          <div className="task-details">
            <div className="general">
              <div className="general_info">
                <textarea 
                  className="description-input" 
                  placeholder="Add a more detailed description..."
                />
              </div>
              <div className="general_activity">
                <h4>Activity</h4>
                <div className="comment-section">
                  <div className="avatar">YG</div>
                  <input 
                    type="text" 
                    className="comment-input"
                    placeholder="Write a comment..."
                  />
                </div>
                <div className="activity-item">
                  <div className="avatar">YG</div>
                  <div className="activity-content">
                    <span className="username">Yash Gabani</span> moved this card from My stack to overall
                    <div className="activity-time">Jan 8, 2025, 8:31 PM</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="special">
              <div className="special_section">
                <h5>Add to card</h5>
                <div className="special_schedule">
                  <button className="action-button">
                    <Users size={14} />
                    <span>Members</span>
                  </button>
                  <button className="action-button">
                    <Tag size={14} />
                    <span>Labels</span>
                  </button>
                  <button className="action-button">
                    <CheckSquare size={14} />
                    <span>Checklist</span>
                  </button>
                  <button className="action-button">
                    <Calendar size={14} />
                    <span>Dates</span>
                  </button>
                  <button className="action-button">
                    <Paperclip size={14} />
                    <span>Attachments</span>
                  </button>
                  <button className="action-button">
                    <Image size={14} />
                    <span>Cover</span>
                  </button>
                </div>
              </div>
              <div className="special_section">
                <h5>Actions</h5>
                <div className="Actions">
                  <button className="action-button">
                    <Move size={14} />
                    <span>Move</span>
                  </button>
                  <button className="action-button">
                    <Copy size={14} />
                    <span>Copy</span>
                  </button>
                  <button className="action-button">
                    <Archive size={14} />
                    <span>Archive</span>
                  </button>
                  <button className="action-button">
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
  
  