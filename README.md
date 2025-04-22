# YHE Order Management App

## Description

The **YHE Order Management App** is a modern web application built with Next.js and React that allows customers to track and manage their orders in real time. Key features include:

- **Order Tracking**: Enter your order ID (e.g. `00082` or `82`) to view detailed status and history.
- **3D Model Carousel**: Explore predesigned t‑shirt mockups and custom designs in an interactive 3D viewer.
- **Store Integration**: Link directly to the YHE online store for browsing and purchasing.
- **Responsive Design**: Full support for desktop and mobile devices with smooth touch and gesture controls.

## Features

- **Order Entry & Validation**
  - Zod‑powered form validation ensures order IDs are numeric and properly formatted.
- **Order Details Page**
  - View customer info, products, shipping, payment, and print statuses.
  - Upload and preview custom front/back designs.
- **3D Model Carousel**
  - Rotate, zoom, and pan GLB models (or OBJ) of t‑shirt designs.
- **Store Link**
  - “Visit Store” button opens the YHE e‑commerce site.
- **FAQ Section**
  - Predefined FAQ array with common user questions on the order details page.
- **Smooth Animations**
  - Framer Motion for scroll animations, react‑spring for model transitions.
- **Scroll‑to‑Top Button**
  - Appears when scrolling beyond the hero section.

## Technologies Used

- **Frontend**
  - Next.js & React
  - React Hooks for state management
  - **3D**: three, @react-three/fiber, @react-three/drei
  - **Icons**: Lucide Icons
- **Styling**
  - Tailwind CSS + custom CSS
  - CSS modules for component‑scoped styles
- **Forms & Validation**
  - Zod schemas
- **Utilities**
  - date-fns for date formatting
  - clsx + tailwind-merge for className composition
- **API & Data**
  - Next.js API routes
  - Axios for client‑side requests
- **Deployment**
  - Vercel (recommended)
  - Environment variables for Cloudinary, Supabase, and Prisma

## Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-org/yhe-order-management.git
   cd yhe-order-management
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Configure environment**\
   Copy `.env.example` to `.env.local` and fill in:

   ```env
   DATABASE_URL=postgresql://user:pass@host:port/db
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=...
   CLOUDINARY_API_SECRET=...
   ```

4. **Run locally**

   ```bash
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Usage

1. **Home / Hero**

   - Enter your Order ID (e.g. `00082` or `82`) and click **Track Order**.
   - If valid, you’ll be redirected to `/order/00082`.

2. **Order Details**

   - Review order summary, status, shipping info.
   - Upload custom front/back designs and preview them.
   - Check print status and payment/shipping progress.

3. **Explore Designs**

   - Scroll down to **Explore Our Designs**.
   - Use Prev/Next buttons or swipe gestures (two‑finger drag on mobile) to cycle GLB models.

4. **FAQs**

   - Jump to the FAQ section for common questions about order tracking, ID formats, and design guidelines.

## Folder Structure

```
/app
  /api            # Next.js route handlers (orders, cloudinary, etc.)
  /order/[id]     # Order details page
  page.tsx        # Home / hero / carousel / FAQs
/components       # Reusable UI components
/lib              # Utils, actions, data fetching
/prisma           # Prisma schema & migrations
/public/models    # 3D GLB (or OBJ) files
/styles           # Global CSS, Tailwind config
```

## Contributing

1. Fork the repo & create a feature branch:
   ```bash
   git checkout -b feat/your-feature
   ```
2. Commit your changes & push your branch.
3. Open a PR describing your changes & link any relevant issues.
4. Ensure linting & tests pass:
   ```bash
   pnpm lint
   pnpm test
   ```

## License

This project is licensed under the MIT License. See [LICENSE](./LICENSE) for details.

## Contact Information

- **Author**: Beloved Afolabi
- **Portfolio**: [BFA](https://bfa-portfolio.vercel.app/)
- **LinkedIn**: [linkedin.com/in/beloved-afolabi-53111322a](https://www.linkedin.com/in/beloved-afolabi-53111322a/)
- **Email**: [belovedafolabi@gmail.com](mailto\:belovedafolabi@gmail.com)

---

> Built with ❤️ using Next.js, Tailwind CSS, and Three.js.
