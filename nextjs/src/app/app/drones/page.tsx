"use client";
import React, { useState } from 'react';
import { useFlightData, FlightData } from '@/lib/hooks/useFlightData';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Gauge, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface DroneStats {
  drone: string;
  organization: string | null;
  totalFlights: number;
  flightHours: number;
  batteryCycles: number;
  avgBatteryPerFlight: number;
  lastFlight: string;
}

export default function DronesPage() {
  const [organizationFilter, setOrganizationFilter] = useState<string>('');
  const { flights, loading, error, refetch } = useFlightData();

  // Helper: Parse battery percentage
  const parseBattery = (battery: string | null): number | null => {
    if (!battery) return null;
    const batteryStr = String(battery).trim().replace('%', '');
    const batteryNum = parseFloat(batteryStr);
    if (batteryNum >= 0 && batteryNum <= 1) return batteryNum * 100;
    if (batteryNum > 1 && batteryNum <= 100) return batteryNum;
    return null;
  };

  // Helper: Calculate flight hours from matched takeoff/landing pairs
  const calculateFlightHours = (droneFlights: FlightData[]): number => {
    let totalMinutes = 0;
    const sorted = [...droneFlights].sort((a, b) =>
      new Date(a.timestamp_gmt).getTime() - new Date(b.timestamp_gmt).getTime()
    );

    for (let i = 0; i < sorted.length; i++) {
      const flight = sorted[i];
      const automation = flight.automation?.trim() || '';
      const isTakeoff = automation === 'Take-Off' || automation === 'TakeOff';

      if (isTakeoff) {
        // Find next landing
        for (let j = i + 1; j < sorted.length; j++) {
          const nextFlight = sorted[j];
          const nextAuto = nextFlight.automation?.trim() || '';
          if (nextAuto === 'Landing') {
            const takeoffTime = new Date(flight.timestamp_gmt).getTime();
            const landingTime = new Date(nextFlight.timestamp_gmt).getTime();
            const durationMs = landingTime - takeoffTime;
            if (durationMs > 0) {
              totalMinutes += durationMs / (1000 * 60);
            }
            break;
          }
        }
      }
    }
    return totalMinutes;
  };

  // Helper: Calculate battery cycles (every 75% = 1 cycle)
  const calculateBatteryCycles = (droneFlights: FlightData[]): number => {
    let totalBatteryUsed = 0;
    const sorted = [...droneFlights].sort((a, b) =>
      new Date(a.timestamp_gmt).getTime() - new Date(b.timestamp_gmt).getTime()
    );

    for (let i = 0; i < sorted.length; i++) {
      const flight = sorted[i];
      const automation = flight.automation?.trim() || '';
      const isTakeoff = automation === 'Take-Off' || automation === 'TakeOff';

      if (isTakeoff) {
        // Find next landing
        for (let j = i + 1; j < sorted.length; j++) {
          const nextFlight = sorted[j];
          const nextAuto = nextFlight.automation?.trim() || '';
          if (nextAuto === 'Landing') {
            const takeoffBattery = parseBattery(flight.battery);
            const landingBattery = parseBattery(nextFlight.battery);
            if (takeoffBattery !== null && landingBattery !== null) {
              const batteryUsed = takeoffBattery - landingBattery;
              if (batteryUsed > 0 && batteryUsed <= 100) {
                totalBatteryUsed += batteryUsed;
              }
            }
            break;
          }
        }
      }
    }
    return totalBatteryUsed / 75; // Every 75% = 1 cycle
  };

  // Calculate drone statistics
  const getDroneStats = (): DroneStats[] => {
    const droneMap: { [key: string]: FlightData[] } = {};

    // Group flights by drone
    flights.forEach(flight => {
      if (flight.drone) {
        if (!droneMap[flight.drone]) {
          droneMap[flight.drone] = [];
        }
        droneMap[flight.drone].push(flight);
      }
    });

    // Calculate stats for each drone
    return Object.entries(droneMap).map(([drone, droneFlights]) => {
      // Count takeoffs only
      const takeoffs = droneFlights.filter(f => {
        if (!f || !f.automation) return false;
        const automation = f.automation.trim();
        return automation === 'Take-Off' || automation === 'TakeOff';
      });

      // Calculate REAL flight hours from matched pairs
      const flightMinutes = calculateFlightHours(droneFlights);
      const flightHours = flightMinutes / 60;

      // Calculate battery cycles (75% = 1 cycle)
      const batteryCycles = calculateBatteryCycles(droneFlights);

      // Calculate average battery from takeoffs only
      const batteriesWithValues = takeoffs
        .map(f => parseBattery(f.battery))
        .filter(b => b !== null) as number[];
      const avgBattery = batteriesWithValues.length > 0
        ? batteriesWithValues.reduce((a, b) => a + b, 0) / batteriesWithValues.length
        : 0;

      // Get last flight timestamp
      const lastFlight = droneFlights.reduce((latest, flight) => {
        return new Date(flight.timestamp_gmt) > new Date(latest.timestamp_gmt) ? flight : latest;
      });

      return {
        drone,
        organization: droneFlights[0].organization,
        totalFlights: takeoffs.length, // Count takeoffs only
        flightHours,
        batteryCycles,
        avgBatteryPerFlight: Math.round(avgBattery),
        lastFlight: lastFlight.timestamp_gmt,
      };
    }).sort((a, b) => b.totalFlights - a.totalFlights);
  };

  const droneStats = getDroneStats();

  // Get unique organizations for filter
  const organizations = Array.from(new Set(flights.map(f => f.organization).filter(Boolean))) as string[];

  // Filter drone stats by organization
  const filteredDroneStats = organizationFilter
    ? droneStats.filter(d => d.organization === organizationFilter)
    : droneStats;

  // Prepare data for charts
  const flightHoursData = filteredDroneStats.slice(0, 10).map(d => ({
    name: d.drone,
    hours: d.flightHours,
  }));

  const batteryCyclesData = filteredDroneStats.slice(0, 10).map(d => ({
    name: d.drone,
    cycles: d.batteryCycles,
  }));

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };

  // Format flight hours as "Xh Ym"
  const formatFlightHours = (totalHours: number): string => {
    if (!totalHours || totalHours <= 0) return '0h 0m';
    const totalMinutes = totalHours * 60;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.floor(totalMinutes % 60);
    return `${hours}h ${minutes}m`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="text-gray-600">Loading drone analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-semibold mb-2">Error Loading Data</h3>
          <p className="text-red-600">{error}</p>
          <Button onClick={refetch} className="mt-4" variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Drone Analytics</h1>
          <p className="text-gray-500 mt-1">Performance metrics and flight hours</p>
        </div>
        <Button onClick={refetch} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Organization Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">
              Filter by Organization:
            </label>
            <select
              value={organizationFilter}
              onChange={(e) => setOrganizationFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">All Organizations</option>
              {organizations.map(org => (
                <option key={org} value={org}>{org}</option>
              ))}
            </select>
            <span className="text-sm text-gray-500">
              {filteredDroneStats.length} drone{filteredDroneStats.length !== 1 ? 's' : ''}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Drone Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gauge className="h-5 w-5" />
            Drone Performance Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Drone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Organization
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Flights
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Flight Hours
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Battery Cycles
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avg Battery
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Flight
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDroneStats.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                      No drone data available
                    </td>
                  </tr>
                ) : (
                  filteredDroneStats.map((drone) => (
                    <tr key={drone.drone} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {drone.drone}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {drone.organization || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {drone.totalFlights}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatFlightHours(drone.flightHours)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <strong>{drone.batteryCycles.toFixed(1)}</strong> cycles
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        {drone.avgBatteryPerFlight}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(drone.lastFlight)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Flight Hours Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Flight Hours by Drone</CardTitle>
          </CardHeader>
          <CardContent>
            {flightHoursData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={flightHoursData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="hours" fill="#3b82f6" name="Flight Hours" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-gray-500 py-8">No flight hours data available</p>
            )}
          </CardContent>
        </Card>

        {/* Battery Cycles Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Battery Cycles by Drone</CardTitle>
          </CardHeader>
          <CardContent>
            {batteryCyclesData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={batteryCyclesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="cycles" fill="#10b981" name="Battery Cycles" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-gray-500 py-8">No battery cycles data available</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
