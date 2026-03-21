# Smart Locker Network System — Frontend

##  Overview

Frontend part of the **Smart Locker Network System**, providing user interfaces for interacting with a distributed network of automated lockers.

The application supports three roles:

- **User**
- **Operator**
- **Administrator**

Each role has a dedicated interface and set of actions.

---

##  Architecture Principles

- Role-Based Access Control
- Separation of concerns by roles
- Event-driven UI for device interaction
- Asynchronous state handling
- Protected routes with authentication

---

##  Authentication

### Login
- Input email  
- Input password  

### Register
- Input name  
- Input email  
- Input phone  
- Input password  

### Logout
- Manual logout available

---

##  Start Page (Public)

Accessible without authentication.

### Actions:
- Navigate to Login
- Navigate to Register
- Synch Health Check (down page)

### Information:
- View available lockers (read-only)
- View locations
- Pricing model
- General information about the Smart Locker system

---

##  User Role

### Dashboard
- View active rent
- View lockers summary

---

### Lockers
- View available lockers
- Filter by size (S / M / L)
- Select locker

---

### Booking
- Book locker (instant)
- Confirm booking

---

### Active Rent
- View locker information
- View timer (24h limit)
- Open locker (asynchronous)
- Close locker (asynchronous)
- End rent

---

### Profile
- Change name
- Change phone
- Change password

---

##  Operator Role

### Dashboard
- View lockers summary
- View active sessions
- View system errors

---

### Lockers
- View all lockers
- Change status:
  - available
  - occupied
  - faulty

---

### Manual Control
- Force open locker
- View locker + user relation

---

### Sessions
- View active sessions

---

### Monitoring
- View device errors
- Detect offline devices

---

##  Administrator Role

### Dashboard
- View system overview
- View errors summary

---

### Users
- View users list
- Edit user information
- Delete user

---

### Errors
- View logs (INFO / WARN / ERROR)
- Filter by deviceId
- Filter by time range
- Filter by type

---

### Statistics
- View locations statistics
- View lockers usage
- View active bookings
- View booking history

---

##  Device Interaction (Asynchronous)

Locker operations are handled asynchronously.

### Supported actions:
- Open locker
- Close locker

### UI States:
- Pending (loading)
- Success
- Error
---

## Session & Time Handling

- Active rent duration: **24 hours**
- Timer is displayed in UI
- System should handle rent expiration

---

##  Security

- Authentication required for all protected routes
- Role-based access control
- Automatic logout on session invalidation

---

##  Navigation Flow
Start Page
↓
Login / Register
↓
Role-based redirect
↓
User / Operator / Admin dashboards


---

##  Scope Notes

- Payments are mocked (no real integration)
- Public data on Start Page is read-only
- Real-time updates may be implemented via polling or WebSocket

---


