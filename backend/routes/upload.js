const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const auth = require('../middleware/auth');

const fileFilter = (req, file, cb) => {
  const allowedExt = /jpeg|jpg|png|gif|webp|svg/;
  const allowedMime = /jpeg|jpg|png|gif|webp|svg\+xml/;
  const ok = allowedExt.test(path.extname(file.originalname).toLowerCase()) && allowedMime.test(file.mimetype);
  cb(ok ? null : new Error('Only image files allowed'), ok);
};

let upload;

if (process.env.AWS_S3_BUCKET_NAME) {
  const multerS3 = require('multer-s3');
  const { S3Client } = require('@aws-sdk/client-s3');

  const s3 = new S3Client({
    endpoint: process.env.AWS_ENDPOINT_URL,
    region: process.env.AWS_DEFAULT_REGION || 'auto',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
    forcePathStyle: false,
  });

  upload = multer({
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 },
    storage: multerS3({
      s3,
      bucket: process.env.AWS_S3_BUCKET_NAME,
      key: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
      },
    }),
  });
} else {
  upload = multer({
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 },
    storage: multer.diskStorage({
      destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads')),
      filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
      },
    }),
  });
}

router.post('/', auth, upload.single('photo'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  // S3: req.file.key; local: req.file.filename
  res.json({ filename: req.file.key || req.file.filename });
});

module.exports = router;
