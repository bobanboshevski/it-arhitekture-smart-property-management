import {Suspense, lazy} from 'react';
import {ErrorBoundary} from '../components/ErrorBoundary';

const BookingsApp = lazy(() => import('bookingsMfe/App'));

export function BookingsPage() {
    return (
        <ErrorBoundary name="Bookings">
            <Suspense fallback={<div className="animate-pulse bg-gray-100 rounded-xl h-64"/>}>
                <BookingsApp/>
            </Suspense>
        </ErrorBoundary>
    );
}