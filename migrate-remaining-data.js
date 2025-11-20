/**
 * Incremental Data Migration Script
 * Only migrates records that don't exist in the new database
 */

const { createClient } = require('@supabase/supabase-js');

// Old Supabase Project
const OLD_SUPABASE_URL = 'https://dvjjyzqsixrwyayvoeai.supabase.co';
const OLD_SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2amp5enFzaXhyd3lheXZvZWFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3MTkwNzYsImV4cCI6MjA3ODI5NTA3Nn0.KbsGfrVLA3Fy51mijxLOfbSEFInQN0zjc39ij6y9tDc';

// New Supabase Project
const NEW_SUPABASE_URL = 'https://nidmjlkxptmplwjyuwqd.supabase.co';
const NEW_SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pZG1qbGt4cHRtcGx3anl1d3FkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzMyNzgwOSwiZXhwIjoyMDc4OTAzODA5fQ.XQKG2Ws0GSU_viEXGCX7QdJo3mtf2X5J9zUC6u2XGdw';

const TABLE_NAME = 'drone_flights';

async function migrateRemainingData() {
    console.log('🚀 Starting incremental data migration...\n');

    const oldSupabase = createClient(OLD_SUPABASE_URL, OLD_SUPABASE_KEY);
    const newSupabase = createClient(NEW_SUPABASE_URL, NEW_SUPABASE_SERVICE_KEY);

    try {
        // Step 1: Get all event_ids from new database
        console.log('📋 Fetching existing records from new database...');
        const { data: existingRecords, error: existingError } = await newSupabase
            .from(TABLE_NAME)
            .select('event_id, timestamp_gmt');

        if (existingError) {
            console.error('❌ Error fetching existing records:', existingError);
            throw existingError;
        }

        const existingKeys = new Set();
        existingRecords.forEach(record => {
            // Create unique key from event_id and timestamp
            const key = `${record.event_id}_${record.timestamp_gmt}`;
            existingKeys.add(key);
        });

        console.log(`✅ Found ${existingKeys.size} existing records\n`);

        // Step 2: Fetch all data from old database
        console.log('📥 Fetching all data from old database...');
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

        console.log(`✅ Fetched ${allData.length} total records from old database\n`);

        // Step 3: Filter out records that already exist
        console.log('🔍 Filtering out existing records...');
        const newRecords = allData.filter(record => {
            const key = `${record.event_id}_${record.timestamp_gmt}`;
            return !existingKeys.has(key);
        });

        console.log(`✅ Found ${newRecords.length} new records to import\n`);

        if (newRecords.length === 0) {
            console.log('🎉 All data is already migrated! Nothing to do.');
            return;
        }

        // Step 4: Transform data (remove id and created_at)
        console.log('🔄 Preparing data for import...');
        const transformedData = newRecords.map(record => {
            const { id, created_at, ...rest } = record;
            return rest;
        });

        // Step 5: Import in batches
        console.log('📤 Importing new records...\n');
        const BATCH_SIZE = 100;
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
                // Continue with next batch instead of failing completely
                console.log(`   ⚠️  Skipping batch ${i + 1}, continuing with next batch...`);
                continue;
            }

            importedCount += batch.length;
            console.log(`   ✅ Batch ${i + 1}/${batches.length}: Imported ${batch.length} records (total: ${importedCount}/${transformedData.length})`);
        }

        console.log(`\n🎉 Migration complete! Imported ${importedCount} new records.`);

        // Step 6: Verify final count
        console.log('\n🔍 Verifying final count...');
        const { count, error: countError } = await newSupabase
            .from(TABLE_NAME)
            .select('*', { count: 'exact', head: true });

        if (countError) {
            console.error('❌ Error verifying count:', countError);
        } else {
            console.log(`✅ New database now contains ${count} total records`);
        }

    } catch (error) {
        console.error('\n❌ Migration failed:', error);
        process.exit(1);
    }
}

// Run migration
migrateRemainingData();
