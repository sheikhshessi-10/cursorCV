# 🚀 Smart CV Builder - Multi-User Social Platform

A modern, AI-powered CV builder with social networking features for job seekers to connect, share progress, and support each other.

## ✨ Features

### 🔐 **Authentication System**
- **User Registration**: Sign up with email/password or Google OAuth
- **Secure Login**: Email verification and password protection
- **User Profiles**: Public profiles with customizable information

### 📝 **CV Building & Management**
- **AI-Powered CV Creation**: Get intelligent suggestions for resume optimization
- **Application Tracking**: Monitor internship/job applications with status updates
- **Status Management**: Visual status indicators (Pending, Approved, Rejected)
- **Backend Integration**: Connect with Flask backend for AI processing

### 👥 **Social Networking**
- **Friend System**: Search and connect with other users by name
- **Public Applications**: Share your application progress with the community
- **Activity Feed**: See what your friends are up to
- **Support System**: Like, comment, and encourage fellow job seekers

### 🎯 **User Experience**
- **Responsive Design**: Works on desktop and mobile
- **Real-time Updates**: Live notifications and status changes
- **Search & Filter**: Find applications and users easily
- **Modern UI**: Built with Tailwind CSS and Shadcn/ui components

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI Components**: Tailwind CSS + Shadcn/ui
- **Backend**: Flask (Python) + CrewAI for AI processing
- **Database**: Supabase (PostgreSQL) with Row Level Security
- **Authentication**: Supabase Auth with OAuth support
- **State Management**: React Context + Hooks
- **Deployment**: Vite dev server + ngrok for backend exposure

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Python 3.8+ with Flask
- Supabase account
- ngrok account (for backend exposure)

### 1. **Frontend Setup**
```bash
cd smart-cv-cursor-build-main
npm install
npm run dev
```

### 2. **Backend Setup**
```bash
# Install Python dependencies
pip install flask flask-cors pyngrok crewai

# Start Flask server
python app.py
```

### 3. **Database Setup**
1. Create a Supabase project
2. Run the SQL migrations in `supabase/migrations/`
3. Update `src/lib/supabase.ts` with your credentials

### 4. **Environment Configuration**
- Set up ngrok tunnel for backend exposure
- Update frontend with current ngrok URL
- Configure Supabase RLS policies

## 📱 How to Use

### **For New Users**
1. **Sign Up**: Create account with email/password or Google
2. **Complete Profile**: Add your name, university, major, etc.
3. **Build CV**: Use the AI-powered editor to create your resume
4. **Track Applications**: Add internship/job applications
5. **Connect**: Find and add friends from the community

### **For Existing Users**
1. **Login**: Access your dashboard
2. **Manage Applications**: Update status, add interviews
3. **Social Dashboard**: View friends' progress, send support
4. **Network**: Search for new connections

### **Social Features**
- **Friends Tab**: Search users, send/accept friend requests
- **Public Feed**: View shared applications from the community
- **Activity Feed**: See recent updates from your network
- **Stats**: Track community metrics and your progress

## 🔧 Configuration

### **Backend Endpoints**
- `/suggest-cv`: Get AI suggestions for CV improvement
- `/process-cv`: Process CV with job description matching

### **Database Tables**
- `user_profiles`: User information and settings
- `cvs`: CV and application data
- `friend_connections`: Friend relationships
- `application_comments`: Comments and support
- `notifications`: User notifications
- `activity_feed`: Community activity tracking

### **Security Features**
- Row Level Security (RLS) policies
- User authentication and authorization
- Public/private profile controls
- Secure friend request system

## 🌟 Key Benefits

1. **Community Support**: Connect with fellow job seekers
2. **AI Assistance**: Get intelligent CV optimization suggestions
3. **Progress Tracking**: Visual application status management
4. **Networking**: Build professional relationships
5. **Motivation**: Support and encourage each other

## 🚧 Development Notes

- **Demo Mode**: Fallback authentication for development
- **Error Handling**: Comprehensive error messages and user feedback
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Type Safety**: Full TypeScript implementation
- **Performance**: Optimized queries and lazy loading

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
1. Check the documentation
2. Review existing issues
3. Create a new issue with details
4. Contact the development team

---

**Built with ❤️ for the job-seeking community**
