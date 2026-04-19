import {useEffect, useState} from 'react';
import {ArrowLeft, TrendingUp} from 'lucide-react';
import {useDashboard} from '../../hooks/useProperties';
import type {Property} from '../../types';

interface Props {
    property: Property;
    onBack: () => void;
}

const MONTHS = [
    {value: '1', label: 'Jan'}, {value: '2', label: 'Feb'},
    {value: '3', label: 'Mar'}, {value: '4', label: 'Apr'},
    {value: '5', label: 'May'}, {value: '6', label: 'Jun'},
    {value: '7', label: 'Jul'}, {value: '8', label: 'Aug'},
    {value: '9', label: 'Sep'}, {value: '10', label: 'Oct'},
    {value: '11', label: 'Nov'}, {value: '12', label: 'Dec'},
];

export function PropertyDashboard({property, onBack}: Props) {
    const {dashboard, loading, error, fetch} = useDashboard();
    const now = new Date();
    const [month, setMonth] = useState(String(now.getMonth() + 1));
    const [year, setYear] = useState(String(now.getFullYear()));

    useEffect(() => {
        fetch(property.id, month, year);
    }, [fetch, property.id, month, year]);

    return (
        <div>
            <div className="flex items-center gap-3 mb-6">
                <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <ArrowLeft size={18}/>
                </button>
                <div>
                    <h2 className="text-lg font-semibold text-gray-900">{property.name} — Dashboard</h2>
                    <p className="text-sm text-gray-500">{property.location}</p>
                </div>
            </div>

            <div className="flex gap-3 mb-6">
                <select
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                >
                    {MONTHS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
                <input
                    type="number"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-24 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
                    {error}
                </div>
            )}

            {loading && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {[1, 2, 3, 4].map(i => <div key={i} className="bg-gray-100 rounded-xl h-20 animate-pulse"/>)}
                </div>
            )}

            {dashboard && (
                <>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        {[
                            {label: 'Total revenue', value: `€${dashboard.analytics.totalRevenue.toFixed(2)}`},
                            {label: 'Total bookings', value: String(dashboard.analytics.totalBookings)},
                            {label: 'Avg occupancy', value: `${dashboard.analytics.averageOccupancyRate.toFixed(1)}%`},
                            {label: 'Avg ADR', value: `€${dashboard.analytics.averageAdr.toFixed(2)}`},
                        ].map((stat) => (
                            <div key={stat.label} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                                <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
                                <p className="text-xl font-semibold text-gray-900">{stat.value}</p>
                            </div>
                        ))}
                    </div>

                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                            <TrendingUp size={16} className="text-brand-600"/>
                            <h3 className="font-medium text-gray-900 text-sm">Per room breakdown</h3>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {dashboard.rooms.map((room) => (
                                <div key={room.roomId}
                                     className="px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{room.name}</p>
                                        <p className="text-xs text-gray-500">{room.bookingsCount} bookings</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-semibold text-gray-900">€{room.revenue.toFixed(2)}</p>
                                        <p className="text-xs text-gray-500">{room.occupancyRate.toFixed(1)}%
                                            occupancy</p>
                                    </div>
                                </div>
                            ))}
                            {dashboard.rooms.length === 0 && (
                                <div className="px-5 py-8 text-center text-sm text-gray-400">
                                    No data for this period
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}