# Incident Board

A full-stack Incident Management System built with Django REST Framework and React.

## Live Demo

- Frontend: https://incident-board.onrender.com/
- Backend API: https://incident-board-backend.onrender.com/

## Features

### Authentication

- JWT Authentication (HttpOnly Cookies)
- Login / Logout
- Access Token Refresh
- Protected Routes
- Session Restoration after page refresh

### Dashboard

- Incident Summary Metrics
- Status Distribution Chart
- Priority Distribution Chart
- Real-time Statistics

### Incident Management

- Create Incident
- Edit Incident
- View Incident Details
- Search Incidents
- Filter by Status
- Filter by Priority
- Server-side Pagination
- CSV Export

### Workflow Management

- Status Transition Workflow
- Role-based Workflow Actions
- Permission Enforcement
- Activity Tracking

### Comments

- Add Comments
- Delete Comments
- Confirmation Dialog

### Attachments

- Upload Attachments
- Download/Open Attachments
- Delete Attachments
- Physical File Cleanup

### Audit Trail

- Activity Timeline
- Status Changes
- Priority Changes
- Attachment Events
- Comment Events

### User Experience

- Dark Mode
- Toast Notifications
- Loading States
- Error States
- Empty States
- Responsive Layout

## Tech Stack

### Backend

- Python 3.14
- Django 6
- Django REST Framework
- SimpleJWT
- PostgreSQL
- Pytest
- Factory Boy

### Frontend

- React 19
- TypeScript
- Vite
- React Router
- TanStack Query
- React Hook Form
- Zod
- Tailwind CSS v4
- shadcn/ui
- Recharts
- Sonner
- Vitest
- Testing Library

## Project Structure

```text
backend/
├── accounts/
├── incidents/
├── dashboard/
├── reports/
└── config/

frontend/
├── src/
│   ├── app/
│   ├── components/
│   ├── features/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── incidents/
│   │   └── theme/
│   └── lib/
```

## Screenshots

### Dashboard

![Dashboard](/docs/screenshots/dashboard.png)

- KPI cards
- Status chart
- Priority chart

### Incident List

![Incident List](/docs/screenshots/incident-list.png)

- Search
- Filters
- Pagination
- Export

### Incident Detail

![Incident Detail](/docs/screenshots/incident-detail.png)

- Workflow Actions
- Attachments
- Comments
- Activity Timeline

## Local Development

### Backend

```bash
cd backend

uv sync

uv run python manage.py migrate

uv run python manage.py createsuperuser

uv run python manage.py runserver
```

### Frontend

```bash
cd frontend

pnpm install

pnpm dev
```

## Testing

### Backend

```bash
uv run pytest
```

### Frontend

```bash
pnpm test
```

### Coverage

Currently tested:

- Login validation
- Incident list rendering
- API integration
- Backend permissions
- Workflow transitions
- Incident CRUD

## Run with Docker

```bash
cp .env.example .env
docker compose up --build
```

## Future Improvements

- Email Notifications
- WebSocket Notifications
- S3 File Storage
- Role Management UI

## License

MIT