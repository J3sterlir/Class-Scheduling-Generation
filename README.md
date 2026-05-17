# IAE Scheduler

An intelligent class scheduling system that automates the creation and management of academic schedules while detecting and resolving conflicts.

## Overview

IAE Scheduler is a full-stack web application designed to streamline the process of generating and managing class schedules. It automatically creates optimal schedules based on available rooms, courses, and time slots, while intelligently detecting and helping resolve scheduling conflicts.

## Features

### Dashboard
- **Overview Dashboard** - View key metrics including total schedules, scheduled vs. pending classes, and active conflicts
- **Recent Schedules** - Quick access to your 5 most recent schedule assignments
- **Quick Actions** - Fast navigation to schedule management, room availability, and conflict resolution

### Schedule Management
- **Generate Schedules** - Automatically generate optimized schedules for all course offerings using intelligent algorithms
- **My Schedules** - View, search, and manage all created schedules with real-time status tracking
- **Create Custom Schedules** - Manually create individual schedules with room and time assignments
- **Update Schedules** - Modify room assignments or time slots for existing schedules
- **Schedule Reset** - Clear all schedules and start fresh (requires confirmation)

### Conflict Detection & Resolution
- **Automatic Conflict Detection** - System identifies scheduling conflicts (room double-booking, section overlaps)
- **Conflict Dashboard** - View all detected conflicts with detailed information
- **Ignore Conflicts** - Mark specific conflicts as acknowledged without resolving them
- **Manual Resolution** - Reassign schedules to different time slots and rooms to resolve conflicts
- **Conflict Statistics** - Track total conflicts and resolution progress

### Room Management
- **Room Directory** - Browse all available rooms with capacity and type information
- **Room Availability Search** - Check room availability for specific days and times
- **Add Rooms** - Create new room entries with capacity and classification
- **Update Room Details** - Modify room information and capacity
- **Remove Rooms** - Delete room entries from the system

### Course Management
- **Course Sync** - Sync course offerings from the Course Management Subsystem
- **Course Directory** - View all course offerings with sections and enrollment data
- **Course Analytics** - See aggregate statistics including average capacity, total enrollment, and credit hours
- **Sync Status** - Track when courses were last synchronized

### Authentication & Security
- **Google OAuth 2.0** - Secure login using your Google account
- **Session Management** - Automatic JWT-based authentication for protected routes
- **User Profile** - Personalized dashboard with user information
- **Secure Logout** - End your session securely

## Technical Stack

### Frontend
- **Framework**: React 19 with TypeScript
- **Routing**: React Router v7 for single-page navigation
- **Styling**: Tailwind CSS v4 for responsive, modern design
- **Icons**: React Icons library for consistent UI elements
- **Build Tool**: Vite for optimized development and production builds

### Backend
- **Framework**: Express.js for RESTful API
- **Database**: PostgreSQL with node-postgres (pg) driver
- **Authentication**: Passport.js with Google OAuth 2.0 strategy
- **Authorization**: JWT (JSON Web Tokens) for session management

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL database
- Google OAuth 2.0 credentials (Client ID and Client Secret)

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Backend Setup
```bash
cd backend
npm install
npm run dev
```

## User Guide

1. **Login** - Sign in using your Google account
2. **View Dashboard** - Review current scheduling status and recent schedules
3. **Generate Schedules** - Use auto-generation for quick schedule creation
4. **Check Conflicts** - Monitor and resolve any scheduling conflicts
5. **Manage Resources** - Update room availability and course offerings as needed
6. **Monitor Progress** - Track schedule completion through the dashboard metrics

## License

ISC

## Support

For issues or questions about IAE Scheduler, please contact your system administrator.