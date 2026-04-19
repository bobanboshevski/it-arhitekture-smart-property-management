import {TrendingUp, TrendingDown, Minus} from 'lucide-react';
import type {RoomPrice} from '../types';

interface Props {
    price: RoomPrice;
}

export function PriceCard({price}: Props) {
    const diff = price.adjustedPrice - price.basePrice;
    const pct = ((diff / price.basePrice) * 100).toFixed(1);
    const up = diff > 0;
    const flat = diff === 0;

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
            <p className="text-xs text-gray-400 font-mono mb-4">{price.roomId}</p>

            <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-500 mb-1">Base price</p>
                    <p className="text-2xl font-semibold text-gray-900">€{price.basePrice.toFixed(2)}</p>
                    <p className="text-xs text-gray-400 mt-0.5">per night</p>
                </div>
                <div className={`rounded-xl p-4 ${up ? 'bg-amber-50' : flat ? 'bg-gray-50' : 'bg-green-50'}`}>
                    <p className="text-xs text-gray-500 mb-1">Dynamic price</p>
                    <p className={`text-2xl font-semibold ${up ? 'text-amber-700' : flat ? 'text-gray-900' : 'text-green-700'}`}>
                        €{price.adjustedPrice.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">per night</p>
                </div>
            </div>

            <div className={`flex items-center gap-2 text-sm font-medium rounded-lg px-4 py-3
        ${up ? 'bg-amber-50 text-amber-700' : flat ? 'bg-gray-50 text-gray-600' : 'bg-green-50 text-green-700'}`}
            >
                {up ? <TrendingUp size={16}/> : flat ? <Minus size={16}/> : <TrendingDown size={16}/>}
                <span>
          {flat ? 'No adjustment' : `${up ? '+' : ''}${pct}% vs base (${up ? '+' : ''}€${diff.toFixed(2)})`}
        </span>
            </div>
        </div>
    );
}