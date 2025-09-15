const multer = require('multer');
const { GridFSBucket, MongoClient } = require('mongodb');
const dotenv = require('dotenv');

dotenv.config();

const uri = process.env.MONGO_URI || "mongodb://localhost:27017/edugate";
const client = new MongoClient(uri);
const dbName = uri.split('/').pop().split('?')[0] || "edugate";

let bucket;

const initGridFS = async () => {
  await client.connect();
  const db = client.db(dbName);
  bucket = new GridFSBucket(db, { bucketName: 'uploads' });
  return bucket;
};

const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|pdf|doc|docx/;
    const extname = allowed.test(file.originalname.toLowerCase());
    const mimetype = allowed.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

const uploadToGridFS = async (file, metadata = {}) => {
  if (!bucket) await initGridFS();
  
  return new Promise((resolve, reject) => {
    const uploadStream = bucket.openUploadStream(file.originalname, {
      metadata: { ...metadata, uploadDate: new Date() }
    });
    
    uploadStream.end(file.buffer);
    uploadStream.on('finish', () => resolve(uploadStream.id));
    uploadStream.on('error', reject);
  });
};

const downloadFromGridFS = async (fileId) => {
  if (!bucket) await initGridFS();
  return bucket.openDownloadStream(fileId);
};

const deleteFromGridFS = async (fileId) => {
  if (!bucket) await initGridFS();
  return bucket.delete(fileId);
};

module.exports = {
  upload,
  uploadToGridFS,
  downloadFromGridFS,
  deleteFromGridFS,
  initGridFS
};