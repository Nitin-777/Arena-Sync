
---

# 📄 Arena Sync — Technical README

```markdown
# Arena Sync  
Turf Booking Platform

Live Demo: https://arena-sync-omega.vercel.app/

---

## Overview
Arena Sync is a full-stack web application designed to manage turf bookings with real-time availability and dynamic pricing. The system enables users to search, schedule, and manage bookings while providing administrators with tools to control pricing, availability, and user activity.

The platform is built with a focus on scalability, secure transactions, and efficient booking conflict management.

---

## Core Features

- Turf discovery and booking system
- Real-time slot availability management
- Dynamic pricing based on time slots and demand
- OTP-based authentication mechanism
- Online payments via Razorpay integration
- Admin dashboard for turf and booking management
- Booking lifecycle management (creation, cancellation, refund handling)

---

## System Architecture

- RESTful API-based backend
- Modular service-based structure
- Secure authentication flow using OTP verification
- Transaction handling integrated with payment gateway
- Database-driven booking validation to prevent conflicts

---

## Tech Stack

### Frontend
- React.js
- TailwindCSS

### Backend
- Node.js
- Express.js

### Database
- PostgreSQL

### Integrations
- Razorpay Payment Gateway

---

## Key Engineering Decisions

- Use of relational database (PostgreSQL) for transactional consistency
- Server-side validation to prevent double booking
- Modular backend design for scalability and maintainability
- Secure payment flow integration with Razorpay APIs

---

## Setup Instructions

```bash
git clone https://github.com/Nitin-777/arena-sync
cd arena-sync
npm install
npm start
