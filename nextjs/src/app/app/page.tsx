"use client";
import React, { useState } from 'react';
import { useFlightData } from '@/lib/hooks/useFlightData';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Plane, Building2, MapPin, Gauge, Calendar, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FlightCharts } from '@/components/FlightCharts';
import { RecentFlightsTable } from '@/components/RecentFlightsTable';

export default function DashboardPage() {
    const [startDate, setStartDate] = useState<Date | undefined>(undefined);
    const [endDate, setEndDate] = useState<Date | undefined>(undefined);
    const [autoRefresh, setAutoRefresh] = useState(true);

    const { flights, stats, loading, error, refetch, lastUpdate } = useFlightData(startDate, endDate, autoRefresh);

    const handleClearFilters = () => {
        setStartDate(undefined);
        setEndDate(undefined);
    };

    const handleToday = () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const endOfToday = new Date();
        endOfToday.setHours(23, 59, 59, 999);
        setStartDate(today);
        setEndDate(endOfToday);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="flex flex-col items-center gap-3">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                    <p className="text-gray-600">Loading flight data...</p>
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
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Flight Dashboard</h1>
                    <p className="text-gray-500 mt-1">Monitor drone flight activity and analytics</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="autoRefresh"
                            checked={autoRefresh}
                            onChange={(e) => setAutoRefresh(e.target.checked)}
                            className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                        />
                        <label htmlFor="autoRefresh" className="text-sm text-gray-700">
                            Auto-refresh (60s)
                        </label>
                    </div>
                    <div className="text-xs text-gray-500">
                        Last update: {lastUpdate.toLocaleTimeString()}
                    </div>
                    <Button onClick={refetch} variant="outline" size="sm">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Date Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-wrap items-end gap-4">
                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Start Date
                            </label>
                            <input
                                type="date"
                                value={startDate ? startDate.toISOString().split('T')[0] : ''}
                                onChange={(e) => {
                                    if (e.target.value) {
                                        const date = new Date(e.target.value);
                                        date.setHours(0, 0, 0, 0);
                                        setStartDate(date);
                                    } else {
                                        setStartDate(undefined);
                                    }
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            />
                        </div>
                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                End Date
                            </label>
                            <input
                                type="date"
                                value={endDate ? endDate.toISOString().split('T')[0] : ''}
                                onChange={(e) => {
                                    if (e.target.value) {
                                        const date = new Date(e.target.value);
                                        date.setHours(23, 59, 59, 999);
                                        setEndDate(date);
                                    } else {
                                        setEndDate(undefined);
                                    }
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button onClick={handleToday} variant="outline">
                                <Calendar className="h-4 w-4 mr-2" />
                                Today
                            </Button>
                            <Button onClick={handleClearFilters} variant="outline">
                                Clear Filters
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {/* Total Takeoffs */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Takeoffs</CardTitle>
                        <Plane className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-blue-600">{stats.totalTakeoffs}</div>
                        <p className="text-xs text-gray-500 mt-1">Successful drone launches</p>
                    </CardContent>
                </Card>

                {/* Total Organizations */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Organizations</CardTitle>
                        <Building2 className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-green-600">{stats.totalOrganizations}</div>
                        <p className="text-xs text-gray-500 mt-1">Active organizations</p>
                    </CardContent>
                </Card>

                {/* Total Sites */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Sites</CardTitle>
                        <MapPin className="h-4 w-4 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-purple-600">{stats.totalSites}</div>
                        <p className="text-xs text-gray-500 mt-1">Flight locations</p>
                    </CardContent>
                </Card>

                {/* Total Drones */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Drones</CardTitle>
                        <Gauge className="h-4 w-4 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-orange-600">{stats.totalDrones}</div>
                        <p className="text-xs text-gray-500 mt-1">Active drones</p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts */}
            <FlightCharts flights={flights} />

            {/* Recent Flights Table */}
            <RecentFlightsTable flights={flights} limit={20} />
        </div>
    );
}