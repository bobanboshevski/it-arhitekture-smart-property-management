import {Suspense, lazy} from 'react';
import {ErrorBoundary} from '../components/ErrorBoundary';

const PricingApp = lazy(() => import('pricingMfe/App'));

export function PricingPage() {
    return (
        <ErrorBoundary name="Pricing">
            <Suspense fallback={<div className="animate-pulse bg-gray-100 rounded-xl h-64"/>}>
                <PricingApp/>
            </Suspense>
        </ErrorBoundary>
    );
}