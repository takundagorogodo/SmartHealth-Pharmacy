# 🏥 SmartPharmacy

A scalable, production-ready **AI-Powered Healthcare Platform** built with the **MERN Stack**, **Groq AI**, and **Tailwind CSS**, designed to deliver seamless medical consultations, intelligent symptom analysis, and real-time doctor-patient communication.

This project demonstrates strong expertise in **full-stack development**, **AI integration**, **authentication strategies**, and **scalable healthcare application design** — making it suitable for showcasing in professional portfolios and technical interviews.

---

## 🎯 Problem Statement & Motivation

Access to quality healthcare remains a challenge for many people due to long wait times, limited availability of doctors, and lack of immediate medical guidance. Patients often turn to unreliable online sources for symptom checks, leading to misinformation and delayed treatment.

SmartPharmacy addresses this by providing an AI-powered symptom checker backed by **Llama 3.3 70B via Groq**, combined with real-time consultations with certified doctors. Patients can describe their symptoms, receive instant AI analysis with medication suggestions, and connect with a verified physician — all from one platform.

The system maintains a full patient health record including allergies, medical history, recurring symptoms, and past consultations, enabling the AI to provide context-aware, personalized medical insights.

---

## 🚀 Overview

SmartPharmacy enables patients to interact with an AI symptom checker, consult with certified doctors, manage their health records, and receive digital prescriptions — all secured with JWT-based authentication and role-based access control.

It is architected using **modular backend design**, **RESTful APIs**, and **secure JWT authentication**.

---

## 🧠 Key Highlights

* 🤖 AI-powered symptom analysis using **Groq + Llama 3.3 70B**
* 🔐 Secure authentication with JWT and bcrypt
* 👨‍⚕️ Role-based access for patients, doctors, and admins
* 📋 Persistent patient health records with full medical history
* 💊 Doctor-issued digital prescriptions
* 💬 Real-time doctor-patient chat consultations
* 📦 Clean, scalable MVC backend architecture
* 🎨 Modern, responsive UI with Tailwind CSS

---

## 🛠️ Tech Stack

### Backend

* Node.js
* Express.js
* MongoDB + Mongoose
* Groq SDK (Llama 3.3 70B)
* JSON Web Token (JWT)
* bcryptjs
* dotenv

### Frontend

* React.js (Vite)
* Tailwind CSS
* Axios
* React Router DOM
* React Hot Toast
* Context API

---

## ✨ Core Features

### 🔐 Authentication & Security

* JWT-based authentication with bcrypt password hashing
* Role-based access control (patient / doctor / admin)
* Protected routes and middleware-based authorization
* Password change with token invalidation
* Auto health record creation on patient registration

---

### 🤖 AI Symptom Checker

* Symptom tag selection + free-text description
* Pain level and duration sliders
* Groq AI analysis with full patient history context
* Returns possible diagnoses with probability levels
* Suggested medications per diagnosis
* Recurring symptom detection and urgent care alerts
* Medical disclaimer on all AI outputs

---

### 👨‍⚕️ Doctor Consultations

* Browse verified doctors with specialization, rating, and experience
* Start a consultation linked to AI analysis
* Real-time chat messaging between patient and doctor
* Doctor adds notes and digital prescriptions
* Consultation lifecycle: ongoing → completed / cancelled
* Doctor's total patients helped tracked automatically

---

### 📋 Health Record Management

* Persistent health record per patient
* Vitals: blood group, weight, height
* Allergies with substance, reaction, and severity
* Medical history with active/resolved conditions
* Current medications with dosage and expiry
* Recurring symptoms tracked across consultations
* Health summary dashboard card

---

## 🏗️ Architecture

### Backend Design

* **MVC Pattern** for separation of concerns
* **Service Layer** for AI symptom analysis
* **Middleware-based Authentication** and error handling
* **Global Error Handler** with AppError class
* **Role-based Route Guards** with restrictTo middleware

### Frontend Design

* **Context API** for global auth state management
* **Component-based architecture** with reusable Navbar and Sidebar
* **API abstraction** using Axios with interceptors
* **ProtectedRoute** component for authenticated pages
* **Role-based Sidebar Navigation** for patients and doctors

---

## 📂 Project Structure

```
backend/
├── config/
│   └── db.js
├── controllers/
│   ├── authController.js
│   ├── consultationController.js
│   └── healthRecordController.js
├── middleware/
│   ├── authMiddleware.js
│   └── errorMiddleware.js
├── models/
│   ├── userModels.js
│   ├── doctorModel.js
│   ├── consultantModel.js
│   └── healthRecord.js
├── routes/
│   ├── mainRoute.js
│   ├── consultationRoutes.js
│   └── healthRecordRoutes.js
├── services/
│   └── aiSymptomChecker.js
├── .env
├── app.js
└── server.js

frontend/
├── src/
│   ├── api/
│   │   └── axios.js
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── Sidebar.jsx
│   │   └── ProtectedRoute.jsx
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── hooks/
│   │   └── useAuth.js
│   ├── pages/
│   │   ├── LandingPage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   └── dashboard/
│   │       ├── DashboardLayout.jsx
│   │       ├── AICheckerPage.jsx
│   │       ├── ConsultationsPage.jsx
│   │       ├── DoctorsPage.jsx
│   │       └── HealthRecordPage.jsx
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
```

---

## ⚙️ Getting Started

### Prerequisites

* Node.js (v18 or higher)
* MongoDB (local or cloud)
* npm or yarn
* Groq API Key → [console.groq.com](https://console.groq.com)

---

### 🔧 Backend Setup

```bash
git clone https://github.com/yourusername/smartpharmacy.git
cd smartpharmacy/backend

npm install
```

Create `.env`:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/hospital
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRES_IN=7d
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Run:

```bash
npm run dev
```

---

### 💻 Frontend Setup

```bash
cd smartpharmacy/frontend
npm install
npm run dev
```

---

## 📡 API Overview

### Authentication

| Method | Endpoint | Access |
|--------|----------|--------|
| `POST` | `/auth/api/register` | Public |
| `POST` | `/auth/api/login` | Public |
| `GET` | `/auth/api/me` | Protected |
| `PATCH` | `/auth/api/change-password` | Protected |

### Consultations

| Method | Endpoint | Access |
|--------|----------|--------|
| `POST` | `/auth/api/consultations/start` | Patient |
| `GET` | `/auth/api/consultations/my` | Patient / Doctor |
| `GET` | `/auth/api/consultations/:id` | Patient / Doctor |
| `POST` | `/auth/api/consultations/:id/message` | Patient / Doctor |
| `POST` | `/auth/api/consultations/:id/prescribe` | Doctor |
| `PATCH` | `/auth/api/consultations/:id/complete` | Doctor |
| `PATCH` | `/auth/api/consultations/:id/cancel` | Patient / Doctor |

### Health Record

| Method | Endpoint | Access |
|--------|----------|--------|
| `GET` | `/auth/api/health-record/me` | Patient |
| `GET` | `/auth/api/health-record/me/summary` | Patient |
| `PATCH` | `/auth/api/health-record/me/vitals` | Patient |
| `POST` | `/auth/api/health-record/me/allergy` | Patient |
| `DELETE` | `/auth/api/health-record/me/allergy/:id` | Patient |
| `POST` | `/auth/api/health-record/me/condition` | Patient |
| `PATCH` | `/auth/api/health-record/me/condition/:id` | Patient |
| `GET` | `/auth/api/health-record/patient/:id` | Doctor |

---

## 🧪 Sample Test Data

### Patient Registration
```json
{
    "name": "Ravi",
    "surname": "Kumar",
    "email": "ravi.kumar@gmail.com",
    "phone": "+263779876543",
    "password": "Patient@1234",
    "gender": "male",
    "age": 28,
    "role": "patient"
}
```

### Doctor Registration
```json
{
    "name": "Ananya",
    "surname": "Patel",
    "email": "ananya.patel@smartpharmacy.com",
    "phone": "+263771234567",
    "password": "Doctor@1234",
    "gender": "female",
    "age": 35,
    "role": "doctor",
    "specialization": "General Physician",
    "licenseNumber": "MCI-2024-001",
    "experienceYears": 12,
    "bio": "Experienced general physician with over 12 years of practice in clinical and hospital settings."
}
```

---

## 🎯 Learning Outcomes

This project demonstrates:

* Designing **AI-integrated healthcare systems**
* Implementing **secure authentication flows (JWT + bcrypt)**
* Structuring **scalable MVC backend architectures**
* Managing **role-based access control**
* Building **persistent health record systems**
* Integrating **third-party AI APIs (Groq + LLaMA)**
* Building **production-level full-stack applications**
* Applying **database design for healthcare systems**

---

## 🔮 Future Enhancements

* 🔔 Real-time notifications with Socket.IO
* 💳 Payment integration for premium consultations
* 📧 Email notifications with Nodemailer
* 📱 Progressive Web App (PWA) support
* 🔍 Doctor search and filter by specialization
* 📊 Admin dashboard for managing doctors and users
* 📁 Medical document and image uploads
* 🎥 Video consultations with WebRTC
* 🌍 Multi-language support

---

## 👨‍💻 Author

**Prosperity Chinokwetu**

Full-Stack Developer | Computer Science Student

---

## 📄 License

This project is intended for educational and portfolio use.

---

## ⭐ Show Your Support

If you found this project useful or impressive:

👉 Give it a **star ⭐ on GitHub**
👉 Share it with others

---

## 📬 Contact

* GitHub Issues (preferred)
* Email: [your@email.com](mailto:your@email.com)

---

> 💡 *Tip: This project is ideal to showcase in interviews when discussing AI integration, healthcare systems, role-based access control, and scalable full-stack architecture.*
