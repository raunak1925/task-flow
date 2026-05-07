# TaskFlow - Project Management System

A complete project management web application with role-based access control (Admin/Member).

## 🚀 Live Demo
[https://taskflowapp.up.railway.app](https://taskflowapp.up.railway.app)

## 📋 Features

### Authentication
- Signup / Login with JWT authentication
- Secure password hashing with bcrypt

### Role-Based Access Control
- **Admin**: Full control (create/delete projects, create/edit/delete tasks, assign tasks to anyone)
- **Member**: Limited access (view only assigned tasks, update task status)

### Project Management
- Create projects with name and description
- View all projects with task counts
- Delete projects (Admin only)

### Task Management
- Create tasks with title, priority, status, due date
- Assign tasks to team members
- Update task status (Todo → In Progress → Done)
- Edit and delete tasks
- Overdue task highlighting

### Dashboard
- Real-time statistics (total projects, total tasks, completed tasks, overdue tasks)
- Project and task listings
- Responsive design for all devices

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| Frontend | HTML5, CSS3, JavaScript |
| Backend | Node.js, Express.js |
| Database | SQLite3 |
| Authentication | JWT, bcryptjs |
| Deployment | Railway / Render |

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)

### Steps

1. **Clone the repository**
```bash
git clone https://github.com/asthasingh0110/taskflowapp.git
cd taskflowapp