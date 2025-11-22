"""
Utility functions for the server
"""
import string
import random
from models import Order

def generate_order_number():
    """
    Generate a unique 4-character order number.
    Format: Letter + 3 digits (e.g., A001, B234, Z999)
    """
    letters = string.ascii_uppercase
    digits = string.digits
    
    # Try to find an available order number
    max_attempts = 100
    for _ in range(max_attempts):
        # Generate: 1 letter + 3 digits
        letter = random.choice(letters)
        number = ''.join(random.choice(digits) for _ in range(3))
        order_number = f"{letter}{number}"
        
        # Check if it exists
        existing = Order.query.filter_by(order_number=order_number).first()
        if not existing:
            return order_number
    
    # Fallback: use timestamp-based if all attempts fail
    import time
    timestamp = str(int(time.time()))[-4:]
    return f"T{timestamp}"

