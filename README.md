# Friasoft School Management System

A comprehensive school management system designed for African schools with offline-first capabilities, low-cost hosting, and multi-platform support.

**Goal**: Increase school operational efficiency by 40% within 6 months.

## 🎯 Key Features

- ✅ **Multi-tenant School Management** - Manage multiple schools in one system
- ✅ **User Management** - Role-based access control (Admin, Teacher, Accountant, Secretary, Parent)
- ✅ **Student Management** - Enrollment, profiles, attendance tracking
- ✅ **Academic Management** - Grades, timetables, subjects, exam results
- ✅ **Financial Management** - Invoice generation, payment tracking, Orange Money integration
- ✅ **Communication** - Email, SMS, and in-app notifications
- ✅ **Offline-First Architecture** - Works seamlessly with limited internet connectivity
- ✅ **Cross-Platform** - Web app (PWA) + Mobile apps (iOS/Android via React Native)
- ✅ **Low-Cost** - ~$5-10/month total hosting cost
- ✅ **Secure** - JWT authentication, encrypted passwords, role-based permissions

## 📊 Impact Targets

| Stakeholder | Impact | Metric |
|------------|--------|--------|
| Administrators | Reduce workload by 50% | 5 hours/week saved |
| Teachers | Save time on admin | 5 hours/week saved |
| Parents/Students | Better communication | 70% satisfaction increase |
| Accountants | Fewer billing errors | 80% error reduction |

## 🏗️ Project Structure

```
friasoft-school-management/
├── backend/                 # Node.js + Express API
│   ├── src/
│   │   ├── config/         # Database, Redis config
│   │   ├── routes/         # API endpoints
│   │   ├── controllers/    # Business logic
│   │   ├── models/         # Database queries
│   │   ├── middleware/     # Auth, validation
│   │   ├── services/       # Reusable functions
│   │   ├── database/       # Schema, migrations
│   │   └── utils/          # Helper functions
│   └── README.md           # Backend setup guide
│
├── frontend/                # React Web App + PWA
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── store/
│   │   └── utils/
│   └── README.md           # Frontend setup guide
│
├── mobile/                  # React Native Mobile App
│   ├── app/
│   ├── src/
│   │   ├── screens/
│   │   ├── components/
│   │   ├── services/
│   │   └── utils/
│   └── README.md           # Mobile setup guide
│
├── docs/                    # Documentation
│   ├── architecture.md      # System architecture
│   ├── api-endpoints.md     # API documentation
│   ├── database-schema.md   # Database guide
│   └── deployment.md        # Deployment guide
│
└── README.md               # This file
```

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18
- PostgreSQL >= 12
- Redis (optional, for caching)
- Git

### Backend Setup

```bash
cd backend
cp .env.example .env
npm install
npm run db:migrate
npm run dev
```

Visit: http://localhost:5000/api/health

### Frontend Setup (Coming Soon)

```bash
cd frontend
npm install
npm start
```

### Mobile Setup (Coming Soon)

```bash
cd mobile
npm install
npm start
```

## 📋 Development Roadmap

### Phase 1: Foundation (Sprint 0-1) ✅ IN PROGRESS
- [x] Project structure setup
- [x] Database schema design
- [x] Backend initialization
- [ ] Database setup (PostgreSQL)
- [ ] Authentication system

### Phase 2: MVP Features (Sprint 2-4)
- [ ] School management APIs
- [ ] User management APIs
- [ ] Student management APIs
- [ ] Class & academic APIs
- [ ] Grade management APIs
- [ ] Financial management APIs

### Phase 3: Frontend (Sprint 5-6)
- [ ] React app setup
- [ ] Dashboard pages
- [ ] Grade entry
- [ ] Invoice management
- [ ] Offline support with Service Workers

### Phase 4: Mobile App (Sprint 7-8)
- [ ] React Native setup
- [ ] Core screens (dashboard, grades, timetable)
- [ ] Offline-first architecture
- [ ] Push notifications

### Phase 5: Advanced Features (Sprint 9-10)
- [ ] Notification system (email, SMS, in-app)
- [ ] Orange Money integration
- [ ] Reporting & analytics
- [ ] Attendance tracking

### Phase 6: Testing & Deployment (Sprint 11)
- [ ] Unit tests
- [ ] Integration tests
- [ ] E2E tests
- [ ] Production deployment

## 💾 Technology Stack

| Component | Technology | Why Chosen |
|-----------|-----------|-----------|
| **Backend** | Node.js + Express | Fast, lightweight, great for offline-first |
| **Database** | PostgreSQL | Reliable, powerful, good for complex queries |
| **Caching** | Redis | Improves performance, manages sessions |
| **Frontend** | React + PWA | Modern, offline support, cross-platform |
| **Mobile** | React Native | Single codebase for iOS/Android |
| **Auth** | JWT + bcryptjs | Secure, stateless, scalable |
| **Hosting** | Railway/Vercel | Affordable, automatic scaling |
| **Email** | SendGrid | Free tier: 100/day |
| **Payments** | Orange Money | Local payment for Guinea |

## 🔐 Security Features

- ✅ Password hashing with bcryptjs
- ✅ JWT token authentication (7-day expiration)
- ✅ Role-based access control
- ✅ CORS protection
- ✅ Helmet.js for HTTP headers
- ✅ Rate limiting on sensitive endpoints
- ✅ SQL injection prevention
- ✅ Input validation with Joi

## 📚 API Documentation

Complete API documentation is available at: [API Endpoints](./docs/api-endpoints.md) (Coming Soon)

### Example: Health Check

```bash
curl http://localhost:5000/api/health
```

Response:
```json
{
  "status": "OK",
  "timestamp": "2024-01-15T14:30:00.000Z",
  "message": "Friasoft School Management API is running",
  "version": "0.1.0"
}
```

## 💰 Cost Estimate

| Service | Cost | Notes |
|---------|------|-------|
| Backend (Railway) | $5/month | 512MB RAM, auto-scaling |
| Database (Railway) | Included | 1GB storage included |
| Redis (Upstash) | Free | 10k req/day free tier |
| Frontend (Vercel) | Free | Unlimited deployments |
| Mobile (Expo) | Free | Build service included |
| Domain (Namecheap) | $1/year | Economy domain |
| Email (SendGrid) | Free | 100 emails/day |
| **Total** | **~$5-10/month** | Scalable as you grow |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: Add amazing feature'`)
4. Push to the branch (`git push origin feat/amazing-feature`)
5. Open a Pull Request

## 📖 Documentation

- [Backend Setup](./backend/README.md)
- [Frontend Setup](./frontend/README.md) (Coming Soon)
- [Mobile Setup](./mobile/README.md) (Coming Soon)
- [Database Schema](./docs/database-schema.md) (Coming Soon)
- [API Endpoints](./docs/api-endpoints.md) (Coming Soon)
- [Deployment Guide](./docs/deployment.md) (Coming Soon)

## 🐛 Bug Reports & Support

Found a bug or have a suggestion? Please open an issue on GitHub.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 👥 Team

**Friasoft School Management System**
- Built for African schools
- Optimized for offline operation
- Designed for low-cost deployment

## 🎓 Use Cases

- **École Secondaire** - High school management in Guinea
- **Centre de Formation** - Vocational training center
- **Université Privée** - Private universities
- **École Internationale** - International schools in Africa

## 🌍 Localization

- 🇬🇳 French (Guinea) - Primary language
- 🇬🇧 English - Secondary language
- 💱 West African currencies (GNF, CFA)
- 📱 Low-bandwidth optimization

---

**Status**: 🚀 In Development
**Last Updated**: November 5, 2024
**Contributors**: Friasoft Team
