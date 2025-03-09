import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './project.css';

const ProjectManager = () => {
  const { workspaceId } = useParams();
  const [projects, setProjects] = useState([]);
  const [repoUrl, setRepoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('pullRequests');
  const [selectedProject, setSelectedProject] = useState(null);

  // Fetch projects for the workspace
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5000/api/workspaces/${workspaceId}/projects`);
        const data = await response.json();
        setProjects(data);
        setLoading(false);
      } catch (err) {
        setError('No projects');
        setLoading(false);
      }
    };

    const fetchUsers = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/workspaces/${workspaceId}/users`);
        const data = await response.json();
        setUsers(data);
      } catch (err) {
        console.error('Failed to load users', err);
      }
    };

    fetchProjects();
    fetchUsers();
  }, [workspaceId]);

  // Add a new project
  const handleAddProject = async (e) => {
    e.preventDefault();

    if (!repoUrl.trim()) {
      setError('Please enter a GitHub repository URL');
      return;
    }

    try {
      setLoading(true);
      setError(null);
        console.log(repoUrl,workspaceId,localStorage.getItem('email'));
      const response = await fetch('http://localhost:5000/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          repositoryUrl: repoUrl,
          workspaceId,
          addedBy: localStorage.getItem('email'),
        }),
      });
      const data = await response.json();
      setProjects([...projects, data]);
      setRepoUrl('');
      setLoading(false);
    } catch (err) {
      setError(err.message || 'Failed to add project');
      setLoading(false);
    }
  };

  // Assign PR or issue to a user
  const handleAssignItem = async (projectId, itemType, itemId, userId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/projects/${projectId}/${itemType}/${itemId}/assign`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        // Update local state
        const updatedProjects = projects.map((project) => {
          if (project._id === projectId) {
            const updatedProject = { ...project };
            const items =
              itemType === 'pullrequest' ? updatedProject.pullRequests : updatedProject.issues;

            const updatedItems = items.map((item) => {
              if (item._id === itemId) {
                return { ...item, assignee: userId };
              }
              return item;
            });

            if (itemType === 'pullrequest') {
              updatedProject.pullRequests = updatedItems;
            } else {
              updatedProject.issues = updatedItems;
            }

            return updatedProject;
          }
          return project;
        });

        setProjects(updatedProjects);

        if (projectId === selectedProject?._id) {
          setSelectedProject(updatedProjects.find((p) => p._id === projectId));
        }
      } else {
        setError('Failed to assign item');
      }
    } catch (err) {
      setError('Failed to assign item');
    }
  };

  const handleSelectProject = (project) => {
    setSelectedProject(project);
    setActiveTab('pullRequests');
  };

  // Get the user name by ID
  const getUserName = (userId) => {
    const user = users.find((u) => u._id === userId);
    return user ? `${user.firstName} ${user.lastName}` : 'Unassigned';
  };

  return (
    <div className="project-manager">
      <div className="container">
        <header className="header">
          <h1>
            Project Manager <span className="emoji">📊</span>
          </h1>
        </header>

        <div className="add-project">
          <form onSubmit={handleAddProject}>
            <div className="input-group">
              <div className="input-icon">
                <span className="emoji">🔗</span>
                <input
                  type="text"
                  placeholder="Enter GitHub repository URL (https://github.com/owner/repo)"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  className="repo-input"
                />
              </div>
              <button type="submit" className="add-button" disabled={loading}>
                {loading ? 'Adding...' : 'Add Project'}
              </button>
            </div>
            {error && <div className="error-message">{error}</div>}
          </form>
        </div>

        <div className="dashboard">
          <div className="projects-sidebar">
            <h2>
              Projects <span className="emoji">📂</span>
            </h2>
            {projects.length === 0 ? (
              <div className="no-projects">
                <p>No projects added yet</p>
                <span className="emoji large">📝</span>
              </div>
            ) : (
              <ul className="project-list">
                {projects.map((project) => (
                  <li
                    key={project._id}
                    className={`project-item ${
                      selectedProject?._id === project._id ? 'active' : ''
                    }`}
                    onClick={() => handleSelectProject(project)}
                  >
                    <div className="project-icon">
                      <span className="emoji">📁</span>
                    </div>
                    <div className="project-info">
                      <div className="project-name">{project.name}</div>
                      <div className="project-meta">
                        <span>{project.pullRequests.length} PRs</span>
                        <span>{project.issues.length} Issues</span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="project-content">
            {selectedProject ? (
              <>
                <div className="project-header">
                  <h2>{selectedProject.name}</h2>
                  <div className="project-stats">
                    <div className="stat">
                      <span className="emoji">⭐</span> {selectedProject.stars}
                    </div>
                    <div className="stat">
                      <span className="emoji">🍴</span> {selectedProject.forks}
                    </div>
                    <div className="stat">
                      <span className="emoji">🔄</span> {new Date(selectedProject.lastSynced).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="tabs">
                  <button
                    className={`tab ${activeTab === 'pullRequests' ? 'active' : ''}`}
                    onClick={() => setActiveTab('pullRequests')}
                  >
                    Pull Requests ({selectedProject.pullRequests.length})
                  </button>
                  <button
                    className={`tab ${activeTab === 'issues' ? 'active' : ''}`}
                    onClick={() => setActiveTab('issues')}
                  >
                    Issues ({selectedProject.issues.length})
                  </button>
                </div>

                <div className="items-container">
                  {activeTab === 'pullRequests' && (
                    selectedProject.pullRequests.length > 0 ? (
                      <div className="items-list">
                        {selectedProject.pullRequests.map((pr) => (
                          <div key={pr._id} className={`item-card pr-${pr.state}`}>
                            <div className="item-header">
                              <span className="emoji pr-icon">
                                {pr.state === 'open' ? '🟢' : pr.state === 'merged' ? '🟣' : '🔴'}
                              </span>
                              <a href={pr.url} target="_blank" rel="noopener noreferrer" className="item-title">
                                {pr.title}
                              </a>
                            </div>
                            <div className="item-meta">
                              <div className="meta-date">
                                Created: {new Date(pr.createdAt).toLocaleDateString()}
                              </div>
                              <div className="assignee-dropdown">
                                <select
                                  value={pr.assignee || ''}
                                  onChange={(e) =>
                                    handleAssignItem(
                                      selectedProject._id,
                                      'pullrequest',
                                      pr._id,
                                      e.target.value || null
                                    )
                                  }
                                >
                                  <option value="">Unassigned</option>
                                  {users.map((user) => (
                                    <option key={user._id} value={user._id}>
                                      {user.firstName} {user.lastName}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="no-items">
                        <p>No pull requests found</p>
                        <span className="emoji large">🔍</span>
                      </div>
                    )
                  )}

                  {activeTab === 'issues' && (
                    selectedProject.issues.length > 0 ? (
                      <div className="items-list">
                        {selectedProject.issues.map((issue) => (
                          <div key={issue._id} className={`item-card issue-${issue.state}`}>
                            <div className="item-header">
                              <span className="emoji issue-icon">
                                {issue.state === 'open' ? '🟢' : '🔴'}
                              </span>
                              <a href={issue.url} target="_blank" rel="noopener noreferrer" className="item-title">
                                {issue.title}
                              </a>
                            </div>
                            <div className="item-meta">
                              <div className="meta-date">
                                Created: {new Date(issue.createdAt).toLocaleDateString()}
                              </div>
                              <div className="assignee-dropdown">
                                <select
                                  value={issue.assignee || ''}
                                  onChange={(e) =>
                                    handleAssignItem(
                                      selectedProject._id,
                                      'issue',
                                      issue._id,
                                      e.target.value || null
                                    )
                                  }
                                >
                                  <option value="">Unassigned</option>
                                  {users.map((user) => (
                                    <option key={user._id} value={user._id}>
                                      {user.firstName} {user.lastName}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="no-items">
                        <p>No issues found</p>
                        <span className="emoji large">🔍</span>
                      </div>
                    )
                  )}
                </div>
              </>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">
                  <span className="emoji large">📋</span>
                </div>
                <h3>No Project Selected</h3>
                <p>Select a project from the sidebar or add a new one to get started</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectManager;
