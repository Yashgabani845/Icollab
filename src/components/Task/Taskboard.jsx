import React, { useState, useEffect } from 'react';
import {
  Menu,
  Plus,
  Layout,
  Users,
  Calendar,
  Table,
  Settings,
  HelpCircle,
  Bell,
  Search,
} from 'lucide-react';
import '../../CSS/Task/task.css';
import TaskList from './TaskList';

// You can import a spinner component from a library or use your custom spinner
import { Circles } from 'react-loader-spinner'; // If using react-loader-spinner

const Taskboard = () => {
  const [lists, setLists] = useState([]);
  const [newListTitle, setNewListTitle] = useState('');
  const [isAddingList, setIsAddingList] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Track loading state

  useEffect(() => {
    const fetchTaskLists = async () => {
      setIsLoading(true); // Set loading to true before fetching

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
        setIsLoading(false); // Set loading to false after fetching is done
      }
    };

    fetchTaskLists();
  }, []); // Empty dependency array ensures this runs only once on component mount

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

      // Optimistically update the UI by adding the new list to the state
      setLists((prevLists) => [...prevLists, savedList]);

      // Reset input and close the form
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

  return (
    <div className="rd-dashboard">
      <div className="rd-sidebar">
        <div className="rd-sidebar-header">
          <Menu className="rd-menu-icon" />
          <h1>Dashboard</h1>
        </div>

        <div className="rd-search-bar">
          <Search className="rd-search-icon" />
          <input type="text" placeholder="Search..." />
        </div>

        <nav className="rd-sidebar-nav">
          <div className="rd-nav-item">
            <Layout className="rd-nav-icon" />
            <span>Boards</span>
          </div>
          <div className="rd-nav-item">
            <Users className="rd-nav-icon" />
            <span>Members</span>
          </div>
          <div className="rd-nav-item">
            <Table className="rd-nav-icon" />
            <span>Table</span>
          </div>
          <div className="rd-nav-item">
            <Calendar className="rd-nav-icon" />
            <span>Calendar</span>
          </div>
          <div className="rd-nav-item">
            <Bell className="rd-nav-icon" />
            <span>Notifications</span>
          </div>
          <div className="rd-nav-item">
            <Settings className="rd-nav-icon" />
            <span>Settings</span>
          </div>
          <div className="rd-nav-item">
            <HelpCircle className="rd-nav-icon" />
            <span>Help</span>
          </div>
        </nav>
      </div>

      <div className="rd-main-content">
        <div className="rd-lists-container">
          {/* Show loading spinner if data is being fetched */}
          {isLoading ? (
            <div className="rd-spinner">
              <Circles height="80" width="80" color="blue" ariaLabel="loading" />
            </div>
          ) : (
            // Render lists when not loading
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
      </div>
    </div>
  );
};

export default Taskboard;
