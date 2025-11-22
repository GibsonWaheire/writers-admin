# Writers Admin Backend (Flask)

Backend API server for the Writers Admin application.

## Setup

1. Create and activate virtual environment:
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Create `.env` file (copy from `.env.example` if needed):
```bash
DATABASE_URL=sqlite:///writers_admin.db
SECRET_KEY=your-secret-key-here
FLASK_ENV=development
FLASK_DEBUG=1
```

4. Initialize database and seed data:
```bash
python seed_db.py
```

5. Run the server:
```bash
python app.py
```

The server will run on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login user
- `POST /api/auth/register` - Register new user

### Users
- `GET /api/users` - Get all users
- `GET /api/users/<id>` - Get user by ID
- `POST /api/users` - Create user
- `PUT /api/users/<id>` - Update user
- `DELETE /api/users/<id>` - Delete user

### Writers
- `GET /api/writers` - Get all writers
- `GET /api/writers/<id>` - Get writer by ID
- `POST /api/writers` - Create writer
- `PUT /api/writers/<id>` - Update writer
- `DELETE /api/writers/<id>` - Delete writer

### Orders
- `GET /api/orders` - Get all orders (query params: `status`, `writerId`)
- `GET /api/orders/<id>` - Get order by ID
- `POST /api/orders` - Create order
- `PUT /api/orders/<id>` - Update order
- `DELETE /api/orders/<id>` - Delete order

### POD Orders
- `GET /api/pod-orders` - Get all POD orders
- `GET /api/pod-orders/<id>` - Get POD order by ID
- `POST /api/pod-orders` - Create POD order
- `PUT /api/pod-orders/<id>` - Update POD order

### Reviews
- `GET /api/reviews` - Get all reviews (query params: `writerId`, `orderId`)
- `GET /api/reviews/<id>` - Get review by ID
- `POST /api/reviews` - Create review

### Financial
- `GET /api/financial/invoices` - Get invoices
- `POST /api/financial/invoices` - Create invoice
- `GET /api/financial/fines` - Get fines
- `POST /api/financial/fines` - Create fine
- `GET /api/financial/payments` - Get payments
- `POST /api/financial/payments` - Create payment
- `GET /api/financial/withdrawals` - Get withdrawal requests
- `POST /api/financial/withdrawals` - Create withdrawal request

### Notifications
- `GET /api/notifications` - Get notifications (query params: `userId`, `isRead`)
- `POST /api/notifications` - Create notification
- `PUT /api/notifications/<id>/read` - Mark notification as read

### Messages
- `GET /api/messages` - Get messages (query params: `userId`, `relatedOrderId`)
- `POST /api/messages` - Create message
- `PUT /api/messages/<id>/read` - Mark message as read

## Database

The application uses SQLite by default. The database file is created at `writers_admin.db` in the server directory.

To reset and reseed the database:
```bash
python seed_db.py
```

## Development

The server runs in debug mode by default. To run in production mode, set `FLASK_ENV=production` in your `.env` file.

