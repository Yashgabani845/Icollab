const express = require('express');
const Workspace = require('../models/WorkSpace');

const router = express.Router();

router.get('/', async (req, res) => {
  const workspaces = await Workspace.find();
  res.json(workspaces);
});

router.post('/', async (req, res) => {
  const workspace = new Workspace(req.body);
  await workspace.save();
  res.json(workspace);
});

module.exports = router;
