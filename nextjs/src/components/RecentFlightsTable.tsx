"use client";
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { FlightData } from '@/lib/hooks/useFlightData';
import { format } from 'date-fns';

interface RecentFlightsTableProps {
  flights: FlightData[];
  limit?: number;
}

export function RecentFlightsTable({ flights, limit = 20 }: RecentFlightsTableProps) {
  const recentFlights = flights.slice(0, limit);

  const formatTimestamp = (timestamp: string) => {
    try {
      return format(new Date(timestamp), 'MMM dd, yyyy HH:mm:ss');
    } catch {
      return timestamp;
    }
  };

  const getBatteryColor = (battery: string | null) => {
    if (!battery) return 'text-gray-500';
    const batteryPercent = parseInt(battery.replace('%', ''));
    if (batteryPercent >= 70) return 'text-green-600';
    if (batteryPercent >= 30) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSeverityBadge = (severity: string | null) => {
    const severityLower = severity?.toLowerCase() || 'info';
    const colors: { [key: string]: string } = {
      error: 'bg-red-100 text-red-800',
      warning: 'bg-yellow-100 text-yellow-800',
      info: 'bg-blue-100 text-blue-800',
      success: 'bg-green-100 text-green-800',
    };
    const colorClass = colors[severityLower] || colors.info;

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
        {severity || 'INFO'}
      </span>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Flights</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Event
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Drone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Site
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Organization
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Automation
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Battery
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentFlights.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    No flight data available
                  </td>
                </tr>
              ) : (
                recentFlights.map((flight) => (
                  <tr key={flight.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatTimestamp(flight.timestamp_gmt)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="flex items-center gap-2">
                        {getSeverityBadge(flight.severity)}
                        <span className="max-w-xs truncate">{flight.message || '-'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {flight.drone || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {flight.site || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {flight.organization || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {flight.automation || '-'}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${getBatteryColor(flight.battery)}`}>
                      {flight.battery || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
