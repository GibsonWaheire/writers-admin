#!/usr/bin/env python3
"""
Migration script to add bids column to orders table
"""
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import app, db
from sqlalchemy import text

def migrate():
    with app.app_context():
        try:
            # Check if column already exists
            result = db.session.execute(text("PRAGMA table_info(orders)"))
            columns = [row[1] for row in result]
            
            if 'bids' in columns:
                print("✅ Column 'bids' already exists in orders table")
                return
            
            # Add bids column
            print("🔄 Adding 'bids' column to orders table...")
            db.session.execute(text("ALTER TABLE orders ADD COLUMN bids TEXT"))
            db.session.commit()
            
            print("✅ Successfully added 'bids' column to orders table")
            
        except Exception as e:
            print(f"❌ Migration failed: {e}")
            db.session.rollback()
            raise

if __name__ == '__main__':
    migrate()

