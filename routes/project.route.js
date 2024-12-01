const express = require("express");
const projectRouter = express.Router();

const upload = require("../utils/uploader.js");
const protect = require("../middleware/auth.middleware.js");
const roleCheck = require("../middleware/roleCheck.middleware.js");



const {
    createProject,
    getAllProjects,
    deleteProject,
    updateProject,
    getProjectById,
    exportProjectToCSV,
    importProjectFromCSV,
  } = require("../controllers/project.controler.js");



projectRouter.use(protect);

projectRouter.post("/create", roleCheck(["Admin"]), createProject);
projectRouter.get("/all", roleCheck(["Admin"]), getAllProjects);
projectRouter.delete("/delete/:projectId", roleCheck(["Admin"]), deleteProject);
projectRouter.put("/update/:projectId", roleCheck(["Admin"]), updateProject);
projectRouter.get("/get-by-id/:projectId", roleCheck(["Admin", "Client"]), getProjectById);

projectRouter.post("/export", roleCheck(["Admin"]), exportProjectToCSV);
projectRouter.post("/import", roleCheck(["Admin"]), upload.single("file"), importProjectFromCSV);


module.exports = projectRouter;
