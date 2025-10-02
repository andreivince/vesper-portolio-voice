# AI Agent Portfolio

Full-stack application with Next.js frontend and FastAPI backend.

## Project Structure

```
.
├── frontend/          # Next.js application (TypeScript + Tailwind CSS)
├── backend/           # FastAPI application (Python)
└── pnpm-workspace.yaml
```

## Prerequisites

- Node.js 18+ and pnpm
- Python 3.11+

## Setup

### Install Frontend Dependencies

```bash
pnpm install
```

### Setup Python Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

## Development

### Run Both Frontend and Backend

```bash
pnpm dev
```

### Run Separately

Frontend (http://localhost:3000):
```bash
pnpm dev:frontend
```

Backend (http://localhost:8000):
```bash
pnpm dev:backend
# Or manually:
cd backend
source venv/bin/activate
uvicorn main:app --reload
```

## API Endpoints

- `GET /` - Root endpoint
- `GET /api/health` - Health check

## Tech Stack

### Frontend
- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- Turbopack

### Backend
- FastAPI
- Python 3.11
- Uvicorn
# vesper-portolio-voice
