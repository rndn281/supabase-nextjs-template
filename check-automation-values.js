/**
 * Check unique automation field values
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://nidmjlkxptmplwjyuwqd.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pZG1qbGt4cHRtcGx3anl1d3FkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzMjc4MDksImV4cCI6MjA3ODkwMzgwOX0.keBrB-S4YIntJ7KgKsimLF9uV8qJN0d8dGbW6Y4xc9Q';

async function checkAutomationValues() {
    console.log('🔍 Checking automation field values...\n');

    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

    try {
        // Fetch all records
        let allData = [];
        let page = 0;
        const PAGE_SIZE = 1000;
        let hasMore = true;

        while (hasMore) {
            const from = page * PAGE_SIZE;
            const to = from + PAGE_SIZE - 1;

            const { data, error } = await supabase
                .from('drone_flights')
                .select('automation')
                .range(from, to);

            if (error) {
                console.error('❌ Error:', error);
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

        const data = allData;

        console.log(`\n📊 Total records fetched: ${data.length}\n`);

        // Get unique automation values
        const automationCounts = {};

        data.forEach(record => {
            const value = record.automation || 'NULL';
            automationCounts[value] = (automationCounts[value] || 0) + 1;
        });

        // Sort by count
        const sorted = Object.entries(automationCounts)
            .sort((a, b) => b[1] - a[1]);

        console.log('📋 Unique automation values (sorted by count):\n');
        console.log('Value'.padEnd(40) + 'Count');
        console.log('─'.repeat(50));

        sorted.forEach(([value, count]) => {
            console.log(value.padEnd(40) + count);
        });

        console.log('\n✅ Analysis complete!');

    } catch (error) {
        console.error('❌ Failed:', error);
        process.exit(1);
    }
}

checkAutomationValues();
