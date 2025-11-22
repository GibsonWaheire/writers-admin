"""
CLI tool for Writers Admin management
Usage: flask [command] [options]
"""
import click
from flask.cli import with_appcontext
from app import app
from db import db
from models import User, Writer, Order, PODOrder, Review, Invoice, Fine, Payment
from seed_db import seed_database
import json
from datetime import datetime

@app.cli.command()
@click.option('--force', is_flag=True, help='Force reset without confirmation')
@with_appcontext
def reset_db(force):
    """Reset the database (drop all tables and recreate)"""
    if not force:
        if not click.confirm('⚠️  This will delete all data. Are you sure?'):
            click.echo('Cancelled.')
            return
    
    click.echo('🗑️  Dropping all tables...')
    db.drop_all()
    click.echo('✅ Tables dropped.')
    
    click.echo('📦 Creating tables...')
    db.create_all()
    click.echo('✅ Database reset complete!')

@app.cli.command()
@with_appcontext
def seed():
    """Seed the database with initial data from db.json"""
    click.echo('🌱 Seeding database...')
    try:
        seed_database()
        click.echo('✅ Database seeded successfully!')
    except Exception as e:
        click.echo(f'❌ Error seeding database: {e}', err=True)

@app.cli.command()
@with_appcontext
def init_db():
    """Initialize database (reset + seed)"""
    click.echo('🔄 Initializing database...')
    db.drop_all()
    db.create_all()
    click.echo('✅ Tables created.')
    
    try:
        seed_database()
        click.echo('✅ Database initialized and seeded!')
    except Exception as e:
        click.echo(f'❌ Error: {e}', err=True)

@app.cli.group()
def users():
    """User management commands"""
    pass

@users.command('list')
@with_appcontext
def list_users():
    """List all users"""
    users = User.query.all()
    if not users:
        click.echo('No users found.')
        return
    
    click.echo(f'\n📋 Found {len(users)} users:\n')
    for user in users:
        click.echo(f"  ID: {user.id}")
        click.echo(f"  Name: {user.name}")
        click.echo(f"  Email: {user.email}")
        click.echo(f"  Role: {user.role}")
        click.echo(f"  Created: {user.created_at}")
        click.echo('')

@users.command('create')
@click.option('--name', required=True, help='User name')
@click.option('--email', required=True, help='User email')
@click.option('--password', required=True, help='User password')
@click.option('--role', type=click.Choice(['writer', 'admin']), default='writer', help='User role')
@with_appcontext
def create_user(name, email, password, role):
    """Create a new user"""
    # Check if user exists
    if User.query.filter_by(email=email).first():
        click.echo(f'❌ User with email {email} already exists!', err=True)
        return
    
    user = User(
        id=str(len(User.query.all()) + 1),
        name=name,
        email=email,
        password=password,
        role=role
    )
    db.session.add(user)
    db.session.commit()
    click.echo(f'✅ User created: {name} ({email})')

@app.cli.group()
def writers():
    """Writer management commands"""
    pass

@writers.command('list')
@with_appcontext
def list_writers():
    """List all writers"""
    writers = Writer.query.all()
    if not writers:
        click.echo('No writers found.')
        return
    
    click.echo(f'\n📋 Found {len(writers)} writers:\n')
    for writer in writers:
        click.echo(f"  ID: {writer.id}")
        click.echo(f"  Name: {writer.name}")
        click.echo(f"  Email: {writer.email}")
        click.echo(f"  Status: {writer.status}")
        click.echo(f"  Rating: {writer.rating}")
        click.echo(f"  Completed Orders: {writer.completed_orders}")
        click.echo(f"  Total Earnings: KES {writer.total_earnings:,.2f}")
        click.echo('')

@app.cli.group()
def orders():
    """Order management commands"""
    pass

@orders.command('list')
@click.option('--status', help='Filter by status')
@click.option('--writer', help='Filter by writer ID')
@with_appcontext
def list_orders(status, writer):
    """List orders"""
    query = Order.query
    
    if status:
        query = query.filter_by(status=status)
    if writer:
        query = query.filter_by(writer_id=writer)
    
    orders = query.all()
    if not orders:
        click.echo('No orders found.')
        return
    
    click.echo(f'\n📋 Found {len(orders)} orders:\n')
    for order in orders:
        click.echo(f"  ID: {order.id}")
        click.echo(f"  Title: {order.title}")
        click.echo(f"  Status: {order.status}")
        click.echo(f"  Pages: {order.pages}")
        click.echo(f"  Price: KES {order.total_price_kes or 0:,.2f}")
        if order.writer_id:
            click.echo(f"  Writer: {order.assigned_writer} ({order.writer_id})")
        click.echo(f"  Deadline: {order.deadline}")
        click.echo('')

@orders.command('stats')
@with_appcontext
def order_stats():
    """Show order statistics"""
    total = Order.query.count()
    available = Order.query.filter_by(status='Available').count()
    in_progress = Order.query.filter_by(status='In Progress').count()
    completed = Order.query.filter_by(status='Completed').count()
    
    click.echo('\n📊 Order Statistics:\n')
    click.echo(f"  Total Orders: {total}")
    click.echo(f"  Available: {available}")
    click.echo(f"  In Progress: {in_progress}")
    click.echo(f"  Completed: {completed}")
    click.echo('')

@app.cli.group()
def db_cmd():
    """Database management commands"""
    pass

@db_cmd.command('info')
@with_appcontext
def db_info():
    """Show database information"""
    click.echo('\n📊 Database Information:\n')
    
    click.echo(f"  Users: {User.query.count()}")
    click.echo(f"  Writers: {Writer.query.count()}")
    click.echo(f"  Orders: {Order.query.count()}")
    click.echo(f"  POD Orders: {PODOrder.query.count()}")
    click.echo(f"  Reviews: {Review.query.count()}")
    click.echo(f"  Invoices: {Invoice.query.count()}")
    click.echo('')

if __name__ == '__main__':
    app.cli()

