# Database Migration Instructions

## Option 1: Using Supabase Dashboard (Easiest)

1. Go to your Supabase project dashboard: https://supabase.com/dashboard/project/nidmjlkxptmplwjyuwqd
2. Navigate to **SQL Editor** in the left sidebar
3. Create a new query
4. Copy the contents of `migrations/20251117001815_drone_flights.sql`
5. Paste and run the SQL
6. Verify the table was created in the **Table Editor**

## Option 2: Using Supabase CLI

1. Install Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Link to your remote project:
   ```bash
   cd supabase
   supabase link --project-ref nidmjlkxptmplwjyuwqd
   ```

3. Push migrations to remote:
   ```bash
   supabase db push
   ```

## Verify Migration

After applying the migration, verify the table exists:

```sql
SELECT * FROM drone_flights LIMIT 1;
```

You should see the table structure with all columns ready to receive drone flight data.
