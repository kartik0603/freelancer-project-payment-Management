const multer = require('multer');
const path = require('path');

// Set up storage engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads'); 
  },
  filename: (req, file, cb) => {
    
    const fileName = Date.now() + path.extname(file.originalname);
    cb(null, fileName); 
  },
});

// File upload 
const file = (req, file, cb) => {
  cb(null, true); // Accept all file types
};


const upload = multer({ storage, file });

module.exports = upload;
