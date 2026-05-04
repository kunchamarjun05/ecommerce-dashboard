-- ============================================================
--  E-COMMERCE DASHBOARD — SQL ANALYSIS SCRIPTS
--  Database: MySQL / SQL Server / PostgreSQL compatible
--  Author: Arjun | Data Analyst Portfolio Project
-- ============================================================


-- ============================================================
-- SECTION 1: DATABASE SETUP & TABLE CREATION
-- ============================================================

CREATE DATABASE IF NOT EXISTS ecommerce_db;
USE ecommerce_db;

-- Customers Table
CREATE TABLE customers (
    customer_id     VARCHAR(10) PRIMARY KEY,
    first_name      VARCHAR(50),
    last_name       VARCHAR(50),
    email           VARCHAR(100),
    phone           VARCHAR(20),
    city            VARCHAR(50),
    state           VARCHAR(50),
    country         VARCHAR(30),
    signup_date     DATE,
    gender          VARCHAR(10),
    age             INT
);

-- Products Table
CREATE TABLE products (
    product_id      VARCHAR(10) PRIMARY KEY,
    product_name    VARCHAR(100),
    category        VARCHAR(50),
    sub_category    VARCHAR(50),
    brand           VARCHAR(50),
    price           DECIMAL(10,2),
    cost_price      DECIMAL(10,2),
    rating          DECIMAL(3,1),
    review_count    INT
);

-- Orders Table
CREATE TABLE orders (
    order_id        VARCHAR(12) PRIMARY KEY,
    customer_id     VARCHAR(10),
    order_date      DATE,
    ship_date       DATE,
    shipping_type   VARCHAR(20),
    order_status    VARCHAR(20),
    payment_method  VARCHAR(30),
    discount_percent INT,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
);

-- Order Items Table
CREATE TABLE order_items (
    item_id         VARCHAR(12) PRIMARY KEY,
    order_id        VARCHAR(12),
    product_id      VARCHAR(10),
    quantity        INT,
    unit_price      DECIMAL(10,2),
    discount_amount DECIMAL(10,2),
    total_amount    DECIMAL(10,2),
    FOREIGN KEY (order_id) REFERENCES orders(order_id),
    FOREIGN KEY (product_id) REFERENCES products(product_id)
);


-- ============================================================
-- SECTION 2: KEY BUSINESS METRICS (KPIs)
-- ============================================================

-- 2.1 Total Revenue, Orders, and Average Order Value
SELECT 
    COUNT(DISTINCT o.order_id) AS total_orders,
    SUM(oi.total_amount) AS total_revenue,
    ROUND(SUM(oi.total_amount) / COUNT(DISTINCT o.order_id), 2) AS avg_order_value,
    COUNT(DISTINCT o.customer_id) AS total_customers,
    SUM(oi.quantity) AS total_units_sold
FROM orders o
JOIN order_items oi ON o.order_id = oi.order_id
WHERE o.order_status NOT IN ('Cancelled', 'Returned');


-- 2.2 Profit Margin Analysis
SELECT 
    SUM(oi.total_amount) AS total_revenue,
    SUM(p.cost_price * oi.quantity) AS total_cost,
    SUM(oi.total_amount) - SUM(p.cost_price * oi.quantity) AS total_profit,
    ROUND(
        (SUM(oi.total_amount) - SUM(p.cost_price * oi.quantity)) / SUM(oi.total_amount) * 100, 
    2) AS profit_margin_pct
FROM order_items oi
JOIN products p ON oi.product_id = p.product_id
JOIN orders o ON oi.order_id = o.order_id
WHERE o.order_status NOT IN ('Cancelled', 'Returned');


-- ============================================================
-- SECTION 3: REVENUE ANALYSIS
-- ============================================================

-- 3.1 Monthly Revenue Trend
SELECT 
    DATE_FORMAT(o.order_date, '%Y-%m') AS month,
    COUNT(DISTINCT o.order_id) AS total_orders,
    SUM(oi.total_amount) AS monthly_revenue,
    COUNT(DISTINCT o.customer_id) AS unique_customers,
    ROUND(SUM(oi.total_amount) / COUNT(DISTINCT o.order_id), 2) AS avg_order_value
FROM orders o
JOIN order_items oi ON o.order_id = oi.order_id
WHERE o.order_status NOT IN ('Cancelled', 'Returned')
GROUP BY DATE_FORMAT(o.order_date, '%Y-%m')
ORDER BY month;


-- 3.2 Revenue by Category
SELECT 
    p.category,
    COUNT(DISTINCT o.order_id) AS total_orders,
    SUM(oi.quantity) AS units_sold,
    SUM(oi.total_amount) AS total_revenue,
    ROUND(SUM(oi.total_amount) * 100.0 / (SELECT SUM(total_amount) FROM order_items), 2) AS revenue_share_pct
FROM order_items oi
JOIN products p ON oi.product_id = p.product_id
JOIN orders o ON oi.order_id = o.order_id
WHERE o.order_status NOT IN ('Cancelled', 'Returned')
GROUP BY p.category
ORDER BY total_revenue DESC;


-- 3.3 Revenue by City (Top 10)
SELECT 
    c.city,
    c.state,
    COUNT(DISTINCT o.order_id) AS total_orders,
    SUM(oi.total_amount) AS total_revenue,
    COUNT(DISTINCT o.customer_id) AS unique_customers
FROM orders o
JOIN order_items oi ON o.order_id = oi.order_id
JOIN customers c ON o.customer_id = c.customer_id
WHERE o.order_status NOT IN ('Cancelled', 'Returned')
GROUP BY c.city, c.state
ORDER BY total_revenue DESC
LIMIT 10;


-- 3.4 Day-of-Week Analysis
SELECT 
    DAYNAME(o.order_date) AS day_of_week,
    COUNT(DISTINCT o.order_id) AS total_orders,
    SUM(oi.total_amount) AS total_revenue,
    ROUND(AVG(oi.total_amount), 2) AS avg_item_value
FROM orders o
JOIN order_items oi ON o.order_id = oi.order_id
WHERE o.order_status NOT IN ('Cancelled', 'Returned')
GROUP BY DAYNAME(o.order_date), DAYOFWEEK(o.order_date)
ORDER BY DAYOFWEEK(o.order_date);


-- ============================================================
-- SECTION 4: PRODUCT ANALYSIS
-- ============================================================

-- 4.1 Top 15 Products by Revenue
SELECT 
    p.product_id,
    p.product_name,
    p.category,
    p.brand,
    SUM(oi.quantity) AS total_qty_sold,
    SUM(oi.total_amount) AS total_revenue,
    ROUND(AVG(p.rating), 1) AS avg_rating
FROM order_items oi
JOIN products p ON oi.product_id = p.product_id
JOIN orders o ON oi.order_id = o.order_id
WHERE o.order_status NOT IN ('Cancelled', 'Returned')
GROUP BY p.product_id, p.product_name, p.category, p.brand
ORDER BY total_revenue DESC
LIMIT 15;


-- 4.2 Top 10 Brands by Revenue
SELECT 
    p.brand,
    COUNT(DISTINCT p.product_id) AS num_products,
    SUM(oi.quantity) AS total_qty_sold,
    SUM(oi.total_amount) AS total_revenue,
    ROUND(AVG(p.rating), 1) AS avg_rating
FROM order_items oi
JOIN products p ON oi.product_id = p.product_id
JOIN orders o ON oi.order_id = o.order_id
WHERE o.order_status NOT IN ('Cancelled', 'Returned')
GROUP BY p.brand
ORDER BY total_revenue DESC
LIMIT 10;


-- 4.3 Category-wise Profit Margin
SELECT 
    p.category,
    SUM(oi.total_amount) AS revenue,
    SUM(p.cost_price * oi.quantity) AS cost,
    SUM(oi.total_amount) - SUM(p.cost_price * oi.quantity) AS profit,
    ROUND(
        (SUM(oi.total_amount) - SUM(p.cost_price * oi.quantity)) / SUM(oi.total_amount) * 100, 
    2) AS profit_margin_pct
FROM order_items oi
JOIN products p ON oi.product_id = p.product_id
JOIN orders o ON oi.order_id = o.order_id
WHERE o.order_status NOT IN ('Cancelled', 'Returned')
GROUP BY p.category
ORDER BY profit_margin_pct DESC;


-- 4.4 Products with High Revenue but Low Rating (Problem Products)
SELECT 
    p.product_name,
    p.category,
    p.brand,
    p.rating,
    SUM(oi.total_amount) AS total_revenue,
    SUM(oi.quantity) AS qty_sold
FROM order_items oi
JOIN products p ON oi.product_id = p.product_id
JOIN orders o ON oi.order_id = o.order_id
WHERE o.order_status NOT IN ('Cancelled', 'Returned')
GROUP BY p.product_name, p.category, p.brand, p.rating
HAVING p.rating < 3.5 AND SUM(oi.total_amount) > 50000
ORDER BY total_revenue DESC;


-- ============================================================
-- SECTION 5: CUSTOMER ANALYSIS
-- ============================================================

-- 5.1 Customer Lifetime Value (Top 20)
SELECT 
    c.customer_id,
    CONCAT(c.first_name, ' ', c.last_name) AS customer_name,
    c.city,
    COUNT(DISTINCT o.order_id) AS total_orders,
    SUM(oi.total_amount) AS lifetime_value,
    MIN(o.order_date) AS first_order,
    MAX(o.order_date) AS last_order,
    DATEDIFF(MAX(o.order_date), MIN(o.order_date)) AS customer_tenure_days
FROM customers c
JOIN orders o ON c.customer_id = o.customer_id
JOIN order_items oi ON o.order_id = oi.order_id
WHERE o.order_status NOT IN ('Cancelled', 'Returned')
GROUP BY c.customer_id, c.first_name, c.last_name, c.city
ORDER BY lifetime_value DESC
LIMIT 20;


-- 5.2 RFM Segmentation (Recency, Frequency, Monetary)
WITH rfm_data AS (
    SELECT 
        c.customer_id,
        CONCAT(c.first_name, ' ', c.last_name) AS customer_name,
        DATEDIFF(CURDATE(), MAX(o.order_date)) AS recency,
        COUNT(DISTINCT o.order_id) AS frequency,
        SUM(oi.total_amount) AS monetary
    FROM customers c
    JOIN orders o ON c.customer_id = o.customer_id
    JOIN order_items oi ON o.order_id = oi.order_id
    WHERE o.order_status NOT IN ('Cancelled', 'Returned')
    GROUP BY c.customer_id, c.first_name, c.last_name
),
rfm_scores AS (
    SELECT *,
        NTILE(5) OVER (ORDER BY recency DESC) AS r_score,
        NTILE(5) OVER (ORDER BY frequency ASC) AS f_score,
        NTILE(5) OVER (ORDER BY monetary ASC) AS m_score
    FROM rfm_data
)
SELECT *,
    CONCAT(r_score, f_score, m_score) AS rfm_score,
    CASE 
        WHEN r_score >= 4 AND f_score >= 4 AND m_score >= 4 THEN 'Champions'
        WHEN r_score >= 3 AND f_score >= 3 THEN 'Loyal Customers'
        WHEN r_score >= 4 AND f_score <= 2 THEN 'New Customers'
        WHEN r_score <= 2 AND f_score >= 3 THEN 'At Risk'
        WHEN r_score <= 2 AND f_score <= 2 THEN 'Lost Customers'
        ELSE 'Potential Loyalists'
    END AS customer_segment
FROM rfm_scores
ORDER BY monetary DESC;


-- 5.3 Customer Demographics — Revenue by Age Group
SELECT 
    CASE 
        WHEN c.age BETWEEN 18 AND 25 THEN '18-25'
        WHEN c.age BETWEEN 26 AND 35 THEN '26-35'
        WHEN c.age BETWEEN 36 AND 45 THEN '36-45'
        WHEN c.age BETWEEN 46 AND 55 THEN '46-55'
        ELSE '55+'
    END AS age_group,
    c.gender,
    COUNT(DISTINCT o.order_id) AS total_orders,
    SUM(oi.total_amount) AS total_revenue,
    ROUND(AVG(oi.total_amount), 2) AS avg_order_value
FROM customers c
JOIN orders o ON c.customer_id = o.customer_id
JOIN order_items oi ON o.order_id = oi.order_id
WHERE o.order_status NOT IN ('Cancelled', 'Returned')
GROUP BY 
    CASE 
        WHEN c.age BETWEEN 18 AND 25 THEN '18-25'
        WHEN c.age BETWEEN 26 AND 35 THEN '26-35'
        WHEN c.age BETWEEN 36 AND 45 THEN '36-45'
        WHEN c.age BETWEEN 46 AND 55 THEN '46-55'
        ELSE '55+'
    END,
    c.gender
ORDER BY age_group, gender;


-- 5.4 New vs Returning Customers (Monthly)
WITH customer_first_order AS (
    SELECT customer_id, MIN(order_date) AS first_order_date
    FROM orders
    WHERE order_status NOT IN ('Cancelled', 'Returned')
    GROUP BY customer_id
)
SELECT 
    DATE_FORMAT(o.order_date, '%Y-%m') AS month,
    COUNT(DISTINCT CASE WHEN o.order_date = cfo.first_order_date THEN o.customer_id END) AS new_customers,
    COUNT(DISTINCT CASE WHEN o.order_date > cfo.first_order_date THEN o.customer_id END) AS returning_customers
FROM orders o
JOIN customer_first_order cfo ON o.customer_id = cfo.customer_id
WHERE o.order_status NOT IN ('Cancelled', 'Returned')
GROUP BY DATE_FORMAT(o.order_date, '%Y-%m')
ORDER BY month;


-- ============================================================
-- SECTION 6: ORDER & SHIPPING ANALYSIS
-- ============================================================

-- 6.1 Order Status Distribution
SELECT 
    order_status,
    COUNT(*) AS total_orders,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM orders), 2) AS percentage
FROM orders
GROUP BY order_status
ORDER BY total_orders DESC;


-- 6.2 Payment Method Analysis
SELECT 
    payment_method,
    COUNT(*) AS total_orders,
    SUM(oi.total_amount) AS total_revenue,
    ROUND(AVG(oi.total_amount), 2) AS avg_transaction_value
FROM orders o
JOIN order_items oi ON o.order_id = oi.order_id
WHERE o.order_status NOT IN ('Cancelled', 'Returned')
GROUP BY payment_method
ORDER BY total_revenue DESC;


-- 6.3 Average Shipping Duration by Type
SELECT 
    shipping_type,
    COUNT(*) AS total_orders,
    ROUND(AVG(DATEDIFF(ship_date, order_date)), 1) AS avg_shipping_days,
    MIN(DATEDIFF(ship_date, order_date)) AS min_days,
    MAX(DATEDIFF(ship_date, order_date)) AS max_days
FROM orders
WHERE order_status = 'Delivered'
GROUP BY shipping_type
ORDER BY avg_shipping_days;


-- 6.4 Cancellation & Return Rate by Category
SELECT 
    p.category,
    COUNT(DISTINCT CASE WHEN o.order_status = 'Cancelled' THEN o.order_id END) AS cancelled_orders,
    COUNT(DISTINCT CASE WHEN o.order_status = 'Returned' THEN o.order_id END) AS returned_orders,
    COUNT(DISTINCT o.order_id) AS total_orders,
    ROUND(
        COUNT(DISTINCT CASE WHEN o.order_status IN ('Cancelled', 'Returned') THEN o.order_id END) * 100.0 
        / COUNT(DISTINCT o.order_id), 
    2) AS cancel_return_rate
FROM orders o
JOIN order_items oi ON o.order_id = oi.order_id
JOIN products p ON oi.product_id = p.product_id
GROUP BY p.category
ORDER BY cancel_return_rate DESC;


-- ============================================================
-- SECTION 7: DISCOUNT ANALYSIS
-- ============================================================

-- 7.1 Revenue Impact of Discounts
SELECT 
    o.discount_percent,
    COUNT(DISTINCT o.order_id) AS total_orders,
    SUM(oi.total_amount) AS total_revenue,
    SUM(oi.discount_amount) AS total_discount_given,
    ROUND(AVG(oi.total_amount), 2) AS avg_order_value
FROM orders o
JOIN order_items oi ON o.order_id = oi.order_id
WHERE o.order_status NOT IN ('Cancelled', 'Returned')
GROUP BY o.discount_percent
ORDER BY o.discount_percent;


-- 7.2 Discount Effectiveness — Do higher discounts lead to more orders?
SELECT 
    CASE 
        WHEN o.discount_percent = 0 THEN 'No Discount'
        WHEN o.discount_percent <= 10 THEN 'Low (5-10%)'
        WHEN o.discount_percent <= 20 THEN 'Medium (15-20%)'
        ELSE 'High (25-30%)'
    END AS discount_tier,
    COUNT(DISTINCT o.order_id) AS order_count,
    SUM(oi.total_amount) AS revenue,
    SUM(oi.discount_amount) AS discount_given,
    ROUND(SUM(oi.total_amount) - SUM(p.cost_price * oi.quantity), 2) AS net_profit
FROM orders o
JOIN order_items oi ON o.order_id = oi.order_id
JOIN products p ON oi.product_id = p.product_id
WHERE o.order_status NOT IN ('Cancelled', 'Returned')
GROUP BY CASE 
    WHEN o.discount_percent = 0 THEN 'No Discount'
    WHEN o.discount_percent <= 10 THEN 'Low (5-10%)'
    WHEN o.discount_percent <= 20 THEN 'Medium (15-20%)'
    ELSE 'High (25-30%)'
END
ORDER BY discount_tier;


-- ============================================================
-- SECTION 8: MONTH-OVER-MONTH GROWTH (WINDOW FUNCTIONS)
-- ============================================================

-- 8.1 MoM Revenue Growth
WITH monthly_revenue AS (
    SELECT 
        DATE_FORMAT(o.order_date, '%Y-%m') AS month,
        SUM(oi.total_amount) AS revenue
    FROM orders o
    JOIN order_items oi ON o.order_id = oi.order_id
    WHERE o.order_status NOT IN ('Cancelled', 'Returned')
    GROUP BY DATE_FORMAT(o.order_date, '%Y-%m')
)
SELECT 
    month,
    revenue,
    LAG(revenue) OVER (ORDER BY month) AS prev_month_revenue,
    ROUND(
        (revenue - LAG(revenue) OVER (ORDER BY month)) / LAG(revenue) OVER (ORDER BY month) * 100, 
    2) AS mom_growth_pct
FROM monthly_revenue
ORDER BY month;


-- 8.2 Running Total Revenue
SELECT 
    DATE_FORMAT(o.order_date, '%Y-%m') AS month,
    SUM(oi.total_amount) AS monthly_revenue,
    SUM(SUM(oi.total_amount)) OVER (ORDER BY DATE_FORMAT(o.order_date, '%Y-%m')) AS running_total
FROM orders o
JOIN order_items oi ON o.order_id = oi.order_id
WHERE o.order_status NOT IN ('Cancelled', 'Returned')
GROUP BY DATE_FORMAT(o.order_date, '%Y-%m')
ORDER BY month;


-- 8.3 Product Ranking within Category
SELECT 
    p.category,
    p.product_name,
    p.brand,
    SUM(oi.total_amount) AS total_revenue,
    RANK() OVER (PARTITION BY p.category ORDER BY SUM(oi.total_amount) DESC) AS rank_in_category
FROM order_items oi
JOIN products p ON oi.product_id = p.product_id
JOIN orders o ON oi.order_id = o.order_id
WHERE o.order_status NOT IN ('Cancelled', 'Returned')
GROUP BY p.category, p.product_name, p.brand
ORDER BY p.category, rank_in_category;


-- ============================================================
-- SECTION 9: VIEWS FOR POWER BI
-- (Connect Power BI directly to these views)
-- ============================================================

-- View 1: Sales Summary (main fact table for Power BI)
CREATE OR REPLACE VIEW vw_sales_summary AS
SELECT 
    o.order_id,
    o.order_date,
    o.ship_date,
    o.shipping_type,
    o.order_status,
    o.payment_method,
    o.discount_percent,
    oi.item_id,
    oi.quantity,
    oi.unit_price,
    oi.discount_amount,
    oi.total_amount,
    p.product_id,
    p.product_name,
    p.category,
    p.sub_category,
    p.brand,
    p.cost_price,
    p.rating,
    (oi.total_amount - (p.cost_price * oi.quantity)) AS profit,
    c.customer_id,
    CONCAT(c.first_name, ' ', c.last_name) AS customer_name,
    c.city,
    c.state,
    c.gender,
    c.age
FROM orders o
JOIN order_items oi ON o.order_id = oi.order_id
JOIN products p ON oi.product_id = p.product_id
JOIN customers c ON o.customer_id = c.customer_id;


-- View 2: Monthly KPIs
CREATE OR REPLACE VIEW vw_monthly_kpis AS
SELECT 
    DATE_FORMAT(o.order_date, '%Y-%m') AS month,
    COUNT(DISTINCT o.order_id) AS orders,
    COUNT(DISTINCT o.customer_id) AS customers,
    SUM(oi.total_amount) AS revenue,
    SUM(oi.total_amount - (p.cost_price * oi.quantity)) AS profit,
    SUM(oi.discount_amount) AS discounts_given,
    ROUND(SUM(oi.total_amount) / COUNT(DISTINCT o.order_id), 2) AS aov
FROM orders o
JOIN order_items oi ON o.order_id = oi.order_id
JOIN products p ON oi.product_id = p.product_id
WHERE o.order_status NOT IN ('Cancelled', 'Returned')
GROUP BY DATE_FORMAT(o.order_date, '%Y-%m');


-- View 3: Customer RFM
CREATE OR REPLACE VIEW vw_customer_rfm AS
SELECT 
    c.customer_id,
    CONCAT(c.first_name, ' ', c.last_name) AS customer_name,
    c.city,
    c.state,
    c.gender,
    c.age,
    DATEDIFF(CURDATE(), MAX(o.order_date)) AS recency_days,
    COUNT(DISTINCT o.order_id) AS frequency,
    SUM(oi.total_amount) AS monetary,
    MIN(o.order_date) AS first_order,
    MAX(o.order_date) AS last_order
FROM customers c
JOIN orders o ON c.customer_id = o.customer_id
JOIN order_items oi ON o.order_id = oi.order_id
WHERE o.order_status NOT IN ('Cancelled', 'Returned')
GROUP BY c.customer_id, c.first_name, c.last_name, c.city, c.state, c.gender, c.age;


-- ============================================================
-- END OF SQL SCRIPTS
-- ============================================================
