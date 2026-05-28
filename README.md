# 🚀 Commyfy — Modern E-Commerce Platform

> A scalable, full-stack e-commerce platform built with Next.js, Prisma, and modern web architecture.

---

## ⚡ Overview

Commyfy is a multi-store e-commerce system designed with performance, scalability, and modular architecture in mind.

It supports:
- Multi-store architecture (`/s/[storeSlug]`)
- Dynamic category & product system
- Infinite scrolling UI
- Admin dashboard for full control
- Server Actions + Prisma-powered backend
- Optimized Next.js App Router structure

---

## 🧠 Tech Stack

- **Frontend:** Next.js 16 (App Router)
- **Backend:** Server Actions / API Routes
- **Database:** PostgreSQL + Prisma ORM
- **Styling:** CSS Modules
- **Auth:** Personal Email Auth using redis
- **Caching:** Next.js Cache API
- **Deployment Ready:** Vercel compatible

---

## 🌌 Features

### 🛍️ Storefront
- Dynamic store pages
- Product listing with pagination
- Category-based browsing
- Infinite scroll experience

### ⚙️ Admin Panel
- Category management (nested tree structure)
- Product & variant control
- Hero banner management
- Order & review system support

### ⚡ Performance
- Cursor-based pagination
- Server-side rendering + caching
- Optimized DB queries

---

```mermaid
erDiagram

  USER {
    string userId PK
    string email
    string firstName
    string lastName
    string phoneNumber
    boolean isActive
    boolean isVerified
  }

  ADMIN {
    string adminId PK
    string storeSlug
    string email
    boolean isActive
  }

  CATEGORY {
    int id PK
    string name
    string slug
    int parentId FK
    string adminId FK
    boolean isActive
  }

  PRODUCT {
    int id PK
    string name
    string slug
    int categoryId FK
    string adminId FK
    boolean isActive
  }

  PRODUCT_VARIANT {
    int id PK
    int productId FK
    decimal price
    decimal originalPrice
    int stock
    boolean isActive
  }

  PRODUCT_ATTRIBUTE {
    int id PK
    int productId FK
    string key
    string value
  }

  VARIANT_OPTION {
    int id PK
    int variantId FK
    string key
    string value
  }

  VARIANT_IMAGE {
    int id PK
    int variantId FK
    string image
  }

  HERO_BANNER {
    int id PK
    int productId FK
    int categoryId FK
    string adminId FK
  }

  CART_ITEM {
    string userId FK
    int productId FK
    int variantId FK
    int quantity
  }

  WISHLIST_ITEM {
    string userId FK
    int productId FK
    int variantId FK
  }

  REVIEW {
    int id PK
    string userId FK
    int productId FK
    int rating
  }

  WHATSAPP_ORDER {
    int id PK
    string adminId FK
    string userId FK
    int productId FK
    int variantId FK
    int quantity
  }

  ADMIN_NOTIFICATION {
    int id PK
    string adminId FK
    string type
  }

  %% RELATIONSHIPS

  ADMIN ||--o{ PRODUCT : creates
  ADMIN ||--o{ CATEGORY : owns
  ADMIN ||--o{ HERO_BANNER : manages
  ADMIN ||--o{ WHATSAPP_ORDER : receives
  ADMIN ||--o{ ADMIN_NOTIFICATION : gets

  CATEGORY ||--o{ CATEGORY : parent_child
  CATEGORY ||--o{ PRODUCT : contains

  PRODUCT ||--o{ PRODUCT_VARIANT : has
  PRODUCT ||--o{ PRODUCT_ATTRIBUTE : has
  PRODUCT ||--o{ REVIEW : receives
  PRODUCT ||--o{ HERO_BANNER : featured_in

  PRODUCT_VARIANT ||--o{ VARIANT_OPTION : has
  PRODUCT_VARIANT ||--o{ VARIANT_IMAGE : has

  USER ||--o{ CART_ITEM : adds
  USER ||--o{ WISHLIST_ITEM : saves
  USER ||--o{ REVIEW : writes
  USER ||--o{ WHATSAPP_ORDER : places

  PRODUCT ||--o{ CART_ITEM : in_cart
  PRODUCT ||--o{ WISHLIST_ITEM : saved
  PRODUCT ||--o{ WHATSAPP_ORDER : ordered

  PRODUCT_VARIANT ||--o{ CART_ITEM : variant_cart
  PRODUCT_VARIANT ||--o{ WISHLIST_ITEM : variant_saved
  PRODUCT_VARIANT ||--o{ WHATSAPP_ORDER : variant_ordered
```


## 🧬 Architecture
```
├── app
├── lib
├── prisma
├── public
├── types
├── .gitignore
├── eslint.config.mjs
├── LICENSE
├── next.config.ts
├── package.json
├── prisma.config.ts
├── proxy.ts
├── README.md
└── tsconfig.json
```


---

## 🚀 Getting Started

```bash
git clone https://github.com/BiswajitAich/modern-store-platform
cd modern-store-platform
npm install
```

## 👨‍💻 Author

Built by Biswajit Aich [![LinkedIn](https://custom-icon-badges.demolab.com/badge/LinkedIn-0A66C2?logo=linkedin-white&logoColor=fff)](https://www.linkedin.com/in/biswajitaich)
## ⚡ Status

🚧 Actively in development — core systems complete, optimization ongoing and some features are still incomplete.


---

If you want next upgrade, I can make it.

Just tell 👍