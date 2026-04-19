import {Suspense, lazy} from 'react';
import {ErrorBoundary} from '../components/ErrorBoundary';

const PropertiesApp = lazy(() => import('propertiesMfe/App'));

export function PropertiesPage() {
    return (
        <ErrorBoundary name="Properties">
            <Suspense fallback={<div className="animate-pulse bg-gray-100 rounded-xl h-64"/>}>
                <PropertiesApp/>
            </Suspense>
        </ErrorBoundary>
    );
}