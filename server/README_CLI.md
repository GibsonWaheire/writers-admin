# CLI Commands

The Writers Admin application includes a CLI tool for managing the database and viewing information.

## Setup

Make sure you're in the server directory and have activated the virtual environment:

```bash
cd server
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

## Available Commands

### Database Management

#### Initialize Database (Reset + Seed)
```bash
flask init-db
```
Drops all tables, recreates them, and seeds with data from `db.json`.

#### Reset Database
```bash
flask reset-db
flask reset-db --force  # Skip confirmation
```
Drops all tables and recreates them (without seeding).

#### Seed Database
```bash
flask seed
```
Populates the database with data from `db.json` (does not drop existing data).

#### Database Info
```bash
flask db-cmd info
```
Shows counts of all entities in the database.

### User Management

#### List Users
```bash
flask users list
```
Lists all users with their details.

#### Create User
```bash
flask users create --name "John Doe" --email "john@example.com" --password "password123" --role writer
```
Creates a new user. Role can be `writer` or `admin`.

### Writer Management

#### List Writers
```bash
flask writers list
```
Lists all writers with their details.

### Order Management

#### List Orders
```bash
flask orders list
flask orders list --status Available
flask orders list --writer writer-1
flask orders list --status In\ Progress --writer writer-1
```
Lists orders with optional filters.

#### Order Statistics
```bash
flask orders stats
```
Shows order statistics by status.

## Examples

### Complete Setup
```bash
# Initialize database with seed data
flask init-db

# Create a new admin user
flask users create --name "Admin" --email "admin@example.com" --password "admin123" --role admin

# Check database info
flask db-cmd info

# View all available orders
flask orders list --status Available
```

### Daily Operations
```bash
# Check order statistics
flask orders stats

# List all writers
flask writers list

# View orders for a specific writer
flask orders list --writer writer-1
```

## Help

Get help for any command:
```bash
flask --help
flask users --help
flask orders --help
```

