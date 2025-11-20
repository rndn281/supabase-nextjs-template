"use client";
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { FlightData } from '@/lib/hooks/useFlightData';

interface FlightChartsProps {
  flights: FlightData[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#14b8a6', '#a855f7', '#22c55e'];

export function FlightCharts({ flights }: FlightChartsProps) {
  // Process data for Takeoffs Per Hour chart
  const getTakeoffsPerHour = () => {
    const hourDroneCounts: { [key: string]: { [drone: string]: number } } = {};
    const dronesSet = new Set<string>();

    flights
      .filter(f => {
        if (!f || !f.automation) return false;
        const automation = f.automation.trim();
        return automation === 'Take-Off' || automation === 'TakeOff';
      })
      .forEach(flight => {
        const date = new Date(flight.timestamp_gmt);
        const hour = date.getHours();
        const hourLabel = `${hour.toString().padStart(2, '0')}:00`;
        const drone = flight.drone || 'Unknown';

        if (!hourDroneCounts[hourLabel]) {
          hourDroneCounts[hourLabel] = {};
        }

        hourDroneCounts[hourLabel][drone] = (hourDroneCounts[hourLabel][drone] || 0) + 1;
        dronesSet.add(drone);
      });

    const data = Object.entries(hourDroneCounts)
      .map(([hour, drones]) => ({ hour, ...drones }))
      .sort((a, b) => a.hour.localeCompare(b.hour));

    return {
      data,
      drones: Array.from(dronesSet).sort()
    };
  };

  // Process data for Takeoffs by Organization chart
  const getTakeoffsByOrganization = () => {
    const orgCounts: { [key: string]: number } = {};

    flights
      .filter(f =>
        f.organization &&
        (f.automation?.toLowerCase().includes('take-off') ||
        f.automation?.toLowerCase().includes('takeoff'))
      )
      .forEach(flight => {
        const org = flight.organization!;
        orgCounts[org] = (orgCounts[org] || 0) + 1;
      });

    return Object.entries(orgCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8); // Top 8 organizations
  };

  // Process data for Takeoffs by Site chart
  const getTakeoffsBySite = () => {
    const siteCounts: { [key: string]: number } = {};

    flights
      .filter(f =>
        f.site &&
        (f.automation?.toLowerCase().includes('take-off') ||
        f.automation?.toLowerCase().includes('takeoff'))
      )
      .forEach(flight => {
        const site = flight.site!;
        siteCounts[site] = (siteCounts[site] || 0) + 1;
      });

    return Object.entries(siteCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8); // Top 8 sites
  };

  // Process data for Takeoffs by Drone chart
  const getTakeoffsByDrone = () => {
    const droneCounts: { [key: string]: number } = {};

    flights
      .filter(f =>
        f.drone &&
        (f.automation?.toLowerCase().includes('take-off') ||
        f.automation?.toLowerCase().includes('takeoff'))
      )
      .forEach(flight => {
        const drone = flight.drone!;
        droneCounts[drone] = (droneCounts[drone] || 0) + 1;
      });

    return Object.entries(droneCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8); // Top 8 drones
  };

  const { data: hourlyData, drones: hourlyDrones } = getTakeoffsPerHour();
  const organizationData = getTakeoffsByOrganization();
  const siteData = getTakeoffsBySite();
  const droneData = getTakeoffsByDrone();

  return (
    <div className="space-y-6">
      {/* Takeoffs Per Hour (Stacked by Drone) */}
      <Card>
        <CardHeader>
          <CardTitle>Takeoffs Per Hour by Drone</CardTitle>
        </CardHeader>
        <CardContent>
          {hourlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Legend />
                {hourlyDrones.map((drone, index) => (
                  <Bar
                    key={drone}
                    dataKey={drone}
                    stackId="a"
                    fill={COLORS[index % COLORS.length]}
                    name={drone}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-gray-500 py-8">No takeoff data available</p>
          )}
        </CardContent>
      </Card>

      {/* Grid for Organization, Site, and Drone charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Takeoffs by Organization */}
        <Card>
          <CardHeader>
            <CardTitle>Takeoffs by Organization</CardTitle>
          </CardHeader>
          <CardContent>
            {organizationData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={organizationData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {organizationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-gray-500 py-8">No organization data available</p>
            )}
          </CardContent>
        </Card>

        {/* Takeoffs by Site */}
        <Card>
          <CardHeader>
            <CardTitle>Takeoffs by Site</CardTitle>
          </CardHeader>
          <CardContent>
            {siteData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={siteData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#10b981" name="Takeoffs" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-gray-500 py-8">No site data available</p>
            )}
          </CardContent>
        </Card>

        {/* Takeoffs by Drone */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Takeoffs by Drone</CardTitle>
          </CardHeader>
          <CardContent>
            {droneData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={droneData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#f59e0b" name="Takeoffs" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-gray-500 py-8">No drone data available</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
