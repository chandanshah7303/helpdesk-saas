# 🎫 Helpdesk SaaS — Multi-Tenant Complaint & Ticket Management System

A production-oriented **Multi-Tenant Helpdesk SaaS API** built with **Node.js, Express.js, MongoDB, Mongoose, JWT and Zod**.

The system allows organizations such as hospitals, colleges, companies, and institutions to manage complaints and support requests through a complete ticket lifecycle.

It implements **JWT authentication, Role-Based Access Control (RBAC), multi-tenant data isolation, ticket assignment, status workflows, comments, audit history, dashboards, validation and centralized error handling.**

---

## 🚀 Project Overview

In a large organization, users continuously face problems such as:

- IT issues
- Payment problems
- Academic issues
- Hostel complaints
- Access problems
- Hardware/software issues
- General support requests

Managing these complaints through email, WhatsApp or spreadsheets becomes difficult to track.

This project provides a centralized system where users can create complaints as **tickets**, administrators can assign them to support agents, agents can work on them, and the complete activity can be tracked through comments and audit logs.

### Example

```text
Requester
    │
    │ Creates complaint
    ▼
Ticket
    │
    │ Admin assigns
    ▼
Agent
    │
    │ Works on ticket
    ▼
In Progress
    │
    ▼
Resolved
    │
    │ Admin closes
    ▼
Closed