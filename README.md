# VidTube - Video Sharing Platform

A full-stack video sharing platform inspired by YouTube, built with modern web technologies. VidTube combines video streaming capabilities with social media features like comments, likes, and tweets.

## 🚀 Features

### Core Features
- **Video Management**: Upload, edit, delete, and publish videos with thumbnails
- **User Authentication**: Secure JWT-based authentication with refresh tokens
- **Video Streaming**: Watch videos with embedded video player
- **Social Features**: Like videos, comment system, user subscriptions
- **Tweet System**: Integrated social media functionality
- **Playlist Management**: Create and organize video playlists
- **Dashboard Analytics**: Real-time statistics for videos, subscribers, views, and likes
- **Responsive Design**: Modern UI that works on all devices

### Technical Features
- **RESTful API**: Well-structured backend API with proper error handling
- **File Upload**: Cloudinary integration for video and image storage
- **Pagination**: Efficient data loading with pagination support
- **Search & Filter**: Advanced search and filtering capabilities
- **Real-time Updates**: Live comment and like updates
- **Security**: Password encryption, input validation, and CORS protection

## 🛠️ Tech Stack

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - Authentication tokens
- **bcrypt** - Password hashing
- **Cloudinary** - Cloud media storage
- **Multer** - File upload handling
- **CORS** - Cross-origin resource sharing

### Frontend
- **React 19** - JavaScript library for building user interfaces
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Tailwind CSS** - Utility-first CSS framework
- **Vite** - Build tool and development server

## 📁 Project Structure

```
VidTube/
├── Backend-Vidtube/          # Backend API server
│   ├── src/
│   │   ├── controllers/      # Request handlers
│   │   ├── models/          # Database schemas
│   │   ├── routes/          # API routes
│   │   ├── middlewares/     # Custom middleware
│   │   ├── utils/           # Utility functions
│   │   ├── db/              # Database connection
│   │   ├── app.js           # Express app configuration
│   │   └── index.js         # Server entry point
│   ├── package.json
│   └── README.md
├── Frontend-Vidtube/         # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── api.js          # API configuration
│   │   ├── App.jsx         # Main app component
│   │   └── main.jsx        # App entry point
│   ├── package.json
│   └── README.md
├── .gitignore               # Git ignore rules
└── README.md               # Project documentation
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- MongoDB database
- Cloudinary account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd VidTube
   ```

2. **Backend Setup**
   ```bash
   cd Backend-Vidtube
   npm install
   ```

3. **Frontend Setup**
   ```bash
   cd Frontend-Vidtube
   npm install
   ```

4. **Environment Configuration**

   Create `.env` file in `Backend-Vidtube/`:
   ```env
   PORT=8001
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   REFRESH_TOKEN_SECRET=your_refresh_token_secret
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   CORS_ORIGIN=http://localhost:5173
   ```

   Create `.env` file in `Frontend-Vidtube/`:
   ```env
   VITE_API_URL=http://localhost:8001/api/v1
   ```

5. **Start Development Servers**

   Backend:
   ```bash
   cd Backend-Vidtube
   npm run dev
   ```

   Frontend:
   ```bash
   cd Frontend-Vidtube
   npm run dev
   ```

## 📖 API Documentation

### Authentication Endpoints
- `POST /api/v1/users/register` - Register new user
- `POST /api/v1/users/login` - User login
- `POST /api/v1/users/logout` - User logout
- `POST /api/v1/users/refresh-token` - Refresh access token

### Video Endpoints
- `GET /api/v1/videos/getAll` - Get all published videos
- `POST /api/v1/videos/publish` - Publish new video
- `GET /api/v1/videos/:videoId` - Get video by ID
- `PATCH /api/v1/videos/updateVideo/:videoId` - Update video
- `DELETE /api/v1/videos/delete/:videoId` - Delete video

### Comment Endpoints
- `GET /api/v1/comments/getVideoComments/:videoId` - Get video comments
- `POST /api/v1/comments/addVideoComment/:videoId` - Add comment
- `PATCH /api/v1/comments/updateComment/:commentId` - Update comment
- `DELETE /api/v1/comments/deleteComment/:commentId` - Delete comment

### Like Endpoints
- `POST /api/v1/likes/toggle/v/:videoId` - Toggle video like
- `POST /api/v1/likes/toggle/c/:commentId` - Toggle comment like

### Tweet Endpoints
- `GET /api/v1/tweets/getAllTweets` - Get all tweets
- `POST /api/v1/tweets/addTweet` - Add new tweet
- `PATCH /api/v1/tweets/updateTweet/:tweetId` - Update tweet
- `DELETE /api/v1/tweets/deleteTweet/:tweetId` - Delete tweet

## 🎯 Usage

### For Users
1. **Register/Login**: Create an account or sign in
2. **Browse Videos**: View and search through uploaded videos
3. **Watch Videos**: Click on videos to watch them
4. **Interact**: Like videos, add comments, and engage with content
5. **Upload Content**: Upload your own videos with titles and descriptions
6. **Manage Content**: Edit or delete your uploaded videos
7. **Social Features**: Use the tweet system to share thoughts

### For Developers
1. **API Integration**: Use the RESTful API for custom integrations
2. **Customization**: Modify the frontend components and styling
3. **Extension**: Add new features by extending the existing architecture
4. **Deployment**: Deploy to your preferred hosting platform

## 🔧 Configuration

### Database Configuration
The application uses MongoDB. Configure your connection string in the backend `.env` file.

### Cloudinary Configuration
Set up Cloudinary for media storage:
1. Create a Cloudinary account
2. Get your cloud name, API key, and API secret
3. Add them to your backend `.env` file

### CORS Configuration
Configure CORS settings in the backend for cross-origin requests between frontend and backend.

## 🚀 Deployment

### Backend Deployment (Render)
1. Connect your GitHub repository to Render
2. Set environment variables in Render dashboard
3. Deploy the backend service

### Frontend Deployment (Vercel)
1. Connect your GitHub repository to Vercel
2. Configure build settings
3. Set environment variables
4. Deploy the frontend application

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License.

## 👨‍💻 Author

**Abdul Majid**

## 🙏 Acknowledgments

- YouTube for inspiration
- The open-source community for amazing tools and libraries
- All contributors and users of this project

## 📞 Support

For support and questions:
- Create an issue in the GitHub repository
- Contact the project maintainer

---

**Happy Coding! 🎉**
