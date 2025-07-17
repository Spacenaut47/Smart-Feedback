# SmartFeedback Management System

SmartFeedback is a full-stack feedback management system that allows users to submit categorized feedback with optional images, while administrators can manage, filter, and respond to the feedback through an admin dashboard. Built with **.NET 9 Web API**, **React + Tailwind CSS**, and deployed using **Render** and **Netlify**.

## 🌐 Live Demo

- **Frontend (User + Admin Portal):** [Netlify Deployment]([https://your-frontend.netlify.app](https://smart-feedback-frontend2.netlify.app/))
- **Backend API:** [Render Deployment](https://smart-feedback-backend-aqgu.onrender.com)

---

## 🧩 Tech Stack

| Layer       | Technology                        |
|-------------|------------------------------------|
| Frontend    | React + Vite + TypeScript (or JS) |
| Styling     | Tailwind CSS                      |
| Backend     | ASP.NET Core 9 Web API            |
| Database    | Azure SQL                         |
| Storage     | Azure Blob Storage (for images)   |
| Auth        | JWT Authentication                |
| Deployment  | Render (API), Netlify (Frontend)  |

---

## ✨ Features

### 👤 Users
- Register & login securely using JWT
- Submit feedback with:
  - Heading
  - Category & Subcategory (predefined)
  - Message
  - Optional image upload
- View previously submitted feedbacks with:
  - Status (Pending / Resolved / In Progress)
  - Submitted date
  - Attached image preview
- Logout functionality

### 🛡️ Admins
- Access Admin Dashboard after login
- View all feedbacks from users
- Update feedback status
- Filter by category/subcategory/status
- View user details and submitted feedbacks
- Promote/demote user roles
- Analytics dashboard (chart-based)
- Future scope: audit logs, activity tracking

---
