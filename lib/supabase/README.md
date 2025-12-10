# Supabase Integration for Artifacts

This directory contains Supabase-related files for artifact persistence.

## Structure

```
lib/supabase/
├── migrations/          # SQL migration files
├── client.ts            # Supabase client setup
├── types.ts             # TypeScript types
└── queries.ts           # Database query functions
```

## Migrations

### Running Migrations

1. **Via Supabase Dashboard** (Recommended for now):
   - Go to your Supabase project dashboard
   - Navigate to SQL Editor
   - Copy the SQL from `migrations/001_create_document_table.sql`
   - Paste and run

2. **Via Supabase CLI** (Future):
   ```bash
   supabase db push
   ```

### Migration Files

- `001_create_document_table.sql` - Creates the Document table for artifacts

## Setup Instructions

### Step 1: Create the Table

1. Open your Supabase project dashboard
2. Go to **SQL Editor**
3. Copy the contents of `migrations/001_create_document_table.sql`
4. Paste into SQL Editor
5. Click **Run** or press `Ctrl+Enter`
6. Verify table creation in **Table Editor**

### Step 2: Verify Table Creation

1. Go to **Table Editor** in Supabase dashboard
2. You should see the `Document` table
3. Check that columns match:
   - `id` (uuid)
   - `createdAt` (timestamp)
   - `title` (text)
   - `content` (text)
   - `kind` (varchar)
   - `userId` (uuid)

### Step 3: Test Insert (Optional)

```sql
-- Test insert
INSERT INTO "Document" ("id", "title", "content", "kind", "userId")
VALUES (
  gen_random_uuid(),
  'Test Document',
  'This is a test document',
  'text',
  gen_random_uuid()
);

-- Verify
SELECT * FROM "Document";
```

## Notes

- **Composite Primary Key**: `(id, createdAt)` enables version history
- **Indexes**: Created for faster lookups by `id` and `userId`
- **Constraints**: `kind` must be one of: 'text', 'code', 'sheet'
- **Foreign Key**: `userId` foreign key is commented out (add when user table exists)

## Next Steps

After creating the table, proceed to:
- ✅ Step 1.2: Set up Supabase client (`client.ts`) - **DONE**
- ✅ Step 1.3: Create database types (`types.ts`) - **DONE**
- Step 2.1: Create GET `/api/document` route

## Environment Variables

Add these to your `.env.local` file (see `.env.example` for template):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**Where to find these values**:
1. Go to your Supabase project dashboard
2. Navigate to **Project Settings** → **API**
3. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY`

⚠️ **Security Note**: The service role key has admin privileges. Never commit it to version control!

