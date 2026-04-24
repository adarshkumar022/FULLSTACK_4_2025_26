# TalentTrack Job Portal

A MERN job portal with:

- Sign up and sign in
- Home page with job listings and one-click applications
- Dashboard with user details and applied jobs
- Express API with MongoDB persistence

## Setup

```bash
npm install
cp .env.example .env
```

Update `.env` if your MongoDB connection is different:

```bash
MONGODB_URI=mongodb://127.0.0.1:27017/new_job_portal
JWT_SECRET=replace-this-with-a-long-random-secret
```

## Run

```bash
npm run dev
```

Open `http://localhost:5173`.

If port `5000` is already in use, run the backend and frontend separately:

```bash
PORT=5001 npm run start
VITE_API_PROXY_TARGET=http://localhost:5001 npm run client
```

## API

- `POST /api/auth/signup`
- `POST /api/auth/signin`
- `GET /api/jobs`
- `POST /api/applications`
- `GET /api/applications/me`
