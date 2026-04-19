import 'dotenv/config';
import {createApp} from './server';

const PORT = process.env.PORT ?? 3001;

const app = createApp();

app.listen(PORT, () => {
    console.log(`[mobile-api-gateway] running on port ${PORT}`);
});