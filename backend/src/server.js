//#imports
import app from './app.js';
import dotenv from 'dotenv';
dotenv.config({ path: './src/.env' });


//#Port
const PORT = process.env.PORT;

//#Start Server
app.listen(PORT, () => {
    console.log(` Server running on port http://localhost:${PORT}`);
});