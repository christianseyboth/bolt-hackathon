# SecPilot Project Structure

## 📁 Directory Organization

### `/src/app` - App Router Structure

```
src/app/
├── layout.tsx              # Root layout with NavBar, Footer, Toaster
├── page.tsx                # Home page
├── (marketing)/            # Marketing pages group
│   ├── pricing/           # Pricing page
│   ├── contact/           # Contact page
│   └── about/             # About page (future)
├── (dashboard)/           # Dashboard pages group
│   ├── layout.tsx         # Dashboard-specific layout
│   └── ...dashboard pages
├── (auth)/                # Authentication pages group
│   ├── layout.tsx         # Auth-specific layout (no navbar)
│   └── ...auth pages
└── api/                   # API routes
```

### `/src/components` - Component Organization

```
src/components/
├── ui/                    # Reusable UI components (shadcn/ui)
│   ├── button.tsx
│   ├── input.tsx
│   └── toaster.tsx
├── layout/               # Layout-specific components
│   ├── navbar/          # Navigation components
│   ├── footer.tsx       # Footer component
│   └── sidebar/         # Sidebar components (future)
├── marketing/           # Marketing page components
│   ├── hero/           # Hero section
│   ├── features/       # Features section
│   ├── testimonials/   # Testimonials
│   ├── pricing-section.tsx
│   ├── contact-form.tsx
│   ├── cta.tsx
│   ├── tools.tsx
│   └── faqs.tsx
├── dashboard/           # Dashboard components
│   └── ...dashboard specific components
└── shared/             # Shared business logic components
    ├── forms/
    └── modals/
```

### `/sql-migrations` - Database Management

```
sql-migrations/
├── database-setup.sql
├── accounts-function.sql
├── complete-oauth-setup.sql
└── ...other migration files
```

### `/docs` - Documentation

```
docs/
├── AUTH_SETUP.md
├── STRIPE_SETUP.md
└── STRIPE_SETUP_INSTRUCTIONS.md
```

## 🔧 Key Improvements Made

1. **Route Structure**: Organized routes into logical groups
2. **Component Organization**: Separated by functionality and usage
3. **File Cleanup**: Moved SQL and docs to dedicated directories
4. **Package.json**: Updated with proper naming and description
5. **Import Paths**: Updated to reflect new structure

## 📊 Benefits

-   ✅ **Better Organization**: Logical grouping of related files
-   ✅ **Easier Navigation**: Clear separation of concerns
-   ✅ **Scalability**: Easy to add new features
-   ✅ **Maintainability**: Cleaner codebase structure
-   ✅ **Developer Experience**: Faster file location and editing

## 🚀 Next Steps

1. Continue organizing remaining components
2. Add proper TypeScript interfaces
3. Implement proper error boundaries
4. Add comprehensive testing structure
5. Create component documentation
