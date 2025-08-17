const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { getDatabase } = require('../database/init');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const db = getDatabase();

const streamingUrls = new Map();

router.post('/', authenticateToken, (req, res) => {
  try {
    const { title, type, file_url } = req.body;

    if (!title || !type || !file_url) {
      return res.status(400).json({ error: 'Title, type, and file_url are required' });
    }

    if (!['video', 'audio'].includes(type)) {
      return res.status(400).json({ error: 'Type must be either "video" or "audio"' });
    }

    db.run('INSERT INTO MediaAsset (title, type, file_url) VALUES (?, ?, ?)', 
      [title, type, file_url], function(err) {
      if (err) {
        console.error('Error creating media asset:', err);
        return res.status(500).json({ error: 'Failed to create media asset' });
      }

      res.status(201).json({
        message: 'Media asset created successfully',
        mediaId: this.lastID,
        media: {
          id: this.lastID,
          title,
          type,
          file_url,
          created_at: new Date().toISOString()
        }
      });
    });
  } catch (error) {
    console.error('Media creation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /media/:id/stream-url - Returns a secure 10-min link
router.get('/:id/stream-url', (req, res) => {
  try {
    const mediaId = req.params.id;
    const clientIp = req.ip || req.connection.remoteAddress || 'unknown';

    db.get('SELECT id, title, type, file_url FROM MediaAsset WHERE id = ?', 
      [mediaId], (err, media) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      if (!media) {
        return res.status(404).json({ error: 'Media not found' });
      }

      // Generate secure streaming URL with 10-minute expiration
      const streamId = uuidv4();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); 

      const streamingUrl = {
        id: streamId,
        mediaId: media.id,
        originalUrl: media.file_url,
        expiresAt: expiresAt.toISOString(),
        createdAt: new Date().toISOString()
      };

      streamingUrls.set(streamId, streamingUrl);

      db.run('INSERT INTO MediaViewLog (media_id, viewed_by_ip) VALUES (?, ?)', 
        [mediaId, clientIp], (err) => {
        if (err) {
          console.error('Error logging view:', err);
        }
      });

      
      cleanupExpiredUrls();

      res.json({
        message: 'Streaming URL generated successfully',
        streamUrl: `/media/stream/${streamId}`,
        expiresAt: expiresAt.toISOString(),
        media: {
          id: media.id,
          title: media.title,
          type: media.type
        }
      });
    });
  } catch (error) {
    console.error('Stream URL generation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/stream/:streamId', (req, res) => {
  try {
    const streamId = req.params.streamId;
    const streamingUrl = streamingUrls.get(streamId);

    if (!streamingUrl) {
      return res.status(404).json({ error: 'Streaming URL not found or expired' });
    }


    if (new Date() > new Date(streamingUrl.expiresAt)) {
      streamingUrls.delete(streamId);
      return res.status(410).json({ error: 'Streaming URL has expired' });
    }

    
    res.redirect(streamingUrl.originalUrl);
  } catch (error) {
    console.error('Stream serving error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


router.get('/', authenticateToken, (req, res) => {
  try {
    db.all('SELECT id, title, type, file_url, created_at FROM MediaAsset ORDER BY created_at DESC', 
      (err, rows) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      res.json({
        message: 'Media assets retrieved successfully',
        count: rows.length,
        media: rows
      });
    });
  } catch (error) {
    console.error('Media listing error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


router.get('/:id', authenticateToken, (req, res) => {
  try {
    const mediaId = req.params.id;

    db.get('SELECT id, title, type, file_url, created_at FROM MediaAsset WHERE id = ?', 
      [mediaId], (err, media) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      if (!media) {
        return res.status(404).json({ error: 'Media not found' });
      }

      res.json({
        message: 'Media asset retrieved successfully',
        media
      });
    });
  } catch (error) {
    console.error('Media retrieval error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


function cleanupExpiredUrls() {
  const now = new Date();
  for (const [streamId, streamingUrl] of streamingUrls.entries()) {
    if (new Date(streamingUrl.expiresAt) <= now) {
      streamingUrls.delete(streamId);
    }
  }
}

module.exports = router;
