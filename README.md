# 📊 E-Commerce Analytics Dashboard

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![SQL](https://img.shields.io/badge/SQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![Chart.js](https://img.shields.io/badge/Chart.js-FF6384?style=for-the-badge&logo=chartdotjs&logoColor=white)

A comprehensive **e-commerce analytics dashboard** featuring interactive charts, real-time KPI metrics, and data-driven insights. Built with vanilla JavaScript, powered by Python data generation, and analyzed with SQL queries.

## 🌐 Live Demo

🔗 **[View Live Dashboard →](https://kunchamarjun05.github.io/ecommerce-dashboard/)**

---

## 📸 Screenshots

<!-- 
  TODO: Add screenshots!
  ![Dashboard Overview](screenshots/dashboard.png)
  ![Charts](screenshots/charts.png)
-->

*Screenshots coming soon — [View the live demo](https://kunchamarjun05.github.io/ecommerce-dashboard/) in the meantime!*

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 📈 **Interactive Charts** | Revenue trends, sales breakdown, category analysis using Chart.js |
| 🎯 **KPI Cards** | Real-time metrics for orders, revenue, customers & growth |
| 🔍 **Data Filtering** | Filter by date range, category, and order status |
| 🗄️ **SQL Analytics** | Pre-built analysis queries for business insights |
| 🐍 **Python Data Pipeline** | Realistic 50,000+ row dataset generation |
| 📱 **Responsive Design** | Works seamlessly on desktop, tablet & mobile |
| 🎨 **Modern UI** | Dark theme with glassmorphism effects & smooth animations |

## 🏗️ Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌───────────────────┐
│  Python Script   │ ──> │  CSV Data Files   │ ──> │  JS Dashboard     │
│  generate_data.py│     │  orders.csv       │     │  Chart.js + DOM   │
│  (Data Pipeline) │     │  customers.csv    │     │  (Visualization)  │
└─────────────────┘     │  products.csv     │     └───────────────────┘
                         │  order_items.csv  │
        ┌────────────────┤                   │
        │                └──────────────────┘
        v
┌─────────────────┐
│  SQL Scripts     │
│  Business        │
│  Analysis        │
└─────────────────┘
```

## 🛠️ Tech Stack

| Technology | Purpose |
|-----------|---------|
| **HTML5 & CSS3** | Structure & Premium Styling |
| **JavaScript (ES6+)** | Dashboard Logic & Interactivity |
| **Chart.js** | Interactive Data Visualizations |
| **Python** | Realistic Data Generation (50K+ rows) |
| **SQL** | Data Analysis & Business Queries |

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/kunchamarjun05/ecommerce-dashboard.git
cd ecommerce-dashboard

# Generate sample data (optional — pre-generated data included)
python generate_data.py

# Open dashboard
open dashboard/index.html
```

## 📁 Project Structure

```
ecommerce-dashboard/
├── dashboard/
│   ├── index.html       # Main dashboard page
│   ├── style.css        # Dark theme with glassmorphism
│   └── app.js           # Chart.js logic & interactivity
├── data/
│   ├── orders.csv       # 50K+ order records
│   ├── customers.csv    # Customer profiles
│   ├── products.csv     # Product catalog
│   └── order_items.csv  # Order line items
├── sql_scripts/
│   └── analysis_queries.sql  # Business analysis SQL queries
├── generate_data.py     # Python data generation script
├── index.html           # Entry redirect
└── README.md
```

## 🗄️ SQL Analysis Included

The project includes real SQL queries for business analysis:
- Revenue trends by month/quarter
- Top-selling products & categories
- Customer segmentation & lifetime value
- Order status distribution
- Average order value analysis

## 📚 What I Learned

- Building interactive dashboards from scratch with vanilla JavaScript
- Chart.js for professional data visualizations
- Python scripting for realistic test data generation
- SQL analysis patterns for e-commerce business intelligence
- Responsive CSS design with glassmorphism effects

## 👨‍💻 Author

**Arjun Kuncham**  
🌐 [Portfolio](https://kunchamarjun05.github.io/portfolio/) • 💻 [GitHub](https://github.com/kunchamarjun05) • 📧 arjunkuncham05@gmail.com

---

⭐ Star this repo if you found it useful!
