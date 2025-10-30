//#imports
import mongoose from 'mongoose';
import dotenv from 'dotenv';

//#configuracion de .env
dotenv.config({ path: './src/.env' });

//#conexion a la base de datos
export const connectDB = async () => {
    
    //#determina qué DB usar (Test o Dev)
    //#usa mongo URI de .env según el entorno
    const dbUri = process.env.NODE_ENV === 'test' 
        ? process.env.MONGO_URI_TEST 
        : process.env.MONGO_URI;
    //#verifica que la URI esté definida
    if (!dbUri) {
        console.error("Error: MONGO_URI (o MONGO_URI_TEST) no está definida en .env");
        process.exit(1);
    }
    //#intenta conectar
    try {
        const conn = await mongoose.connect(dbUri);
        // Solo mostrar logs si no estamos en test (para limpiar la salida de Jest)
        if (process.env.NODE_ENV !== 'test') {
            console.log(`✅ MongoDB conectado: ${conn.connection.host}`);
        }
    } catch (error) {
        console.error(`Error al conectar a MongoDB: ${error.message}`);
        process.exit(1);
    }
};
