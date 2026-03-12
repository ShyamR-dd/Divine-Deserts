# Supabase Setup

1. Create a Supabase project.
2. In the SQL editor, run `supabase-schema.sql`.
3. In Storage, create a bucket named `product-images`.
4. Add the storage policies listed at the bottom of `supabase-schema.sql`.
5. In Authentication, create your mum's admin user.
6. Open `supabase-config.js` and replace:
   - `YOUR_SUPABASE_PROJECT_URL`
   - `YOUR_SUPABASE_ANON_KEY`
7. Deploy the site.

Notes:
- The public storefront reads products from the `products` table.
- The admin page signs in with Supabase Auth.
- Uploaded images go to the `product-images` bucket.
- If `supabase-config.js` still has placeholder values, the storefront falls back to default products and admin login will stay disabled.
