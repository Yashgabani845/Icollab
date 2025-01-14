import React, { useState } from "react";
import { Users, Tag, CheckSquare, Calendar, Paperclip, Image, Move, Copy, Archive, Share, X, ChevronDown } from 'lucide-react';
import "../../CSS/Task/tasks.css";

const Task = ({ title, description, activityLog }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    // New state for managing features
    const [labels, setLabels] = useState([]);
    const [checklist, setChecklist] = useState([]);
    const [members, setMembers] = useState([]);
    const [dueDate, setDueDate] = useState(null);
    const [activePanel, setActivePanel] = useState(null);
  
    const toggleMode = () => {
      setIsExpanded((prev) => !prev);
      setActivePanel(null);
    };

    // New helper functions for features
    const togglePanel = (panelName) => {
      setActivePanel(activePanel === panelName ? null : panelName);
    };
  
    return (
      <>
        {isExpanded && <div className="modal-overlay" onClick={toggleMode} />}
        <div className={`task-container ${isExpanded ? "expanded" : "simple"}`}>
          <div className="task-header">
            <h3>{title}</h3>
            {/* Display labels in header when collapsed */}
            {!isExpanded && labels.length > 0 && (
              <div className="header-labels">
                {labels.map((label, index) => (
                  <span key={index} className="label">{label}</span>
                ))}
              </div>
            )}
            <button onClick={toggleMode}>
              {isExpanded ? <X size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>

        {isExpanded && (
          <div className="task-details">
            <div className="general">
              <div className="general_info">
                {/* Display labels when expanded */}
                {labels.length > 0 && (
                  <div className="labels-container">
                    {labels.map((label, index) => (
                      <span key={index} className="label">{label}</span>
                    ))}
                  </div>
                )}

                <textarea 
                  className="description-input" 
                  placeholder="Add a more detailed description..."
                />

                {/* Display checklist if exists */}
                {checklist.length > 0 && (
                  <div className="checklist-container">
                    {checklist.map((item, index) => (
                      <div key={index} className="checklist-item">
                        <input 
                          type="checkbox" 
                          checked={item.completed}
                          onChange={() => {
                            const newChecklist = [...checklist];
                            newChecklist[index].completed = !newChecklist[index].completed;
                            setChecklist(newChecklist);
                          }}
                        />
                        <span>{item.text}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Display due date if exists */}
                {dueDate && (
                  <div className="due-date">
                    Due: {new Date(dueDate).toLocaleDateString()}
                  </div>
                )}
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
                  <button 
                    className="action-button"
                    onClick={() => togglePanel('members')}
                  >
                    <Users size={14} />
                    <span>Members</span>
                  </button>
                  {activePanel === 'members' && (
                    <div className="panel members-panel">
                      {members.map((member, index) => (
                        <div key={index} className="member-item">
                          <div className="avatar">{member.initials}</div>
                          <span>{member.name}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <button 
                    className="action-button"
                    onClick={() => togglePanel('labels')}
                  >
                    <Tag size={14} />
                    <span>Labels</span>
                  </button>
                  {activePanel === 'labels' && (
                    <div className="panel labels-panel">
                      <input 
                        type="text" 
                        placeholder="Add new label"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && e.target.value) {
                            setLabels([...labels, e.target.value]);
                            e.target.value = '';
                          }
                        }}
                      />
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
                      <input 
                        type="text" 
                        placeholder="Add checklist item"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && e.target.value) {
                            setChecklist([...checklist, { text: e.target.value, completed: false }]);
                            e.target.value = '';
                          }
                        }}
                      />
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
                      <input 
                        type="date"
                        onChange={(e) => setDueDate(e.target.value)}
                      />
                    </div>
                  )}

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