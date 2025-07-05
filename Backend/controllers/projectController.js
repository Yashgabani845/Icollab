const Project = require('../models/Project');
const User = require('../models/User');
const axios = require('axios');

// Add a new project to workspace
exports.addProject = async (req, res) => {
  try {
    const { repositoryUrl, workspaceId, addedBy } = req.body;

    if (!repositoryUrl || !workspaceId || !addedBy) {
      return res.status(400).json({ message: 'repositoryUrl, workspaceId, and addedBy are required' });
    }

    // Validate URL format
    if (!/^https:\/\/github\.com\/[^/]+\/[^/]+$/.test(repositoryUrl)) {
      return res.status(400).json({ message: 'Invalid GitHub repository URL' });
    }

    // Extract owner and repo name from URL
    const urlParts = repositoryUrl.split('/');
    const owner = urlParts[urlParts.length - 2];
    const repoName = urlParts[urlParts.length - 1];

    // Check if project already exists
    const existingProject = await Project.findOne({ repositoryUrl });
    if (existingProject) {
      return res.status(400).json({ message: 'Project already exists' });
    }

    // --- TOKEN: Replace this with your actual token string if not using env ---
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN || 'YOUR_GITHUB_TOKEN_HERE';
    const headers = {
      Authorization: `token ${GITHUB_TOKEN}`,
      'User-Agent': 'icollab-app'
    };

    // Fetch repository data from GitHub API
    let repoData;
    try {
      const repoResponse = await axios.get(
        `https://api.github.com/repos/${owner}/${repoName}`,
        { headers }
      );
      repoData = repoResponse.data;
    } catch (apiErr) {
      return res.status(400).json({ message: 'GitHub repository not found or inaccessible' });
    }

    // Fetch pull requests
    let pullRequests = [];
    try {
      const prResponse = await axios.get(
        `https://api.github.com/repos/${owner}/${repoName}/pulls?state=all&per_page=100`,
        { headers }
      );
      pullRequests = prResponse.data.map(pr => ({
        id: pr.id,
        title: pr.title,
        url: pr.html_url,
        state: pr.state === 'closed' && pr.merged_at ? 'merged' : pr.state,
        createdAt: pr.created_at,
        updatedAt: pr.updated_at,
        repository: repositoryUrl
      }));
    } catch (prErr) {
      // Ignore PR fetch error
    }

    // Fetch issues
    let issues = [];
    try {
      const issueResponse = await axios.get(
        `https://api.github.com/repos/${owner}/${repoName}/issues?state=all&per_page=100`,
        { headers }
      );
      issues = issueResponse.data
        .filter(issue => !issue.pull_request)
        .map(issue => ({
          id: issue.id,
          title: issue.title,
          url: issue.html_url,
          state: issue.state,
          createdAt: issue.created_at,
          updatedAt: issue.updated_at,
          repository: repositoryUrl
        }));
    } catch (issueErr) {
      // Ignore issues fetch error
    }

    // Check user existence
    const usera = await User.findOne({ email: addedBy });
    if (!usera) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Create new project
    const newProject = new Project({
      repositoryUrl,
      name: repoData.name,
      description: repoData.description,
      owner,
      stars: repoData.stargazers_count,
      forks: repoData.forks_count,
      pullRequests,
      issues,
      workspace: workspaceId,
      addedBy: usera._id,
      lastSynced: new Date()
    });

    await newProject.save();

    res.status(201).json(newProject);
  } catch (error) {
    console.error('Error adding project:', error.response ? error.response.data : error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all projects for a workspace
exports.getWorkspaceProjects = async (req, res) => {
  try {
    const projects = await Project.find({ workspace: req.params.workspaceId });
    res.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Assign PR or issue to a user
exports.assignProjectItem = async (req, res) => {
  try {
    const { projectId, type, itemId } = req.params;
    const { userId } = req.body;

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (type === 'pullrequest') {
      const pr = project.pullRequests.id(itemId);
      if (!pr) {
        return res.status(404).json({ message: 'Pull request not found' });
      }
      pr.assignee = userId;
    } else if (type === 'issue') {
      const issue = project.issues.id(itemId);
      if (!issue) {
        return res.status(404).json({ message: 'Issue not found' });
      }
      issue.assignee = userId;
    } else {
      return res.status(400).json({ message: 'Invalid type. Must be pullrequest or issue' });
    }

    await project.save();

    res.json(project);
  } catch (error) {
    console.error('Error assigning item:', error);
    res.status(500).json({ message: 'Server error' });
  }
};