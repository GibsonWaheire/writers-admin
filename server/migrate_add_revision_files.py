"""
Migration script to add original_files and revision_files columns to orders table
"""
from app import app
from db import db
from sqlalchemy import text

def migrate():
    """Add original_files and revision_files columns to orders table"""
    with app.app_context():
        try:
            # Check if columns already exist
            with db.engine.connect() as conn:
                result = conn.execute(text("PRAGMA table_info(orders)"))
                columns = [row[1] for row in result]
                
                if 'original_files' not in columns:
                    print("Adding original_files column...")
                    conn.execute(text("ALTER TABLE orders ADD COLUMN original_files TEXT"))
                    conn.commit()
                    print("✅ Added original_files column")
                else:
                    print("⚠️  original_files column already exists")
                
                if 'revision_files' not in columns:
                    print("Adding revision_files column...")
                    conn.execute(text("ALTER TABLE orders ADD COLUMN revision_files TEXT"))
                    conn.commit()
                    print("✅ Added revision_files column")
                else:
                    print("⚠️  revision_files column already exists")
            
            print("\n✅ Migration completed successfully!")
        
        except Exception as e:
            print(f"❌ Migration failed: {e}")
            raise

if __name__ == '__main__':
    migrate()
