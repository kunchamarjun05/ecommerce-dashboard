"""
E-Commerce Dashboard — Sample Data Generator
Generates realistic e-commerce data for SQL + Excel + Power BI analysis
"""

import csv
import random
import os
from datetime import datetime, timedelta

random.seed(42)

# ─── Configuration ───
NUM_CUSTOMERS = 500
NUM_PRODUCTS = 80
NUM_ORDERS = 3000
NUM_ORDER_ITEMS = 7500
OUTPUT_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(OUTPUT_DIR, "data")
os.makedirs(DATA_DIR, exist_ok=True)

# ─── Helper Data ───
FIRST_NAMES = [
    "Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Sai", "Reyansh", "Ayaan", "Krishna", "Ishaan",
    "Ananya", "Diya", "Myra", "Sara", "Aadhya", "Isha", "Kiara", "Riya", "Priya", "Neha",
    "Rohan", "Karan", "Amit", "Raj", "Vikram", "Suresh", "Pooja", "Sneha", "Meera", "Kavya",
    "James", "Emma", "Liam", "Olivia", "Noah", "Ava", "Sophia", "Jackson", "Mia", "Lucas",
    "Ethan", "Charlotte", "Aiden", "Amelia", "Harper", "Ella", "Daniel", "Grace", "Matthew", "Lily"
]

LAST_NAMES = [
    "Sharma", "Verma", "Patel", "Gupta", "Singh", "Kumar", "Joshi", "Reddy", "Nair", "Iyer",
    "Chopra", "Mehta", "Shah", "Das", "Rao", "Bhat", "Pillai", "Menon", "Thakur", "Malhotra",
    "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Wilson", "Anderson",
    "Taylor", "Thomas", "Moore", "Martin", "Lee", "Clark", "Walker", "Hall", "Allen", "Young"
]

CITIES = [
    ("Mumbai", "Maharashtra", "India"),
    ("Delhi", "Delhi", "India"),
    ("Bangalore", "Karnataka", "India"),
    ("Hyderabad", "Telangana", "India"),
    ("Chennai", "Tamil Nadu", "India"),
    ("Pune", "Maharashtra", "India"),
    ("Kolkata", "West Bengal", "India"),
    ("Ahmedabad", "Gujarat", "India"),
    ("Jaipur", "Rajasthan", "India"),
    ("Lucknow", "Uttar Pradesh", "India"),
    ("Chandigarh", "Punjab", "India"),
    ("Kochi", "Kerala", "India"),
    ("Indore", "Madhya Pradesh", "India"),
    ("Nagpur", "Maharashtra", "India"),
    ("Coimbatore", "Tamil Nadu", "India"),
]

CATEGORIES = {
    "Electronics": {
        "subcategories": ["Smartphones", "Laptops", "Headphones", "Tablets", "Smartwatches", "Cameras"],
        "price_range": (2999, 149999),
        "brands": ["Samsung", "Apple", "OnePlus", "Xiaomi", "Sony", "Lenovo", "Boat", "JBL"]
    },
    "Fashion": {
        "subcategories": ["Men's Clothing", "Women's Clothing", "Footwear", "Accessories", "Watches"],
        "price_range": (299, 14999),
        "brands": ["Nike", "Adidas", "Puma", "Levi's", "H&M", "Zara", "Allen Solly", "Van Heusen"]
    },
    "Home & Kitchen": {
        "subcategories": ["Furniture", "Kitchen Appliances", "Bedding", "Decor", "Storage"],
        "price_range": (499, 49999),
        "brands": ["Ikea", "Prestige", "Philips", "Bajaj", "Godrej", "Nilkamal"]
    },
    "Books": {
        "subcategories": ["Fiction", "Non-Fiction", "Academic", "Self-Help", "Comics"],
        "price_range": (99, 1999),
        "brands": ["Penguin", "HarperCollins", "Pearson", "O'Reilly", "Wiley"]
    },
    "Beauty & Health": {
        "subcategories": ["Skincare", "Haircare", "Makeup", "Supplements", "Personal Care"],
        "price_range": (149, 4999),
        "brands": ["Lakme", "Maybelline", "Nivea", "Himalaya", "Biotique", "Forest Essentials"]
    },
    "Sports & Fitness": {
        "subcategories": ["Gym Equipment", "Sportswear", "Yoga", "Outdoor", "Nutrition"],
        "price_range": (299, 29999),
        "brands": ["Nike", "Adidas", "Decathlon", "Puma", "Under Armour", "Boldfit"]
    }
}

PAYMENT_METHODS = ["Credit Card", "Debit Card", "UPI", "Net Banking", "Cash on Delivery", "Wallet"]
ORDER_STATUSES = ["Delivered", "Delivered", "Delivered", "Delivered", "Shipped", "Processing", "Cancelled", "Returned"]
SHIPPING_TYPES = ["Standard", "Standard", "Express", "Same Day"]

# ─── 1. Generate Customers ───
print("Generating customers...")
customers = []
for i in range(1, NUM_CUSTOMERS + 1):
    first = random.choice(FIRST_NAMES)
    last = random.choice(LAST_NAMES)
    city, state, country = random.choice(CITIES)
    signup_date = datetime(2023, 1, 1) + timedelta(days=random.randint(0, 850))
    
    customers.append({
        "customer_id": f"CUST-{i:04d}",
        "first_name": first,
        "last_name": last,
        "email": f"{first.lower()}.{last.lower()}{random.randint(1,99)}@{'gmail.com' if random.random() > 0.3 else 'yahoo.com'}",
        "phone": f"+91-{random.randint(70000,99999)}{random.randint(10000,99999)}",
        "city": city,
        "state": state,
        "country": country,
        "signup_date": signup_date.strftime("%Y-%m-%d"),
        "gender": random.choice(["Male", "Female"]),
        "age": random.randint(18, 65)
    })

with open(os.path.join(DATA_DIR, "customers.csv"), "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=customers[0].keys())
    writer.writeheader()
    writer.writerows(customers)

# ─── 2. Generate Products ───
print("Generating products...")
products = []
product_id = 1
for category, info in CATEGORIES.items():
    for _ in range(NUM_PRODUCTS // len(CATEGORIES)):
        subcat = random.choice(info["subcategories"])
        brand = random.choice(info["brands"])
        price = round(random.uniform(*info["price_range"]), 2)
        cost = round(price * random.uniform(0.4, 0.75), 2)
        
        products.append({
            "product_id": f"PROD-{product_id:04d}",
            "product_name": f"{brand} {subcat.rstrip('s')} {random.choice(['Pro', 'Lite', 'Max', 'Plus', 'Elite', 'Classic', 'Ultra'])}",
            "category": category,
            "sub_category": subcat,
            "brand": brand,
            "price": price,
            "cost_price": cost,
            "rating": round(random.uniform(2.5, 5.0), 1),
            "review_count": random.randint(5, 5000)
        })
        product_id += 1

# Fill remaining
while len(products) < NUM_PRODUCTS:
    cat = random.choice(list(CATEGORIES.keys()))
    info = CATEGORIES[cat]
    subcat = random.choice(info["subcategories"])
    brand = random.choice(info["brands"])
    price = round(random.uniform(*info["price_range"]), 2)
    cost = round(price * random.uniform(0.4, 0.75), 2)
    products.append({
        "product_id": f"PROD-{product_id:04d}",
        "product_name": f"{brand} {subcat.rstrip('s')} {random.choice(['Pro', 'Lite', 'Max', 'Plus', 'Elite'])}",
        "category": cat,
        "sub_category": subcat,
        "brand": brand,
        "price": price,
        "cost_price": cost,
        "rating": round(random.uniform(2.5, 5.0), 1),
        "review_count": random.randint(5, 5000)
    })
    product_id += 1

with open(os.path.join(DATA_DIR, "products.csv"), "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=products[0].keys())
    writer.writeheader()
    writer.writerows(products)

# ─── 3. Generate Orders ───
print("Generating orders...")
orders = []
for i in range(1, NUM_ORDERS + 1):
    customer = random.choice(customers)
    order_date = datetime(2023, 6, 1) + timedelta(days=random.randint(0, 700))
    ship_days = random.randint(1, 7)
    status = random.choice(ORDER_STATUSES)
    shipping = random.choice(SHIPPING_TYPES)
    
    # Seasonal boost — more orders in Oct-Dec (festive season)
    if order_date.month in [10, 11, 12]:
        if random.random() < 0.3:
            order_date = order_date  # keep it, boosting frequency by having more orders in this range
    
    discount_pct = random.choice([0, 0, 0, 5, 10, 10, 15, 20, 25, 30])
    
    orders.append({
        "order_id": f"ORD-{i:05d}",
        "customer_id": customer["customer_id"],
        "order_date": order_date.strftime("%Y-%m-%d"),
        "ship_date": (order_date + timedelta(days=ship_days)).strftime("%Y-%m-%d"),
        "shipping_type": shipping,
        "order_status": status,
        "payment_method": random.choice(PAYMENT_METHODS),
        "discount_percent": discount_pct
    })

with open(os.path.join(DATA_DIR, "orders.csv"), "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=orders[0].keys())
    writer.writeheader()
    writer.writerows(orders)

# ─── 4. Generate Order Items ───
print("Generating order items...")
order_items = []
item_id = 1

# Ensure every order has at least 1 item
for order in orders:
    num_items = random.choices([1, 2, 3, 4, 5], weights=[40, 30, 15, 10, 5])[0]
    selected_products = random.sample(products, min(num_items, len(products)))
    
    for prod in selected_products:
        qty = random.choices([1, 2, 3, 4, 5], weights=[50, 25, 13, 7, 5])[0]
        discount = int(order["discount_percent"])
        unit_price = prod["price"]
        discount_amount = round(unit_price * qty * discount / 100, 2)
        total = round(unit_price * qty - discount_amount, 2)
        
        order_items.append({
            "item_id": f"ITEM-{item_id:06d}",
            "order_id": order["order_id"],
            "product_id": prod["product_id"],
            "quantity": qty,
            "unit_price": unit_price,
            "discount_amount": discount_amount,
            "total_amount": total
        })
        item_id += 1
        
        if item_id > NUM_ORDER_ITEMS:
            break
    if item_id > NUM_ORDER_ITEMS:
        break

with open(os.path.join(DATA_DIR, "order_items.csv"), "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=order_items[0].keys())
    writer.writeheader()
    writer.writerows(order_items)

# ─── Summary ───
print(f"""
{'='*50}
  E-Commerce Data Generated Successfully!
{'='*50}
  Output Directory: {DATA_DIR}
  
  Files Created:
     - customers.csv  : {len(customers):,} records
     - products.csv   : {len(products):,} records  
     - orders.csv     : {len(orders):,} records
     - order_items.csv : {len(order_items):,} records
{'='*50}
""")
