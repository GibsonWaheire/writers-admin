# Writers Admin Application

A full-stack application for managing writers and orders, with separate client (frontend) and server (backend) components.

## Project Structure

```
writers-admin/
├── client/          # React + TypeScript frontend
│   ├── src/         # Source code
│   ├── public/      # Static assets
│   └── package.json # Frontend dependencies
│
├── server/          # Flask + SQLite backend
│   ├── app.py       # Flask application
│   ├── models.py    # Database models
│   ├── routes/      # API route handlers
│   ├── seed_db.py   # Database seeding script
│   └── requirements.txt
│
└── db.json          # Initial data (used for seeding)
```

## Quick Start

### Backend Setup

1. Navigate to server directory:
```bash
cd server
```

2. Create virtual environment and install dependencies:
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

3. Seed the database:
```bash
python seed_db.py
```

4. Start the Flask server:
```bash
python app.py
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## Technology Stack

### Backend
- **Flask** - Web framework
- **SQLite** - Database
- **Flask-SQLAlchemy** - ORM
- **Flask-CORS** - Cross-origin resource sharing

### Frontend
- **React** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Routing

## API Documentation

See `server/README.md` for detailed API endpoint documentation.

## Development

Both client and server support hot-reload during development. Make sure both servers are running for full functionality.

## Production Deployment

1. Build the frontend:
```bash
cd client
npm run build
```

2. Configure the backend to serve static files or use a reverse proxy (nginx, etc.)

3. Set environment variables appropriately for production.
