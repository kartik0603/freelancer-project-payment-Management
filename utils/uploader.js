const multer = require('multer');
const path = require('path');

// storage 
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads'); 
  },
  filename: (req, file, cb) => {
    
    const fileName = Date.now() + path.extname(file.originalname);
    cb(null, fileName); 
  },
});

// upload 
const file = (req, file, cb) => {
  cb(null, true); 
};


const upload = multer({ storage, file });

module.exports = upload;
