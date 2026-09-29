# Student Management System

A MERN application for creating, viewing, updating, searching, and deleting student records.

## Requirements

- Node.js 18 or newer
- MongoDB running locally, or a MongoDB connection string

## Run locally

1. Install dependencies from the project root:

   ```bash
   npm install
   npm install --prefix backend
   npm install --prefix frontend
   ```

2. Optionally copy `backend/.env.example` to `backend/.env` and set `MONGODB_URI` and `CLIENT_URL`.

3. Start both applications from the project root:

   ```bash
   npm run dev
   ```

   The React app runs at `http://localhost:5173` and the API at `http://localhost:5000`. MongoDB uses `collegeDB` by default.

## API

| Method | Endpoint | Action |
| --- | --- | --- |
| `GET` | `/students` | List students |
| `POST` | `/students` | Add a student |
| `PUT` | `/students/:id` | Update a student |
| `DELETE` | `/students/:id` | Delete a student |

Set `VITE_API_URL` in `frontend/.env` to override the API URL. Student emails must be unique; names and courses are required, and age must be an integer from 1 to 120.