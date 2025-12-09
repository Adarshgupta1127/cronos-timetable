<div align="center">
</div>


This contains everything you need to run your app locally.

## Run Locally

**Prerequisites:**  Node.js

Key Features
🎯 Core Capabilities
✅ Automatic Conflict Detection - Prevents overlapping sessions, double-booked instructors, and room capacity violations

✅ Deterministic Scheduling - Uses graph coloring and constraint satisfaction algorithms

✅ Multiple Timetable Generation - Generate and compare different schedule versions

✅ Real-time Validation - Immediate conflict detection during manual adjustments

✅ Cross-Platform - Works seamlessly on Android, iOS, and Web

🔧 Technical Highlights
Graph-Based Scheduling - Represent scheduling tasks as graph nodes with conflict-free time slot assignment

Constraint Satisfaction - Backtracking with forward checking for schedule validation

Interval Trees - Efficient detection of overlapping sessions across resources

Modular Architecture - Clean separation between mobile frontend and backend services

📱 Mobile Application Screens
User Interface
Splash Screen - Brand introduction and loading

Authentication Screen - Secure user login/signup

Home Dashboard - Overview and quick actions

Create New Timetable - Initiate new schedule generation

Input Constraints - Define scheduling parameters

Conflict Rules - Configure conflict prevention rules

Generated Timetable - View and interact with schedules

Timetable Comparison - Compare multiple schedule versions

Conflict Detection & Resolution - Identify and fix conflicts

Manual Editing Screen - Custom schedule adjustments

Saved Timetables - Version management and history

Settings Screen - User preferences and configuration

🖥️ Admin Portal
Administration Interface
Admin Login - Secure administrative access

Institution Configuration - Organization setup and management

Room & Resource Management - Facility and equipment allocation

Instructor Availability - Faculty schedule configuration

Subject/Module Setup - Course and curriculum management

Constraint Editor Panel - Advanced rule configuration

Timetable Generation Dashboard - Central scheduling control

Conflict Logs Viewer - Audit trail and issue tracking

Timetable Export - Schedule distribution in multiple formats

🏗️ System Architecture
Frontend
Framework: Flutter (Cross-platform mobile development)

State Management: Provider/Riverpod

UI Components: Custom widgets with Material Design

Local Storage: Hive/SQFlite for offline capability

Backend
Runtime: Node.js with Express.js / FastAPI (Python)

Database: PostgreSQL with Prisma ORM

API Design: RESTful architecture with JWT authentication

Real-time Features: WebSocket for live updates
