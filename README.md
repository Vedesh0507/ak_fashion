# 📦 AK Fashion Hub - Complete Project Documentation

## 📋 Project Overview

**AK Fashion Hub** is a full-stack e-commerce web application for a women's ethnic wear fashion store based in Khammam, Telangana, India. The store is owned by **Rehana Parveen** and specializes in sarees, dress materials, and ethnic wear.

### Business Details
- **Business Name:** AK Fashion Hub
- **Owner:** Rehana Parveen
- **Contact:** 7680924488
- **Location:** Nizampet, Behind Belief Hospital, Khammam, Telangana
- **UPI ID:** rehanaparveen9553@ybl
- **Instagram:** @akfastionhub
- **Store Hours:** Mon-Sat: 10:00 AM - 9:00 PM, Sunday: 11:00 AM - 7:00 PM

---

## 🛠️ Technology Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.3.1 | UI Framework |
| TypeScript | 5.8.3 | Type Safety |
| Vite | 5.4.19 | Build Tool |
| Tailwind CSS | 3.4.17 | Styling |
| shadcn/ui | - | UI Component Library |
| React Router DOM | 6.30.1 | Client-side Routing |
| TanStack React Query | 5.83.0 | Server State Management |
| React Hook Form | 7.61.1 | Form Management |
| Zod | 3.25.76 | Schema Validation |
| Recharts | 2.15.4 | Charts (for admin) |

### Backend
| Technology | Purpose |
|------------|---------|
| Supabase | Database, Authentication, Storage |
| PostgreSQL | Database (via Supabase) |

### UI Libraries
- **Radix UI** - Headless components (accordion, dialog, dropdown, etc.)
- **Lucide React** - Icons
- **Embla Carousel** - Product carousels
- **Sonner** - Toast notifications
- **date-fns** - Date formatting

---

## 📁 Project Structure

```
ak-fashion-hub-flutter-main/
├── index.html              # Entry HTML with SEO meta tags
├── package.json            # Dependencies & scripts
├── vite.config.ts          # Vite configuration
├── tailwind.config.ts      # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration
├── components.json         # shadcn/ui configuration
│
├── public/
│   └── robots.txt          # SEO robots file
│
├── src/
│   ├── main.tsx            # React entry point
│   ├── App.tsx             # Main App component with routing
│   ├── index.css           # Global styles & CSS variables
│   │
│   ├── assets/             # Static images
│   │   ├── hero-banner.png
│   │   ├── category-*.jpg
│   │   ├── product-*.jpeg
│   │   └── phonepe-qr.jpeg
│   │
│   ├── pages/              # Route pages
│   │   ├── Index.tsx       # Home page
│   │   ├── ProductDetail.tsx
│   │   ├── Checkout.tsx
│   │   ├── OrderSuccess.tsx
│   │   ├── Auth.tsx
│   │   ├── Profile.tsx
│   │   ├── Wishlist.tsx
│   │   ├── Admin.tsx
│   │   └── NotFound.tsx
│   │
│   ├── components/         # Reusable components
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── HeroSection.tsx
│   │   ├── ProductCard.tsx
│   │   ├── CartSheet.tsx
│   │   ├── ...
│   │   ├── admin/          # Admin-specific components
│   │   ├── checkout/       # Checkout-specific components
│   │   └── ui/             # shadcn/ui components
│   │
│   ├── contexts/           # React Context providers
│   │   ├── AuthContext.tsx
│   │   ├── CartContext.tsx
│   │   └── WishlistContext.tsx
│   │
│   ├── hooks/              # Custom React hooks
│   │   ├── useProducts.ts
│   │   ├── use-toast.ts
│   │   └── use-mobile.tsx
│   │
│   ├── integrations/
│   │   └── supabase/
│   │       ├── client.ts   # Supabase client config
│   │       └── types.ts    # Database type definitions
│   │
│   └── lib/
│       └── utils.ts        # Utility functions
│
└── supabase/
    ├── config.toml         # Supabase configuration
    └── migrations/         # Database migrations
```

---

## 📄 Pages Documentation

### 1. **Home Page** (`/`) - `src/pages/Index.tsx`
The main landing page containing:

| Section | Component | Description |
|---------|-----------|-------------|
| Header | `Header.tsx` | Logo, search, cart, wishlist, profile links |
| Hero | `HeroSection.tsx` | Banner with CTA buttons (Call/WhatsApp) |
| Trust Badges | `TrustBadges.tsx` | Quality assurance badges |
| Categories | `CategoriesSection.tsx` | Shop by category cards (Designer Sarees, Banaras, Dress Materials, Daily Wear) |
| Products | `ProductsSection.tsx` | Product grid with filters & sorting |
| Reviews | `ReviewsCarousel.tsx` | Customer testimonials carousel |
| Our Story | `OurStorySection.tsx` | About the business & founder |
| Benefits | `BenefitsSection.tsx` | Why choose us (6 benefits) |
| FAQ | `FAQSection.tsx` | Frequently asked questions |
| Contact | `ContactSection.tsx` | Store location, map, contact buttons |
| Footer | `Footer.tsx` | Links, contact info, social |
| Mobile CTA | `MobileStickyCTA.tsx` | Sticky bottom bar for mobile |
| WhatsApp Button | `WhatsAppFloatingButton.tsx` | Floating WhatsApp button |

---

### 2. **Product Detail Page** (`/product/:id`) - `src/pages/ProductDetail.tsx`
Individual product page with:
- **Image Gallery** - Main image with thumbnails, navigation arrows
- **Product Info** - Name, price, discount, description
- **Color Selection** - Available color variants
- **Size Selection** - Available sizes with stock info
- **Size Guide** - Measurement chart dialog
- **Add to Cart** - With quantity selection
- **WhatsApp Order** - Direct order via WhatsApp
- **Share** - Social media sharing (WhatsApp, Facebook, Twitter)
- **Notify Me** - Email notification for out-of-stock items
- **Related Products** - Products from same category
- **Demo Products** - Fallback products if database is empty

---

### 3. **Checkout Page** (`/checkout`) - `src/pages/Checkout.tsx`
Order checkout with:
- **Customer Details Form** - Name, phone, email, address
- **Order Summary** - Cart items preview with images
- **Payment Methods:**
  - **Cash on Delivery (COD)**
  - **UPI Payment** with QR code & screenshot upload
- **Order Placement** - Creates order in database
- **WhatsApp Notification** - Sends order details to store

---

### 4. **Order Success Page** (`/order-success`) - `src/pages/OrderSuccess.tsx`
Post-order confirmation showing:
- Success animation with checkmark
- Order ID display
- Payment method confirmation
- Next steps guide
- Call & WhatsApp buttons
- Continue shopping CTA

---

### 5. **Authentication Page** (`/auth`) - `src/pages/Auth.tsx`
User authentication with:
- **Sign In Tab** - Email & password login
- **Sign Up Tab** - Registration with:
  - Full name
  - Phone number (10-digit validation)
  - Email
  - Password (min 6 chars)
- **Form Validation** - Using Zod schemas
- **Return Redirect** - Returns to previous page after auth

---

### 6. **Profile Page** (`/profile`) - `src/pages/Profile.tsx`
User account management:
- **Profile Section** - Update name, phone, view email
- **Saved Addresses** - Add/edit/delete delivery addresses
  - Label (Home/Office/Other)
  - Full name, phone, address details
  - Set default address
- **Order History** - Past orders with status
- **Sign Out** - Logout functionality

---

### 7. **Wishlist Page** (`/wishlist`) - `src/pages/Wishlist.tsx`
Saved items page:
- Grid of wishlist items with images
- Price display with discounts
- Add to cart from wishlist
- Remove from wishlist
- Empty state with CTA
- **Requires Authentication**

---

### 8. **Admin Panel** (`/admin`) - `src/pages/Admin.tsx`
Store management dashboard (**Admin users only**):

#### Dashboard Stats:
- Total Products count
- Total Orders count
- Pending Orders count

#### Products Tab:
- Products table with image, name, category, price, stock, status
- Add/Edit product dialog with:
  - Name, description, price, original price
  - Category selection (with add new)
  - Image URL & additional images
  - Size variants with stock
  - Color variants
  - Active/Featured toggles
- Delete product with confirmation

#### Orders Tab:
- Orders table with ID, customer, contact, total, payment, date, status
- Status management dropdown (Pending → Confirmed → Processing → Shipped → Delivered / Cancelled)

---

### 9. **404 Not Found Page** (`/*`) - `src/pages/NotFound.tsx`
Error page for invalid routes with return home link.

---

## 🗄️ Database Schema (Supabase)

### Tables

#### `products`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | TEXT | Product name |
| description | TEXT | Product description |
| price | DECIMAL(10,2) | Selling price |
| original_price | DECIMAL(10,2) | MRP (for discount calculation) |
| image_url | TEXT | Main product image |
| category | TEXT | Product category |
| stock_quantity | INTEGER | Available stock |
| is_featured | BOOLEAN | Featured product flag |
| is_active | BOOLEAN | Active/hidden flag |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Update timestamp |

#### `product_sizes`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| product_id | UUID | FK to products |
| size | TEXT | Size label (S, M, L, etc.) |
| chest_measurement | TEXT | Chest measurement |
| hip_measurement | TEXT | Hip measurement |
| stock_quantity | INTEGER | Stock for this size |

#### `product_colors`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| product_id | UUID | FK to products |
| name | TEXT | Color name |
| hex_code | TEXT | Hex color code |
| image_url | TEXT | Color variant image |

#### `product_images`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| product_id | UUID | FK to products |
| image_url | TEXT | Image URL |
| sort_order | INTEGER | Display order |

#### `categories`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | TEXT | Category name |
| description | TEXT | Category description |
| image_url | TEXT | Category image |
| is_active | BOOLEAN | Active flag |

#### `cart_items`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | FK to auth.users (optional) |
| session_id | TEXT | Guest session ID |
| product_id | UUID | FK to products |
| quantity | INTEGER | Item quantity |

#### `orders`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | FK to auth.users (optional) |
| customer_name | TEXT | Customer name |
| customer_email | TEXT | Customer email |
| customer_phone | TEXT | Customer phone |
| customer_address | TEXT | Delivery address |
| total_amount | DECIMAL(10,2) | Order total |
| status | TEXT | Order status |
| payment_method | TEXT | cod/upi |
| notes | TEXT | Order notes |

#### `order_items`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| order_id | UUID | FK to orders |
| product_id | UUID | FK to products |
| product_name | TEXT | Product name at order time |
| product_price | DECIMAL(10,2) | Price at order time |
| quantity | INTEGER | Ordered quantity |

#### `profiles`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | FK to auth.users |
| full_name | TEXT | User's full name |
| phone | TEXT | Phone number |
| email | TEXT | Email address |

#### `user_roles`
| Column | Type | Description |
|--------|------|-------------|
| user_id | UUID | FK to auth.users |
| role | TEXT | User role (admin) |

#### `wishlist`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | FK to auth.users |
| product_id | UUID | FK to products |

#### `saved_addresses`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | FK to auth.users |
| label | TEXT | Home/Office/Other |
| full_name | TEXT | Recipient name |
| phone | TEXT | Contact phone |
| address_line1 | TEXT | Address line 1 |
| address_line2 | TEXT | Address line 2 |
| city | TEXT | City |
| state | TEXT | State |
| pincode | TEXT | PIN code |
| is_default | BOOLEAN | Default address flag |

#### `notify_requests`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| product_id | UUID | FK to products |
| email | TEXT | Customer email |
| size | TEXT | Requested size |
| color | TEXT | Requested color |
| notified | BOOLEAN | Notification sent flag |

---

## 🎨 Design System

### Color Palette (CSS Variables)
```css
--gold: 40 85% 55%        /* Primary accent - Gold */
--navy: 220 65% 25%       /* Primary brand - Deep Blue */
--cream: 30 33% 97%       /* Background - Warm cream */
--background: 30 33% 97%  /* Main background */
--foreground: 220 40% 13% /* Text color */
```

### Typography
- **Headings:** Cormorant Garamond (Serif)
- **Body:** Outfit (Sans-serif)

### Custom Button Variants
- `gold` - Gold gradient background
- `whatsapp` - Green WhatsApp branded
- `call` - Red call button
- `hero` - Large gold hero CTA

---

## 🔐 Authentication & Authorization

### Features:
- Email/Password authentication via Supabase Auth
- Session persistence in localStorage
- Profile management
- Role-based access (Admin role)

### Auth Context provides:
- `user` - Current authenticated user
- `profile` - User profile data
- `isAdmin` - Admin role check
- `isProfileComplete` - Name & phone check
- `signIn()`, `signUp()`, `signOut()` methods

---

## 🛒 Cart System

### Features:
- **Guest cart** using session ID (stored in localStorage)
- **Authenticated cart** linked to user ID
- Persistent cart across sessions
- Add/remove/update quantity
- Cart sheet with payment flow

### Cart Context provides:
- `items` - Cart items array
- `totalItems`, `totalPrice`
- `addToCart()`, `removeFromCart()`, `updateQuantity()`, `clearCart()`

---

## 💳 Payment Methods

### 1. Cash on Delivery (COD)
- No additional steps required
- Order placed with pending status

### 2. UPI Payment
- QR code display (PhonePe)
- UPI ID: `rehanaparveen9553@ybl`
- Deep links for PhonePe, Google Pay, Paytm
- Screenshot upload required
- Order placed with payment_received status

---

## 📱 WhatsApp Integration

- Floating WhatsApp button on all pages
- Direct order via WhatsApp
- Order notifications sent to store owner
- Product inquiry links on product cards

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to the project directory
cd ak-fashion-hub-flutter-main

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be available at `http://localhost:8080`

### Scripts

```bash
npm run dev       # Start development server on port 8080
npm run build     # Production build
npm run preview   # Preview production build
npm run lint      # ESLint check
```

---

## 🔧 Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```

---

## 📊 Features Summary

| Feature | Status |
|---------|--------|
| Product Catalog | ✅ |
| Product Categories | ✅ |
| Product Search | ✅ |
| Product Filtering & Sorting | ✅ |
| Shopping Cart (Guest & Auth) | ✅ |
| Wishlist (Auth required) | ✅ |
| User Authentication | ✅ |
| User Profiles | ✅ |
| Saved Addresses | ✅ |
| Order History | ✅ |
| Checkout with COD/UPI | ✅ |
| WhatsApp Integration | ✅ |
| Admin Dashboard | ✅ |
| Product Management | ✅ |
| Order Management | ✅ |
| Size & Color Variants | ✅ |
| Responsive Design | ✅ |
| SEO Optimized | ✅ |
| Dark Mode Support | ✅ |

---

## 📄 License

This project is private and proprietary to AK Fashion Hub.

---

## 👥 Contact

For any queries regarding this project, contact:
- **Phone:** 7680924488
- **WhatsApp:** [wa.me/917680924488](https://wa.me/917680924488)
- **Instagram:** [@akfastionhub](https://www.instagram.com/akfastionhub)

---

Made with ❤️ for AK Fashion Hub
