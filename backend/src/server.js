//#imports
import app from './app.js';
import dotenv from 'dotenv';
dotenv.config({ path: './src/.env' });


//#Port
const PORT = process.env.PORT;

//#Inicia el servidor SOLO si no estamos en modo "test"
if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(` Server running on port http://localhost:${PORT}`);
    });
}
