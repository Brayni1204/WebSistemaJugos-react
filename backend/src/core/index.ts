import * as dotenv from 'dotenv';
dotenv.config(); // Ensure env vars are loaded first

process.on('unhandledRejection', (reason: any, promise) => {
  console.error('UNHANDLED REJECTION:', reason);
  // Optional: exit the process if desired, though often logging is enough for debugging
  // process.exit(1); 
});

process.on('uncaughtException', (error: Error) => {
  console.error('UNCAUGHT EXCEPTION:', error);
  // Optional: exit the process
  // process.exit(1);
});

import app from './app';

const PORT = process.env.PORT || 5000;

async function main() {
    try {
        console.log('⏳ Starting server...');

        const server = app.listen(PORT, () => {
            console.log(`🚀 Servidor escuchando en el puerto ${PORT}`);
            console.log(`🌐 API disponible en http://localhost:${PORT}`);
        });

        server.on('error', (error: any) => {
            if (error.code === 'EADDRINUSE') {
                console.error(`❌ Error: Port ${PORT} is already in use.`);
            } else {
                console.error('❌ Express server error:', error);
            }
            process.exit(1);
        });

    } catch (error) {
        console.error('❌ Fatal error during application startup:', error);
        process.exit(1);
    }
}

main();

