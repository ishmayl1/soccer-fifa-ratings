require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const app = express();

connectDB();

// CORS only needed in local dev (Railway serves frontend + backend from same origin)
if (process.env.NODE_ENV !== 'production') {
  app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
}

app.use(express.json());

// Proxy /uploads/* from S3 if bucket is configured, otherwise serve local files
if (process.env.AWS_S3_BUCKET_NAME) {
  const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
  const s3 = new S3Client({
    endpoint: process.env.AWS_ENDPOINT_URL,
    region: process.env.AWS_DEFAULT_REGION || 'auto',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
    forcePathStyle: false,
  });

  app.get('/uploads/*', async (req, res) => {
    try {
      // Strip any accidental leading "uploads/" from stored keys
      const key = req.params[0].replace(/^uploads\//, '');
      const command = new GetObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: key,
      });
      const { Body, ContentType } = await s3.send(command);
      if (ContentType) res.setHeader('Content-Type', ContentType);
      Body.pipe(res);
    } catch (err) {
      res.status(404).json({ message: 'Image not found' });
    }
  });
} else {
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
}

app.use('/api/auth', require('./routes/auth'));
app.use('/api/players', require('./routes/players'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/votes', require('./routes/votes'));

// Serve built Vue frontend in production
if (process.env.NODE_ENV === 'production') {
  const frontendDist = path.join(__dirname, '../frontend/dist');
  app.use(express.static(frontendDist));
  app.get('*', (req, res) => res.sendFile(path.join(frontendDist, 'index.html')));
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
