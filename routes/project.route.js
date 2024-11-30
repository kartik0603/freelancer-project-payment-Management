const express = require("express");
const projectRouter = express.Router();

const upload = require("../utils/uploader.js");
const protect = require("../middleware/auth.middleware.js");
const roleCheck = require("../middleware/roleCheck.middleware.js");



const {
    createProject,
    getAllProjects,
    exportProjectToCSV,
    importProjectFromCSV,
  } = require("../controllers/project.controler.js");



projectRouter.use(protect);

projectRouter.post("/create", roleCheck(["Admin"]), createProject);
projectRouter.get("/all", roleCheck(["Admin"]), getAllProjects);

projectRouter.post("/export", roleCheck(["Admin"]), exportProjectToCSV);
projectRouter.post("/import", roleCheck(["Admin"]), upload.single("file"), importProjectFromCSV);


module.exports = projectRouter;
