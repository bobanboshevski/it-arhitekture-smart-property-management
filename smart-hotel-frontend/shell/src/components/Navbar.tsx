import {NavLink} from 'react-router-dom';
import {Building2, CalendarDays, TrendingUp, Hotel} from 'lucide-react';

const links = [
    {to: '/properties', label: 'Properties', icon: Building2},
    {to: '/bookings', label: 'Bookings', icon: CalendarDays},
    {to: '/pricing', label: 'Pricing', icon: TrendingUp},
];

export function Navbar() {
    return (
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Hotel size={20} className="text-brand-600"/>
                    <span className="font-semibold text-gray-900">Smart Hotel</span>
                </div>
                <div className="flex items-center gap-1">
                    {links.map(({to, label, icon: Icon}) => (
                        <NavLink
                            key={to}
                            to={to}
                            className={({isActive}) =>
                                `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    isActive
                                        ? 'bg-brand-50 text-brand-700'
                                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                }`
                            }
                        >
                            <Icon size={15}/>
                            {label}
                        </NavLink>
                    ))}
                </div>
            </div>
        </nav>
    );
}