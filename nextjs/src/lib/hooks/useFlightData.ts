import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export interface FlightData {
  id: number;
  created_at: string;
  event_id: string | null;
  message: string | null;
  severity: string | null;
  drone: string | null;
  dock: string | null;
  coordinates: string | null;
  latitude: number | null;
  longitude: number | null;
  altitude: string | null;
  site: string | null;
  organization: string | null;
  automation: string | null;
  battery: string | null;
  flight_details: string | null;
  timestamp_gmt: string;
}

export interface FlightStats {
  totalTakeoffs: number;
  totalOrganizations: number;
  totalSites: number;
  totalDrones: number;
}

export function useFlightData(startDate?: Date, endDate?: Date, autoRefresh: boolean = false) {
  const [flights, setFlights] = useState<FlightData[]>([]);
  const [stats, setStats] = useState<FlightStats>({
    totalTakeoffs: 0,
    totalOrganizations: 0,
    totalSites: 0,
    totalDrones: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const fetchFlights = async () => {
    try {
      setLoading(true);
      setError(null);

      const supabase = createClient(supabaseUrl, supabaseKey);

      // Fetch all data using pagination (Supabase default limit is 1000)
      let allData: FlightData[] = [];
      let page = 0;
      const PAGE_SIZE = 1000;
      let hasMore = true;

      while (hasMore) {
        const from = page * PAGE_SIZE;
        const to = from + PAGE_SIZE - 1;

        let query = supabase
          .from('drone_flights')
          .select('*')
          .order('timestamp_gmt', { ascending: false })
          .range(from, to);

        // Apply date filters if provided
        if (startDate) {
          query = query.gte('timestamp_gmt', startDate.toISOString());
        }
        if (endDate) {
          // Add 1 day to include the end date
          const endDatePlusOne = new Date(endDate);
          endDatePlusOne.setDate(endDatePlusOne.getDate() + 1);
          query = query.lt('timestamp_gmt', endDatePlusOne.toISOString());
        }

        const { data, error: fetchError } = await query;

        if (fetchError) throw fetchError;

        if (data && data.length > 0) {
          allData = allData.concat(data);
          if (data.length < PAGE_SIZE) {
            hasMore = false;
          }
          page++;
        } else {
          hasMore = false;
        }
      }

      console.log(`✅ Fetched ${allData.length} total records from Supabase`);
      setFlights(allData);

      // Calculate stats using ALL data
      const uniqueOrganizations = new Set(
        allData.filter(f => f.organization).map(f => f.organization)
      );
      const uniqueSites = new Set(
        allData.filter(f => f.site).map(f => f.site)
      );
      const uniqueDrones = new Set(
        allData.filter(f => f.drone).map(f => f.drone)
      );

      // Count only "Take-Off" events for totalTakeoffs
      // Use exact matching like the old implementation
      const takeoffs = allData.filter(f => {
        if (!f || !f.automation) return false;
        const automation = f.automation.trim();
        return automation === 'Take-Off' || automation === 'TakeOff';
      }).length;

      setStats({
        totalTakeoffs: takeoffs,
        totalOrganizations: uniqueOrganizations.size,
        totalSites: uniqueSites.size,
        totalDrones: uniqueDrones.size,
      });

    } catch (err: any) {
      setError(err.message || 'Failed to fetch flight data');
      console.error('Error fetching flights:', err);
    } finally {
      setLoading(false);
      setLastUpdate(new Date());
    }
  };

  useEffect(() => {
    fetchFlights();
  }, [startDate, endDate]);

  // Auto-refresh every 60 seconds if enabled
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchFlights();
    }, 60000); // 60 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, startDate, endDate]);

  return { flights, stats, loading, error, refetch: fetchFlights, lastUpdate };
}
