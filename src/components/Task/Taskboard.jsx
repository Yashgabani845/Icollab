import React, { useState } from 'react';
import { Menu, Plus, MoreVertical, Layout, Users, Calendar, Table, Settings, HelpCircle, Bell, Search } from 'lucide-react';
import '../../CSS/Task/task.css';

const initialData = {
  lists: [
    {
      id: 'list-1',
      title: 'To Do',
      cards: [
        { id: 'card-1', title: 'Create login page', description: 'Implement user authentication' },
        { id: 'card-2', title: 'Design homepage', description: 'Create wireframes' }
      ]
    },
    {
      id: 'list-2',
      title: 'In Progress',
      cards: [
        { id: 'card-3', title: 'API Integration', description: 'Connect backend APIs' },
      ]
    },
    {
      id: 'list-3',
      title: 'Done',
      cards: [
        { id: 'card-4', title: 'Project Setup', description: 'Initial repository setup' },
      ]
    }
  ]
};

const Taskboard = () => {
    const [lists, setLists] = useState(initialData.lists);
    const [draggedCard, setDraggedCard] = useState(null);
  
    const handleDragStart = (card, listId) => {
      setDraggedCard({ card, sourceListId: listId });
    };
  
    const handleDragOver = (e) => {
      e.preventDefault();
    };
  
    const handleDrop = (targetListId) => {
      if (draggedCard && draggedCard.sourceListId !== targetListId) {
        setLists(prevLists => {
          const sourceList = prevLists.find(list => list.id === draggedCard.sourceListId);
          const targetList = prevLists.find(list => list.id === targetListId);
    
          const updatedSourceList = {
            ...sourceList,
            cards: sourceList.cards.filter(card => card.id !== draggedCard.card.id)
          };
    
          const updatedTargetList = {
            ...targetList,
            cards: [...targetList.cards, draggedCard.card]
          };
    
          return prevLists.map(list => {
            if (list.id === draggedCard.sourceListId) return updatedSourceList;
            if (list.id === targetListId) return updatedTargetList;
            return list;
          });
        });
      }
      setDraggedCard(null);
    };
  
    const addNewList = () => {
      const newList = {
        id: `list-${lists.length + 1}`,
        title: `New List`,
        cards: []
      };
      setLists([...lists, newList]);
    };
  
    const addNewCard = (listId) => {
      setLists(prevLists => {
        return prevLists.map(list => {
          if (list.id === listId) {
            return {
              ...list,
              cards: [
                ...list.cards,
                {
                  id: `card-${Date.now()}`,
                  title: 'New Card',
                  description: 'Add description'
                }
              ]
            };
          }
          return list;
        });
      });
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
            {lists.map(list => (
              <div
                key={list.id}
                className="rd-list"
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(list.id)}
              >
                <div className="rd-list-header">
                  <h3>{list.title}</h3>
                  <MoreVertical className="rd-more-icon" />
                </div>
                
                {list.cards.map(card => (
                  <div
                    key={card.id}
                    className="rd-card"
                    draggable
                    onDragStart={() => handleDragStart(card, list.id)}
                  >
                    <div className="rd-card-header">
                      <h4>{card.title}</h4>
                      <MoreVertical className="rd-more-icon-small" />
                    </div>
                    <p className="rd-card-description">{card.description}</p>
                  </div>
                ))}
                
                <button
                  onClick={() => addNewCard(list.id)}
                  className="rd-add-card-btn"
                >
                  <Plus className="rd-plus-icon" />
                  Add a card
                </button>
              </div>
            ))}
            
            <button
              onClick={addNewList}
              className="rd-add-list-btn"
            >
              <Plus className="rd-plus-icon" />
              Add another list
            </button>
          </div>
        </div>
      </div>
    );
  };
  

export default Taskboard;