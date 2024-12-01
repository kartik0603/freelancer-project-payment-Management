const Project = require("../models/project.schema.js");
const csv = require("fast-csv");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

const handleError = (res, message, status = 500) => {
  console.error(message);
  return res.status(status).json({ error: message });
};

const createProject = async (req, res) => {
  try {
    const { title, description, deadline, budget, status } = req.body;

    if (!title || !deadline || !budget) {
      return res
        .status(400)
        .json({ error: "Title, deadline, and budget are required." });
    }

    const project = new Project({
      title,
      description,
      deadline,
      budget,
      status: status || "Pending",
      createdBy: req.user.id,
    });

    await project.save();
    res.status(201).json({ message: "Project created successfully", project });
  } catch (error) {
    handleError(res, "Failed to create project. Please try again later.");
  }
};

// Get all projects for a user
const getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find({ createdBy: req.user.id }).sort({
      createdAt: -1,
    });

    if (!projects.length) {
      return res
        .status(404)
        .json({ message: "No projects found for this user." });
    }

    res
      .status(200)
      .json({ message: "Projects retrieved successfully", projects });
  } catch (error) {
    handleError(res, "Failed to fetch projects. Please try again later.");
  }
};

// Delete a project by its ID
const deleteProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    if (!projectId) {
      return res.status(400).json({ error: 'Project ID is required.' });
    }

    // Find the project by ID and delete it
    const project = await Project.findByIdAndDelete(projectId);

    if (!project) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    res.status(200).json({
      message: 'Project deleted successfully.',
      project,
    });

  } catch (error) {
    console.error('Error deleting project:', error);
    handleError(res, 'Failed to delete project. Please try again later.');
  }
};

//  Update a project by its ID
const updateProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { name, description, status, budget } = req.body;

    if (!projectId) {
      return res.status(400).json({ error: 'Project ID is required.' });
    }

    // Validate input fields if necessary
    if (!name && !description && !status && !budget) {
      return res.status(400).json({ error: 'At least one field (name, description, status, budget) must be provided for update.' });
    }

    // Find the project by ID and update it
    const project = await Project.findByIdAndUpdate(
      projectId,
      { name, description, status, budget }, // Update only the fields provided in the request body
      { new: true } // Return the updated document
    );

    if (!project) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    res.status(200).json({
      message: 'Project updated successfully.',
      project,
    });

  } catch (error) {
    console.error('Error updating project:', error);
    handleError(res, 'Failed to update project. Please try again later.');
  }
};

// Get a project by its ID
const getProjectById = async (req, res) => {
  try {
    const { projectId } = req.params;

    if (!projectId) {
      return res.status(400).json({ error: 'Project ID is required.' });
    }

    // Find the project by ID
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    res.status(200).json({
      message: 'Project details fetched successfully.',
      project,
    });

  } catch (error) {
    console.error('Error fetching project by ID:', error);
    handleError(res, 'Failed to fetch project details. Please try again later.');
  }
};

// Export all projects 
const exportProjectToCSV = async (req, res) => {
  try {
    const projects = await Project.find({ createdBy: req.user.id });

    if (!projects.length) {
      return res.status(404).json({ error: "No projects found to export." });
    }

    const filePath = path.join(__dirname, "../uploads/projects.csv");
    const ws = fs.createWriteStream(filePath);

    // Write data to CSV
    csv
      .write(
        projects.map((p) => p.toObject()),
        { headers: true }
      )
      .pipe(ws)
      .on("finish", () => {
        res.download(filePath, "projects.csv", () => {
          // Delete the file after sending it to the client
          fs.unlink(filePath, (err) => {
            if (err) console.error("Error deleting file:", err);
          });
        });
      })
      .on("error", (error) => {
        handleError(res, "Failed to export projects. Please try again later.");
      });
  } catch (error) {
    handleError(res, "Failed to export projects. Please try again later.");
  }
};

// Import projects
const importProjectFromCSV = async (req, res) => {
  if (!req.file) {
    return res
      .status(400)
      .json({ error: "No file uploaded. Please upload a CSV file." });
  }

  const filePath = req.file.path;
  const projects = [];

  try {
    const stream = fs
      .createReadStream(filePath)
      .pipe(csv.parse({ headers: true, skipEmptyLines: true }));

    stream.on("data", (row) => {
      if (row.title && row.deadline && !isNaN(row.budget)) {
        row.deadline = new Date(row.deadline);
        projects.push({ ...row, createdBy: req.user.id });
      }
    });

    await new Promise((resolve, reject) => {
      stream.on("end", resolve);
      stream.on("error", reject);
    });

    //insert the projects into the database
    if (projects.length > 0) {
      try {
        console.log("Attempting to insert projects into the database...");
        const result = await Project.insertMany(projects);
        console.log("Inserted projects:", result);
      } catch (error) {
        console.error("Database insertion error:", error);
        return res
          .status(500)
          .json({
            error: "Failed to insert projects into the database.",
            details: error,
          });
      }
    }

    fs.unlink(filePath, (err) => {
      if (err) console.error("Error deleting file:", err);
    });

    return res.status(201).json({
      message: "Projects imported successfully",
      importedCount: projects.length,
    });
  } catch (error) {
    console.error("Error during CSV processing:", error);

    fs.unlink(filePath, (err) => {
      if (err) console.error("Error deleting file during error handling:", err);
    });
    return res
      .status(500)
      .json({ error: "Error occurred while processing the CSV file." });
  }
};

module.exports = {
  createProject,
  getAllProjects,
  deleteProject,
  updateProject,
  getProjectById,
  exportProjectToCSV,
  importProjectFromCSV,
};
