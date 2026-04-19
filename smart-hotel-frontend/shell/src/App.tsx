import {BrowserRouter, Routes, Route, Navigate} from 'react-router-dom';
import {Layout} from './components/Layout';
import {PropertiesPage} from './pages/PropertiesPage';
import {BookingsPage} from './pages/BookingsPage';
import {PricingPage} from './pages/PricingPage';
import './index.css';

export default function App() {
    return (
        <BrowserRouter>
            <Layout>
                <Routes>
                    <Route path="/" element={<Navigate to="/properties" replace/>}/>
                    <Route path="/properties/*" element={<PropertiesPage/>}/>
                    <Route path="/bookings/*" element={<BookingsPage/>}/>
                    <Route path="/pricing/*" element={<PricingPage/>}/>
                </Routes>
            </Layout>
        </BrowserRouter>
    );
}