const Project = require('../models/project.schema.js');
const csv = require('fast-csv');
const fs = require('fs');
const path = require('path');

const handleError = (res, message, status = 500) => {
  console.error(message);
  return res.status(status).json({ error: message });
};


const createProject = async (req, res) => {
  try {
    const { title, description, deadline, budget, status } = req.body;

    if (!title || !deadline || !budget) {
      return res.status(400).json({ error: 'Title, deadline, and budget are required.' });
    }

    const project = new Project({
      title,
      description,
      deadline,
      budget,
      status: status || 'Pending',
      createdBy: req.user.id,
    });

    await project.save();
    res.status(201).json({ message: 'Project created successfully', project });
  } catch (error) {
    handleError(res, 'Failed to create project. Please try again later.');
  }
};

// Get all projects for a user
const getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find({ createdBy: req.user.id }).sort({ createdAt: -1 });

    if (!projects.length) {
      return res.status(404).json({ message: 'No projects found for this user.' });
    }

    res.status(200).json({ message: 'Projects retrieved successfully', projects });
  } catch (error) {
    handleError(res, 'Failed to fetch projects. Please try again later.');
  }
};

// Export all projects to CSV
const exportProjectToCSV = async (req, res) => {
  try {
    const projects = await Project.find({ createdBy: req.user.id });

    if (!projects.length) {
      return res.status(404).json({ error: 'No projects found to export.' });
    }

    const filePath = path.join(__dirname, '../uploads/projects.csv');
    const ws = fs.createWriteStream(filePath);

    // Write data to CSV as a stream
    csv.write(
      projects.map((p) => p.toObject()),
      { headers: true }
    )
      .pipe(ws)
      .on('finish', () => {
        res.download(filePath, 'projects.csv', () => {
          // Delete the file after sending it to the client
          fs.unlink(filePath, (err) => {
            if (err) console.error('Error deleting file:', err);
          });
        });
      })
      .on('error', (error) => {
        handleError(res, 'Failed to export projects. Please try again later.');
      });
  } catch (error) {
    handleError(res, 'Failed to export projects. Please try again later.');
  }
};

// Import projects from CSV
const importProjectFromCSV = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded. Please upload a CSV file.' });
    }

    const filePath = req.file.path;
    const projects = [];

    // Stream CSV file and process each row
    fs.createReadStream(filePath)
      .pipe(csv.parse({ headers: true, skipEmptyLines: true }))
      .on('data', (row) => {
        // Ensure required fields are present in each row
        if (row.title && row.deadline && row.budget) {
          projects.push({ ...row, createdBy: req.user.id });
        }
      })
      .on('end', async () => {
        try {
          if (projects.length > 0) {
            await Project.insertMany(projects);
          }
          fs.unlink(filePath, (err) => { // Clean up the file after processing
            if (err) console.error('Error deleting file:', err);
          });
          res.status(201).json({ message: 'Projects imported successfully', importedCount: projects.length });
        } catch (error) {
          handleError(res, 'Failed to import projects. Please try again later.');
        }
      })
      .on('error', (error) => {
        handleError(res, 'Failed to process CSV file. Please try again later.');
      });
  } catch (error) {
    handleError(res, 'Failed to import projects. Please try again later.');
  }
};

module.exports = {
  createProject,
  getAllProjects,
  exportProjectToCSV,
  importProjectFromCSV,
};
