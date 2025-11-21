# Medusa Admin Category Image Plugin

This plugin adds a category image upload widget to the Medusa admin dashboard and extends the product category data model.

## Features

- ✅ **Database Schema**: Adds an `image` column to the `product_category` table via migration.
- ✅ **API Extension**: Overrides standard category Create/Update APIs to handle image uploads and removals.
- ✅ **Admin UI**: Adds image selection to the category create/edit modals and keeps a widget on the category details page to upload, view, replace, and remove images.
- ✅ **Storage**: Uses Medusa's built-in file upload API.

## Installation

1. **Add the plugin to your Medusa project:**

```bash
cd /path/to/your/medusa-project
yarn add file:/Users/pradipparmar/git/ecommerce/medusa-plugins/medusa-admin-category
```

2. **Add the plugin to your `medusa-config.ts`:**

```typescript
import { defineConfig } from "@medusajs/framework/utils"

export default defineConfig({
  // ... other config
  plugins: [
    // ... other plugins
    {
      resolve: "medusa-admin-category",
    },
  ],
})
```

3. **Run Migrations:**

Since this plugin adds a database column, you need to run migrations:

```bash
npx medusa db:migrate
```

4. **Restart your Medusa server:**

```bash
yarn dev
```

## Usage

1. Navigate to **Settings** → **Product Categories**.
2. Click on a category to view its details.
3. Use the **Category Image** widget at the bottom to upload or manage the image.

## Technical Details

### Database
- Migration: `1732186200000-add-product-category-image.ts`
- Column: `image` (varchar) added to `product_category` table.

### API Overrides
- `POST /admin/product-categories`: Handles creation with image.
- `POST /admin/product-categories/:id`: Handles updates with image.
- Logic: Stores image URL in `metadata.image_url` for immediate availability and compatibility with the widget.

### Widget
- Location: `product_category.details.after`
- Functionality: Uploads to `/admin/uploads`, then updates category metadata.

## License

MIT
