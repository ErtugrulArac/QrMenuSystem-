# QR Menu System - AI Agent Instructions

## Project Overview
A bilingual (TR/EN) Next.js 14 QR restaurant menu system with admin panel. Customers scan QR codes to browse menus and order from tables, while admins manage categories, products, orders, and tables.

## Architecture

### Core Structure
- **Two route groups**: `(customer)` for public menu interface, `(admin)` for authenticated dashboard
- **Authentication**: NextAuth 5.0 beta with credential provider (bcrypt), routes in [src/routes.ts](src/routes.ts)
- **Data layer**: MongoDB via Prisma + JSON file storage for orders/tables (see [src/utils/ordersStorage.ts](src/utils/ordersStorage.ts))
- **State**: Zustand for cart (`cart.ts`) and language (`lang.ts`) with localStorage persistence
- **UI Components**: Radix UI primitives + custom components under `src/components/`

### Key Patterns
1. **API Routes**: RESTful endpoints in `src/app/api/` following pattern: `GET`, `POST` in `/route.ts`, `PUT`/`DELETE`/`PATCH` in `[id]/route.ts`
2. **Data Fetching**: React Query (`@tanstack/react-query`) for admin panel, direct API calls for customer pages
3. **i18n**: Manual translation system via [src/lib/translations.ts](src/lib/translations.ts) + Zustand store, accessed with `getTranslation(key, lang)`
4. **Images**: Firebase Storage for uploads (browser-image-compression before upload), Unsplash URLs for placeholders

## Critical Workflows

### Development
```bash
npm run dev          # Start dev server (default port 3000)
npm run build        # Production build
npm run generate-sitemap  # Update SEO sitemap
```

### Admin Access
- URL: `/auth/login`
- Default: `admin@qrmenu.com` / `admin123` (create via [scripts/create-admin.js](scripts/create-admin.js))
- Protected by middleware in [src/middleware.ts](src/middleware.ts)

### Data Persistence
Orders and tables use **dual storage**:
- Live state: JSON files (`orders.json`, `tables.json`) in project root
- Database: MongoDB for categories, products, users only
- Helper functions: `loadOrders()`, `saveOrders()`, `loadTables()`, `saveTables()`

## Code Conventions

### File Naming
- Components: `index.tsx` with parent folder name as component name
- API routes: `route.ts` for collection, `[id]/route.ts` for item operations
- No `.js` extensions—use TypeScript everywhere

### State Management
```typescript
// Zustand with persist (cart/lang)
const useCartStore = create<CartStore>()(persist((set, get) => ({...}), { name: 'cart-storage' }))

// React Query (admin panel)
const { data } = useQuery({ queryKey: ['products'], queryFn: fetchProducts })
const mutation = useMutation({ mutationFn: addProduct, onSuccess: () => queryClient.invalidateQueries(['products']) })
```

### Styling
- Tailwind CSS with shadcn/ui component library
- Mobile-first: customer layout constrained to `md:w-[50%] lg:w-[30%]` centered
- Responsive breakpoints: `max-md:` for mobile overrides

### Toast Notifications
Use `react-toastify` (already configured in root layout):
```typescript
import { toast } from 'react-toastify';
toast.success('İşlem başarılı!'); // TR messages preferred in admin
toast.error('Hata oluştu!');
```

## Integration Points

### Firebase Storage
```typescript
import { app } from '@/utils/firebase';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
// Compress images with browser-image-compression before upload
```

### Language System
```typescript
// In components
const { lang } = useLanStore();
const t = (key: string) => getTranslation(key, lang);

// Display bilingual content
{lang === 'TR' ? item.name : item.ename}
```

### Cart Flow
1. Customer selects table → stored in Zustand (`tableNumber`)
2. Adds items → persisted in localStorage
3. Places order → POST `/api/orders` → closes table → clears cart

## Common Tasks

### Adding New Category/Product
1. Use admin panel UI (preferred) OR
2. Direct API: POST to `/api/categories` or `/api/products` with Prisma schema fields
3. Images: Upload to Firebase or use direct URLs

### Modifying Table Status
Tables stored in `tables.json`: `{ id, code, status: 'open'|'closed', currentOrder }`
- API: PATCH `/api/tables/[id]` to toggle status
- Auto-closes on order placement

### URL Configuration
**Important**: Update [src/lib/url.ts](src/lib/url.ts) when changing deployment URL (used for QR generation and links)

## Environment Setup
Required `.env.local`:
```
DATABASE_URL="mongodb+srv://..."
NEXTAUTH_SECRET="..."
FIREBASE_API_KEY="..."
```

## Gotchas
- ⚠️ Orders/tables use JSON files, not Prisma—don't try to query with `prisma.orders.findMany()`
- ⚠️ Middleware matches `/dashboard` as public route but redirects unauthenticated users (see [src/routes.ts](src/routes.ts))
- ⚠️ Turkish content is primary—always provide `name` and `ename` for categories/products
- ⚠️ React Query only used in admin panel (QueryProvider wrapper in dashboard layout)

## Key Files Reference
- Auth config: [src/auth.config.ts](src/auth.config.ts), [src/auth.ts](src/auth.ts)
- Schemas: [src/schemas/index.ts](src/schemas/index.ts) (Zod validation)
- Types: [src/types/index.ts](src/types/index.ts)
- Prisma: [prisma/schema.prisma](prisma/schema.prisma)
- Admin layouts: [src/app/(admin)/dashboard/layout.tsx](src/app/(admin)/dashboard/layout.tsx)
- Customer layouts: [src/app/(customer)/layout.tsx](src/app/(customer)/layout.tsx)

## Documentation
See [QUICK_START.md](QUICK_START.md) for step-by-step admin panel guide (Turkish)
