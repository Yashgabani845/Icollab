import React, { useState, useEffect } from 'react';
import { Menu, Plus, Layout, Table, Calendar, Settings, HelpCircle, Bell, Search, ChevronRight, Star, Clock, CheckSquare, BarChart2, FileText, Bookmark, Folder, MessageCircle } from 'lucide-react';
import '../../CSS/Task/task.css';
import TaskList from './TaskList';

// You can import a spinner component from a library or use your custom spinner
import { Circles } from 'react-loader-spinner'; // If using react-loader-spinner

const Taskboard = () => {
  const [lists, setLists] = useState([]);
  const [newListTitle, setNewListTitle] = useState('');
  const [isAddingList, setIsAddingList] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeSection, setActiveSection] = useState('boards');

  useEffect(() => {
    if (activeSection === 'boards') {
      fetchTaskLists();
    }
  }, [activeSection]);

  const fetchTaskLists = async () => {
    setIsLoading(true);

    try {
      const response = await fetch(`http://localhost:5000/api/tasklists?userEmail=${localStorage.email}`);
      if (!response.ok) {
        throw new Error('Failed to fetch task lists');
      }
      const data = await response.json();
      setLists(data);
    } catch (error) {
      console.error('Error fetching task lists:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addNewList = async () => {
    if (!newListTitle.trim()) {
      alert('List name cannot be empty.');
      return;
    }

    const newList = {
      title: newListTitle,
      createdBy: localStorage.email,
      cards: [],
    };

    try {
      const response = await fetch('http://localhost:5000/api/tasklists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newList),
      });

      if (!response.ok) {
        throw new Error('Failed to add a new task list');
      }

      const savedList = await response.json();
      setLists((prevLists) => [...prevLists, savedList]);
      setNewListTitle('');
      setIsAddingList(false);
    } catch (error) {
      console.error('Error adding new task list:', error);
    }
  };

  const handleInputChange = (e) => setNewListTitle(e.target.value);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      addNewList();
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'boards':
        return (
          <div className="rd-lists-container">
            {isLoading ? (
              <div className="rd-spinner">
                <Circles height="80" width="80" color="#4a5568" ariaLabel="loading" />
              </div>
            ) : (
              lists.map((list) => (
                <TaskList key={list.name} lname={list.name} tasks={list.tasks} />
              ))
            )}

            {isAddingList ? (
              <div className="rd-add-list-form">
                <input
                  type="text"
                  value={newListTitle}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter list name"
                  className="rd-add-list-input"
                  autoFocus
                />
                <div className="rd-add-list-actions">
                  <button onClick={addNewList} className="rd-add-list-submit">
                    Add List
                  </button>
                  <button
                    onClick={() => setIsAddingList(false)}
                    className="rd-add-list-cancel"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsAddingList(true)}
                className="rd-add-list-btn"
              >
                <Plus className="rd-plus-icon" />
                Add another list
              </button>
            )}
          </div>
        );
      
      case 'table':
        return (
          <div className="rd-section-content">
            <div className="rd-section-header">
              <h2>Table View</h2>
              <p>Organize your tasks in a structured table format</p>
            </div>
            <div className="rd-table-container">
              <table className="rd-table">
                <thead>
                  <tr>
                    <th>Task Name</th>
                    <th>Status</th>
                    <th>Priority</th>
                    <th>Due Date</th>
                    <th>Assigned To</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>DSA</td>
                    <td><span className="rd-status rd-status-progress">In Progress</span></td>
                    <td><span className="rd-priority rd-priority-high">High</span></td>
                    <td>May 15, 2025</td>
                    <td>Yash Gabani</td>
                  </tr>
                  <tr>
                    <td>Code Review</td>
                    <td><span className="rd-status rd-status-todo">To Do</span></td>
                    <td><span className="rd-priority rd-priority-medium">Medium</span></td>
                    <td>May 20, 2025</td>
                    <td>Meet Thakkar</td>
                  </tr>
                  
                </tbody>
              </table>
            </div>
          </div>
        );
      
     
      
      case 'notifications':
        return (
          <div className="rd-section-content">
            <div className="rd-section-header">
              <h2>Notifications</h2>
              <p>Stay updated with your task activities</p>
            </div>
            <div className="rd-notifications-list">
              <div className="rd-notification rd-notification-unread">
                <div className="rd-notification-icon">
                  <CheckSquare size={18} />
                </div>
                <div className="rd-notification-content">
                  <p className="rd-notification-text"><strong>Gabani Yash</strong>  created <strong>"new task"</strong></p>
                  <p className="rd-notification-time"></p>
                </div>
              </div>
              <div className="rd-notification rd-notification-unread">
                <div className="rd-notification-icon">
                  <Plus size={18} />
                </div>
                <div className="rd-notification-content">
                  <p className="rd-notification-text"><strong>Gabani Yash </strong> created  <strong>"the new task"</strong></p>
                  <p className="rd-notification-time"></p>
                </div>
              </div>
              <div className="rd-notification">
                <div className="rd-notification-icon">
                  <Clock size={18} />
                </div>
                <div className="rd-notification-content">
                  <p className="rd-notification-text">Task <strong>"DSA"</strong> is due tomorrow</p>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'settings':
        return (
          <div className="rd-section-content">
            <div className="rd-section-header">
              <h2>Settings</h2>
              <p>Customize your taskboard experience</p>
            </div>
            <div className="rd-settings-container">
              <div className="rd-settings-group">
                <h3>Account Settings</h3>
                <div className="rd-setting-item">
                  <div className="rd-setting-info">
                    <h4>Profile Information</h4>
                    <p>Update your name, email, and profile picture</p>
                  </div>
                  <ChevronRight size={18} />
                </div>
                <div className="rd-setting-item">
                  <div className="rd-setting-info">
                    <h4>Password</h4>
                    <p>Change your password</p>
                  </div>
                  <ChevronRight size={18} />
                </div>
              </div>
              <div className="rd-settings-group">
                <h3>Preferences</h3>
                <div className="rd-setting-item">
                  <div className="rd-setting-info">
                    <h4>Theme</h4>
                    <p>Choose between light and dark mode</p>
                  </div>
                  <div className="rd-theme-toggle">
                    <span className="rd-theme-option rd-theme-active">Light</span>
                    <span className="rd-theme-option">Dark</span>
                  </div>
                </div>
                <div className="rd-setting-item">
                  <div className="rd-setting-info">
                    <h4>Notifications</h4>
                    <p>Manage your notification preferences</p>
                  </div>
                  <ChevronRight size={18} />
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'help':
        return (
          <div className="rd-section-content">
            <div className="rd-section-header">
              <h2>Help Center</h2>
              <p>Get assistance with using the taskboard</p>
            </div>
            <div className="rd-help-container">
              <div className="rd-help-search">
                <input type="text" placeholder="Search for help..." />
                <button className="rd-help-search-btn">Search</button>
              </div>
              <div className="rd-help-categories">
                <div className="rd-help-category">
                  <div className="rd-help-category-icon">
                    <FileText size={24} />
                  </div>
                  <h3>Documentation</h3>
                  <p>Comprehensive guides on how to use the taskboard</p>
                  <a href="#" className="rd-help-link">View Documentation</a>
                </div>
                <div className="rd-help-category">
                  <div className="rd-help-category-icon">
                    <HelpCircle size={24} />
                  </div>
                  <h3>FAQs</h3>
                  <p>Answers to commonly asked questions</p>
                  <a href="#" className="rd-help-link">View FAQs</a>
                </div>
                <div className="rd-help-category">
                  <div className="rd-help-category-icon">
                    <MessageCircle size={24} />
                  </div>
                  <h3>Contact Support</h3>
                  <p>Get in touch with our support team</p>
                  <a href="#" className="rd-help-link">Contact Support</a>
                </div>
              </div>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="rd-section-content">
            <div className="rd-section-header">
              <h2>Welcome to Taskboard</h2>
              <p>Select a section from the sidebar to get started</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="rd-dashboard">
      <div className="rd-sidebar">
        <div className="rd-sidebar-header">
          <Menu className="rd-menu-icon" />
          <h1>Taskboard</h1>
        </div>

        <div className="rd-search-bar">
          <Search className="rd-search-icon" />
          <input type="text" placeholder="Search..." />
        </div>

        <nav className="rd-sidebar-nav">
          <div 
            className={`rd-nav-item ${activeSection === 'boards' ? 'rd-nav-item-active' : ''}`}
            onClick={() => setActiveSection('boards')}
          >
            <Layout className="rd-nav-icon" />
            <span>Boards</span>
          </div>
          <div 
            className={`rd-nav-item ${activeSection === 'table' ? 'rd-nav-item-active' : ''}`}
            onClick={() => setActiveSection('table')}
          >
            <Table className="rd-nav-icon" />
            <span>Table</span>
          </div>
         
          <div 
            className={`rd-nav-item ${activeSection === 'notifications' ? 'rd-nav-item-active' : ''}`}
            onClick={() => setActiveSection('notifications')}
          >
            <Bell className="rd-nav-icon" />
            <span>Notifications</span>
          </div>
        
          <div 
            className={`rd-nav-item ${activeSection === 'help' ? 'rd-nav-item-active' : ''}`}
            onClick={() => setActiveSection('help')}
          >
            <HelpCircle className="rd-nav-icon" />
            <span>Help</span>
          </div>
        </nav>

        

        <div className="rd-sidebar-recent">
          <h3>Recent</h3>
          <div className="rd-recent-item">
            <Clock className="rd-recent-icon" />
            <span>DSA</span>
          </div>
         
        </div>
      </div>

      <div className="rd-main-content">
        {renderContent()}
      </div>
    </div>
  );
};

export default Taskboard;
