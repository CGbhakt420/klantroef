# Klantroef - Media Streaming Platform

A Node.js Express application for managing and streaming media assets with secure authentication and temporary streaming URLs.

## Features

- **User Authentication**: Secure signup/login with JWT tokens
- **Media Management**: Add and manage video/audio assets
- **Secure Streaming**: Generate temporary 10-minute streaming URLs
- **View Logging**: Track media views by IP address
- **SQLite Database**: Lightweight database with proper indexing

## Database Schema

### MediaAsset
- `id` - Primary key
- `title` - Media title
- `type` - Media type (video/audio)
- `file_url` - URL to the media file
- `created_at` - Creation timestamp

### AdminUser
- `id` - Primary key
- `email` - Unique email address
- `hashed_password` - Bcrypt hashed password
- `created_at` - Creation timestamp

### MediaViewLog
- `id` - Primary key
- `media_id` - Foreign key to MediaAsset
- `viewed_by_ip` - IP address of viewer
- `timestamp` - View timestamp

## API Endpoints

### Authentication
- `POST /auth/signup` - Create new admin user
- `POST /auth/login` - Login and get JWT token

### Media Management
- `POST /media` - Add new media asset (authenticated)
- `GET /media` - List all media assets (authenticated)
- `GET /media/:id` - Get specific media asset (authenticated)
- `GET /media/:id/stream-url` - Generate secure streaming URL
- `GET /media/stream/:streamId` - Access media via streaming URL

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Copy the environment example file and configure your settings:
```bash
cp env.example .env
```

Edit `.env` and set your JWT secret:
```
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

### 3. Start the Server
```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

The server will start on port 3000 (or the port specified in your .env file).

## Usage Examples

### 1. Create an Admin User
```bash
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "securepassword123"}'
```

### 2. Login and Get JWT Token
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "securepassword123"}'
```

### 3. Add Media Asset
```bash
curl -X POST http://localhost:3000/media \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"title": "Sample Video", "type": "video", "file_url": "https://example.com/video.mp4"}'
```

### 4. Generate Streaming URL
```bash
curl http://localhost:3000/media/1/stream-url
```

### 5. Access Media via Streaming URL
```bash
curl http://localhost:3000/media/stream/GENERATED_STREAM_ID
```

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt with salt rounds
- **Rate Limiting**: Prevents abuse with request limits
- **Helmet**: Security headers for Express
- **CORS**: Configurable cross-origin resource sharing
- **Input Validation**: Comprehensive request validation

## Production Considerations

- **Database**: Consider using PostgreSQL or MySQL for production
- **Streaming URLs**: Use Redis for storing temporary streaming URLs
- **File Storage**: Implement proper file upload and storage
- **HTTPS**: Always use HTTPS in production
- **Environment Variables**: Use proper secret management
- **Logging**: Implement comprehensive logging and monitoring
- **Backup**: Regular database backups

## Development

### Project Structure
```
klantroef/
├── database/
│   └── init.js          # Database initialization and setup
├── middleware/
│   └── auth.js          # JWT authentication middleware
├── routes/
│   ├── auth.js          # Authentication routes
│   └── media.js         # Media management routes
├── server.js            # Main server file
├── package.json         # Dependencies and scripts
├── env.example          # Environment variables template
└── README.md            # This file
```

### Database
The application uses SQLite for simplicity. The database file (`klantroef.db`) will be created automatically in the `database/` directory when you first run the application.

### Testing
You can test the API endpoints using tools like:
- cURL (command line)
- Postman
- Insomnia
- Any HTTP client

## License

MIT License - see LICENSE file for details.
