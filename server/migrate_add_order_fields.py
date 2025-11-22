"""
Migration script to add new columns to the orders table.
This script adds all the missing fields for proper data persistence.
"""
import sqlite3
import os
from pathlib import Path

def migrate_orders_table():
    """Add missing columns to the orders table"""
    # Get database path
    db_path = Path(__file__).parent / 'instance' / 'writers_admin.db'
    
    if not db_path.exists():
        print(f"Database not found at {db_path}")
        return False
    
    conn = sqlite3.connect(str(db_path))
    cursor = conn.cursor()
    
    # Get existing columns
    cursor.execute("PRAGMA table_info(orders)")
    existing_columns = [row[1] for row in cursor.fetchall()]
    
    # Columns to add (snake_case for database)
    new_columns = [
        ('assigned_by', 'TEXT'),
        ('picked_by', 'TEXT'),
        ('requires_confirmation', 'BOOLEAN DEFAULT 0'),
        ('confirmed_at', 'DATETIME'),
        ('confirmed_by', 'TEXT'),
        ('assignment_notes', 'TEXT'),
        ('assignment_priority', 'TEXT'),
        ('assignment_deadline', 'DATETIME'),
        ('submitted_to_admin_at', 'DATETIME'),
        ('submission_notes', 'TEXT'),
        ('files_uploaded_at', 'DATETIME'),
        ('revision_explanation', 'TEXT'),
        ('revision_score', 'INTEGER DEFAULT 10'),
        ('revision_count', 'INTEGER DEFAULT 0'),
        ('revision_submitted_at', 'DATETIME'),
        ('revision_response_notes', 'TEXT'),
        ('admin_review_notes', 'TEXT'),
        ('admin_reviewed_at', 'DATETIME'),
        ('admin_reviewed_by', 'TEXT'),
        ('reassignment_reason', 'TEXT'),
        ('reassigned_at', 'DATETIME'),
        ('reassigned_by', 'TEXT'),
        ('original_writer_id', 'TEXT'),
        ('made_available_at', 'DATETIME'),
        ('made_available_by', 'TEXT'),
        ('fine_amount', 'REAL DEFAULT 0'),
        ('fine_reason', 'TEXT'),
        ('fine_history', 'TEXT'),
    ]
    
    added_count = 0
    for column_name, column_type in new_columns:
        if column_name not in existing_columns:
            try:
                cursor.execute(f"ALTER TABLE orders ADD COLUMN {column_name} {column_type}")
                print(f"✓ Added column: {column_name}")
                added_count += 1
            except sqlite3.OperationalError as e:
                print(f"✗ Failed to add {column_name}: {e}")
        else:
            print(f"- Column {column_name} already exists")
    
    conn.commit()
    conn.close()
    
    print(f"\n✅ Migration complete! Added {added_count} new columns.")
    return True

if __name__ == '__main__':
    migrate_orders_table()

