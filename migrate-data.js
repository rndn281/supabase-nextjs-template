/**
 * Data Migration Script
 * Migrates drone_flights data from old Supabase project to new one
 */

const { createClient } = require('@supabase/supabase-js');

// Old Supabase Project
const OLD_SUPABASE_URL = 'https://dvjjyzqsixrwyayvoeai.supabase.co';
const OLD_SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2amp5enFzaXhyd3lheXZvZWFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3MTkwNzYsImV4cCI6MjA3ODI5NTA3Nn0.KbsGfrVLA3Fy51mijxLOfbSEFInQN0zjc39ij6y9tDc';

// New Supabase Project
const NEW_SUPABASE_URL = 'https://nidmjlkxptmplwjyuwqd.supabase.co';
const NEW_SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pZG1qbGt4cHRtcGx3anl1d3FkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzMjc4MDksImV4cCI6MjA3ODkwMzgwOX0.keBrB-S4YIntJ7KgKsimLF9uV8qJN0d8dGbW6Y4xc9Q';

// For bulk operations, use service role key if available
const NEW_SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pZG1qbGt4cHRtcGx3anl1d3FkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzMyNzgwOSwiZXhwIjoyMDc4OTAzODA5fQ.XQKG2Ws0GSU_viEXGCX7QdJo3mtf2X5J9zUC6u2XGdw';

const TABLE_NAME = 'drone_flights';

async function migrateData() {
    console.log('🚀 Starting data migration...\n');

    // Create clients
    const oldSupabase = createClient(OLD_SUPABASE_URL, OLD_SUPABASE_KEY);
    const newSupabase = createClient(NEW_SUPABASE_URL, NEW_SUPABASE_SERVICE_KEY);

    try {
        // Step 1: Export data from old project
        console.log('📥 Fetching data from old Supabase project...');

        let allData = [];
        let page = 0;
        const PAGE_SIZE = 1000;
        let hasMore = true;

        while (hasMore) {
            const from = page * PAGE_SIZE;
            const to = from + PAGE_SIZE - 1;

            const { data, error } = await oldSupabase
                .from(TABLE_NAME)
                .select('*')
                .order('timestamp_gmt', { ascending: false })
                .range(from, to);

            if (error) {
                console.error('❌ Error fetching data:', error);
                throw error;
            }

            if (data && data.length > 0) {
                allData = allData.concat(data);
                console.log(`   Fetched page ${page + 1}: ${data.length} records (total: ${allData.length})`);

                if (data.length < PAGE_SIZE) {
                    hasMore = false;
                }
                page++;
            } else {
                hasMore = false;
            }
        }

        console.log(`✅ Successfully fetched ${allData.length} records from old project\n`);

        if (allData.length === 0) {
            console.log('⚠️  No data to migrate. Exiting.');
            return;
        }

        // Step 2: Transform data if needed (remove id and created_at to let new DB generate them)
        console.log('🔄 Preparing data for import...');
        const transformedData = allData.map(record => {
            const { id, created_at, ...rest } = record;
            return rest;
        });

        // Step 3: Import data to new project in batches
        console.log('📤 Importing data to new Supabase project...\n');

        const BATCH_SIZE = 100; // Supabase recommends batches of 100-1000
        const batches = [];

        for (let i = 0; i < transformedData.length; i += BATCH_SIZE) {
            batches.push(transformedData.slice(i, i + BATCH_SIZE));
        }

        console.log(`   Importing in ${batches.length} batches of ${BATCH_SIZE}...`);

        let importedCount = 0;
        for (let i = 0; i < batches.length; i++) {
            const batch = batches[i];

            const { data, error } = await newSupabase
                .from(TABLE_NAME)
                .insert(batch)
                .select();

            if (error) {
                console.error(`❌ Error importing batch ${i + 1}:`, error);
                throw error;
            }

            importedCount += batch.length;
            console.log(`   ✅ Batch ${i + 1}/${batches.length}: Imported ${batch.length} records (total: ${importedCount}/${transformedData.length})`);
        }

        console.log(`\n🎉 Migration complete! Successfully migrated ${importedCount} records.`);

        // Step 4: Verify migration
        console.log('\n🔍 Verifying migration...');
        const { count, error: countError } = await newSupabase
            .from(TABLE_NAME)
            .select('*', { count: 'exact', head: true });

        if (countError) {
            console.error('❌ Error verifying migration:', countError);
        } else {
            console.log(`✅ New database contains ${count} records`);
        }

    } catch (error) {
        console.error('\n❌ Migration failed:', error);
        process.exit(1);
    }
}

// Run migration
migrateData();
