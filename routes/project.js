// Require the necessary modules
const express = require("express");
const router = express.Router();
const Project = require("../models/project");
const TaskRequest = require("../models/taskrequest");
const authMiddleware = require("./Middleware");
const User = require("../models/user");
const Task = require("../models/task");

//----------------------PROJECTS--------------------------
//------------------------------------------------------
// CCreate a -----NEW PROJECT----
router.post("/", authMiddleware, (req, res) => {
  const project = new Project({
    name: req.body.name,
    description: req.body.description,
    teamMembers: req.body.teamMembers,
    userId: req.user._id,
  });

  // Save the new project to the database
  project
    .save()
    .then((savedProject) => {
      // Send a success response
      res.status(201).json(savedProject);
    })
    .catch((error) => {
      console.error("Error creating project:", error);
      res.status(500).json({ error: "Failed to create project" });
    });
});

//------------------------------------------------------
// ----- ALL PROJECTS ---- belong to a user
router.get("/", authMiddleware, (req, res) => {
  const userId = req.user._id;

  Project.find({ userId })
    .populate("tasks")
    .populate("userId", "-password")
    .exec()
    .then((projects) => {
      res.json(projects);
    })
    .catch((error) => {
      console.error("Error fetching projects:", error);
      res.status(500).json({ error: "Failed to fetch projects" });
    });
});

// all projects in which you are working on a TASK
router.get("/accepted", authMiddleware, async (req, res) => {
  const userId = req.user.id;

  // Find all accepted task requests where the user is the requestee
  const acceptedRequests = await TaskRequest.find({
    requesteeId: userId,
    status: "accepted",
  }).populate("taskId");

  // Collect the IDs of the projects
  const projectIds = new Set(
    acceptedRequests.map((request) => request.taskId.project)
  );
  // Fetch the projects
  const projects = await Promise.all(
    [...projectIds].map((projectId) =>
      Project.findById(projectId)
        .populate("tasks")
        .populate("userId", "-password")
    )
  );

  // Remove any null projects
  const validProjects = projects.filter((project) => project !== null);

  const filterOwnProjects = validProjects.filter((data) => data._id != userId);
  res.json(filterOwnProjects);
});

//---------------------TASKS-------------------------
//------------------------------------------------------
// ---- ADD TASk ---- to an existing project
router.post("/:projectId/tasks", authMiddleware, async (req, res) => {
  const projectId = req.params.projectId;
  const task = new Task({
    name: req.body.name,
    description: req.body.description,
    assignedTo: req.body.assignedTo,
    dueDate: req.body.dueDate,
    project: projectId,
  });

  // Find the user IDs for the assigned email addresses
  const userIds = await User.find({
    email: { $in: req.body.assignedTo },
  }).distinct("_id");
  // Create a task request for each assigned user
  const requests = userIds
    .map((userId) => {
      if (userId.equals(req.user._id)) {
        console.log(userId, req.user._id);
        return null;
      }

      return new TaskRequest({
        taskId: task._id,
        requesterId: req.user._id,
        requesteeId: userId,
        status: "pending",
      });
    })
    .filter((request) => request !== null); // filter out null values

  // Save the new task and task requests to the database
  try {
    const savedTask = await task.save();
    await TaskRequest.insertMany(requests);
    await Project.findByIdAndUpdate(projectId, {
      $push: { tasks: savedTask._id },
    });
    res.status(201).json(savedTask);
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({ error: "Failed to create task" });
  }
});

//------------------------------------------------------
// ----TASK UPDATE---
router.post("/task-update/:id", authMiddleware, async (req, res) => {
  const taskId = req.params.id;
  const newUpdate = req.body.update;
  const newTask = await Task.findById(taskId);

  newTask.status = newUpdate;
  await newTask.save();
  res.json(newTask.status);
});

//------------------------------------------------------
// ----TASK DELETE---
router.get("/task-delete/:id", authMiddleware, async (req, res) => {
  const taskId = req.params.id;

  await TaskRequest.findOneAndDelete({ taskId });
  await Task.findByIdAndDelete(taskId);
  res.status(205).json("Deleted");
});

//---------------------TASKS REQUESTS-------------------------
//------------------------------------------------------
// ----ALL TASK REQUESTS ---for a single user by their ID
router.get("/task-requests", authMiddleware, (req, res) => {
  const userId = req.user._id;
  // Find all task requests where the user is the requestee
  TaskRequest.find({ requesteeId: userId })
    .populate("requesterId")
    .populate("taskId")
    .then((taskRequests) => {
      res.status(200).json(taskRequests);
    })
    .catch((error) => {
      console.error("Error fetching task requests:", error);
      res.status(500).json({ error: "Failed to fetch task requests" });
    });
});

// Accept task request
router.post("/task-action/:status", authMiddleware, async (req, res) => {
  const { requestId } = req.body;
  try {
    // Find task request by ID
    const taskRequest = await TaskRequest.findById(requestId);
    if (!taskRequest) {
      return res.status(404).json({ msg: "Task request not found" });
    }

    // Check if user is the requestee of the task request
    if (taskRequest.requesteeId.toString() !== req.user.id) {
      return res.status(401).json({ msg: "Not authorized" });
    }

    console.log(taskRequest);
    // Update task request status to "accepted"
    taskRequest.status = req.params.status;
    await taskRequest.save();

    if (req.params.status == "rejected") {
      return res.json({ msg: "request rejected" });
    }

    // Update the corresponding task's status to "in progress"
    const task = await Task.findById(taskRequest.taskId._id);
    task.status = "In Progress";
    await task.save();

    // Send success response
    res.json({ msg: "Task request accepted successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
