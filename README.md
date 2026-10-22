# 🎬 Reelix - Cinema Ticket Booking & Movie Management Platform

<div align="center">

![React](https://img.shields.io/badge/React-19.2-blue?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?logo=tailwind-css&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-Express_5-339933?logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose_9-47A248?logo=mongodb&logoColor=white)
![Clerk](https://img.shields.io/badge/Auth-Clerk-6C47FF?logo=clerk&logoColor=white)
![TMDB](https://img.shields.io/badge/API-TMDB-01D277?logo=themoviedatabase&logoColor=white)

**A modern, full-stack cinema ticketing application featuring interactive seat layouts, live TMDB integrations, personal watchlist reminders, booking modifications, and a comprehensive admin management suite.**

[Features](#-key-features) • [Tech Stack](#-tech-stack) • [Project Architecture](#-project-architecture) • [Getting Started](#-getting-started) • [Environment Variables](#-environment-variables) • [API Routes](#-api-endpoints)

</div>

---

## 🌟 Key Features

### 🍿 User Experience
- **Interactive Theater Seat Selection:**
  - Visual seat layout with dynamic row lettering and number grids.
  - Real-time seat occupancy detection (taken seats are disabled with clear status indicators).
  - Dynamic subtotal, tax calculation, and instant booking reservation.
- **My Bookings & Self-Service Management (`/my-bookings`):**
  - View all active and past movie reservations with QR verification.
  - **Edit Bookings:** Swap seats, add new seats, remove existing seats, or change showtimes with automated price adjustment.
  - **Cancellation:** One-click booking cancellation with instant seat release in MongoDB.
- **TMDB Upcoming Releases & Personal Watchlist (`/releases`):**
  - Real-time feed of upcoming blockbuster releases directly from The Movie Database (TMDB).
  - Dual-tab interface: **All Upcoming Releases** and **My Watchlist & Reminders**.
  - One-click reminder button with local persistent storage and quick access to movie synopsis, ratings, and release dates.
  - Direct ticket booking link if an upcoming film is already scheduled in theaters.
- **Trailers & Media Showcase:**
  - Dedicated video player section highlighting latest trailers and teasers.
- **Favorites & Search:**
  - Search movies by title, genre, or keyword with real-time filtering.
  - User favorites management with quick navigation to upcoming watchlists.

### 🛡️ Admin Suite (`/admin`)
- **Dashboard Overview:** Live business metrics, ticket counts, revenue tracking, and occupancy analytics.
- **Show Scheduling (`/admin/add-shows`):**
  - Search any movie or TV series from TMDB or pick from now-playing films.
  - Assign theaters, start dates, custom showtimes, and ticket pricing.
- **Show Management (`/admin/list-shows`):**
  - Live list of all scheduled shows with quick inline editing of ticket prices and scheduled timings.
  - Delete expired or cancelled shows.
- **Booking Administration (`/admin/list-bookings`):**
  - Full table of customer bookings with search filter by movie, customer name, or booking ID.
  - Admin booking editor: modify customer seats, change timings, and toggle payment confirmation (`isPaid`).
  - Delete or void bookings with automatic seat deallocation.
- **Theater & Screen Management (`/admin/theaters`):**
  - Add cinema halls, screen configurations, locations, and seating capacities.
- **Trailers Management (`/admin/trailers`):**
  - Add, update, or remove featured movie trailers displayed on the homepage.

---

## 🛠️ Tech Stack

### Frontend (`client/`)
| Technology | Description |
| :--- | :--- |
| **React 19** | Core component framework |
| **Vite 8** | Next-generation frontend bundler and dev server |
| **Tailwind CSS v4** | Modern utility-first CSS styling |
| **React Router v7** | Client-side routing and URL state management |
| **Clerk React** | User authentication, user profiles, and session management |
| **Lucide React** | Sleek, consistent iconography |
| **React Hot Toast** | Smooth, accessible toast notifications |
| **React Player** | Responsive YouTube/HLS trailer playback |

### Backend (`server/`)
| Technology | Description |
| :--- | :--- |
| **Node.js & Express 5** | High-performance RESTful API server |
| **MongoDB & Mongoose 9** | NoSQL database for shows, movies, bookings, and users |
| **Clerk Express** | JWT verification and role-based admin middleware |
| **TMDB API** | Live movie data, poster imagery, and upcoming release feeds |
| **Inngest** | Serverless background job queue and event handling |
| **Stripe** | Payment gateway integration |
| **Cloudinary** | Cloud storage for promotional banners and assets |

---

## 📁 Project Architecture

```plaintext
Reelix/
├── client/                     # Vite + React Frontend
│   ├── public/                 # Static assets
│   ├── src/
│   │   ├── assets/             # Images, mock data, and logos
│   │   ├── components/         # Reusable UI components
│   │   │   ├── admin/          # Admin sidebar, edit modals, tables
│   │   │   ├── EditBookingModal.jsx  # Reusable seat & time modification modal
│   │   │   ├── MovieCard.jsx   # Movie showcase card
│   │   │   ├── Navbar.jsx      # Navigation bar with role-aware links
│   │   │   ├── Footer.jsx      # Footer with privacy policy and links
│   │   │   └── TrailersSection.jsx
│   │   ├── context/            # Global AppContext (auth, shows, trailers)
│   │   ├── pages/              # Primary route pages
│   │   │   ├── admin/          # Admin panel views (Dashboard, AddShows, ListBookings...)
│   │   │   ├── Home.jsx        # Landing page with hero & trailers
│   │   │   ├── Movies.jsx      # Movie catalog & filtering
│   │   │   ├── MovieDetails.jsx# Details, synopsis, and showtime picker
│   │   │   ├── SeatLayout.jsx  # Interactive theater seat picker & checkout
│   │   │   ├── MyBookings.jsx  # User booking history, editing & cancellations
│   │   │   ├── Releases.jsx    # TMDB upcoming releases & personal watchlist
│   │   │   └── Theaters.jsx    # Cinema locations and screen listings
│   │   └── App.jsx             # Route definitions & layout wrapping
│   ├── .env.example            # Client environment template
│   └── package.json
│
├── server/                     # Node.js + Express API Backend
│   ├── config/                 # Database connection (db.js) & inngest.js
│   ├── controllers/            # Request handlers
│   │   ├── adminController.js  # Admin metrics & management logic
│   │   ├── bookingController.js# Seat reservations, edits, and cancellations
│   │   ├── showController.js   # Shows, TMDB fetch, and showtime schedules
│   │   └── userController.js   # Favorites & profile operations
│   ├── middleware/             # Clerk auth verification & admin guard
│   ├── models/                 # Mongoose schemas (Booking, Movie, Show, User)
│   ├── routes/                 # Express route definitions
│   │   ├── adminRoutes.js
│   │   ├── BookingRoutes.js
│   │   ├── showRoutes.js
│   │   └── userRoutes.js
│   ├── server.js               # Express application entrypoint
│   ├── .env.example            # Server environment template
│   └── package.json
│
├── .gitignore                  # Security-first Git ignore configuration
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or newer recommended)
- [MongoDB](https://www.mongodb.com/) (Atlas cluster or local instance)
- [Clerk Account](https://clerk.com/) for authentication
- [TMDB Account](https://www.themoviedb.org/documentation/api) for movie data API key

---

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/reelix.git
cd reelix
```

---

### 2. Backend Setup
```bash
cd server
npm install
```

Create your `.env` configuration from the provided template:
```bash
cp .env.example .env
```
Fill in your credentials in `server/.env`:
```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/reelix
CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
TMDB_API_KEY=your_tmdb_api_key_here
INGEST_EVENT=...
INGEST_SIGNING_KEY=...
```

Start the backend server:
```bash
# Development with hot-reload
npm run server

# Production mode
npm start
```
The server will start on `http://localhost:3000`.

---

### 3. Frontend Setup
Open a separate terminal and navigate to `client`:
```bash
cd client
npm install
```

Create your client environment configuration:
```bash
cp .env.example .env
```
Update `client/.env` with your frontend values:
```env
VITE_BASE_URL=http://localhost:3000
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_CURRENCY=$
```

Launch the Vite development server:
```bash
npm run dev
```
Open your browser at `http://localhost:5173`.

---

## 🔐 Environment Variables

### Backend (`server/.env`)
| Variable | Description |
| :--- | :--- |
| `MONGODB_URI` | MongoDB connection connection string |
| `CLERK_PUBLISHABLE_KEY` | Clerk authentication publishable key |
| `CLERK_SECRET_KEY` | Clerk authentication secret key |
| `TMDB_API_KEY` | TMDB API v3 developer key |
| `INGEST_EVENT` / `INGEST_SIGNING_KEY` | Inngest background event processing keys |

### Frontend (`client/.env`)
| Variable | Description |
| :--- | :--- |
| `VITE_BASE_URL` | Base endpoint for the backend API (`http://localhost:3000`) |
| `VITE_CLERK_PUBLISHABLE_KEY` | Clerk public authentication key |
| `VITE_CURRENCY` | Default currency symbol displayed across the app (`$`) |

> [!IMPORTANT]
> All sensitive `.env` files are ignored by git in [`.gitignore`](.gitignore). Always use [`.env.example`](server/.env.example) as reference templates and never commit real secret keys.

---

## 📡 API Endpoints

### Shows & Movies (`/api/show`)
- `GET /api/show/all` - Retrieve all available scheduled cinema shows.
- `GET /api/show/upcoming` - Fetch live upcoming releases from TMDB (with pagination).
- `GET /api/show/search` - Search TMDB catalog for movies or series to add.
- `GET /api/show/:id` - Get specific show information and seat occupancy.
- `POST /api/show/add` - *(Admin)* Create a new show schedule for a movie.

### Bookings (`/api/booking`)
- `GET /api/booking/user` - Retrieve bookings for the authenticated user.
- `GET /api/booking/details/:id` - Fetch single booking details with occupied seat maps.
- `POST /api/booking/create` - Reserve seats and create a new booking.
- `PUT /api/booking/:id` - Modify booking seats or switch showtimes.
- `DELETE /api/booking/:id` - Cancel booking and release reserved seats.

### Admin Operations (`/api/admin`)
- `GET /api/admin/dashboard` - Get overall platform analytics (sales, bookings, shows).
- `GET /api/admin/is-admin` - Verify if the logged-in Clerk user has admin privileges.
- `GET /api/admin/bookings` - Retrieve all customer bookings across all theaters.
- `PUT /api/admin/booking/:id` - Update customer booking details or payment status.
- `DELETE /api/admin/booking/:id` - Cancel and remove a booking as administrator.
- `DELETE /api/admin/show/:id` - Remove an existing show schedule.

---

## 🔒 Security & Privacy

- **Protected Secrets:** MongoDB credentials and API keys are strictly protected and untracked from Git version control.
- **Authentication:** All booking modifications and administrative routes require verified JWT tokens via Clerk.
- **Seat Race Condition Protection:** Seat layout bookings check occupancy dynamically before confirming transactions.
- **Privacy Policy:** Includes a dedicated `/privacy-policy` route detailing data storage and user rights.

---

## 📄 License

This project is licensed under the ISC License.
