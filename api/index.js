// C:\Users\sofia\OneDrive\Escritorio\dys-fullstack.v1\backend\functions\index.js

import express from 'express';
import { v2 as cloudinary } from 'cloudinary';
import cors from 'cors';
import functions from 'firebase-functions'; // ¡IMPORTANTE! Importar firebase-functions

// Eliminar: import dotenv from 'dotenv';
// Eliminar: dotenv.config();

const app = express();
// Eliminar: const PORT = process.env.PORT || 5000;

// Configurar Cloudinary usando las variables de entorno de Firebase Functions
cloudinary.config({
  cloud_name: functions.config().cloudinary.cloud_name, // Acceso seguro a las variables de Firebase
  api_key: functions.config().cloudinary.api_key,
  api_secret: functions.config().cloudinary.api_secret,
});

// Middlewares
// En producción, es recomendable restringir los orígenes de CORS
app.use(cors());
app.use(express.json());

// Endpoint para obtener imágenes de una carpeta específica de Cloudinary
app.get('/api/images', async (req, res) => {
  const { cursor, folder } = req.query; // Para paginación y folder

  try {
    const result = await cloudinary.api.resources({
      type: 'upload',
      prefix: folder || 'dysconstructora',
      max_results: 8,
      next_cursor: cursor,
      context: true, // <-- ¡AÑADIDO! Para obtener los metadatos de contexto
    });

    const images = result.resources.map(resource => ({
      id: resource.public_id,
      src: resource.secure_url,
      // Recuperar el alt del contexto si existe, si no, usar filename, si no, el default.
      alt: resource.context?.custom?.description || resource.filename || 'Imagen de proyecto',
    }));

    res.json({
      images,
      next_cursor: result.next_cursor,
      hasMore: !!result.next_cursor,
    });

  } catch (error) {
    console.error('Error fetching images from Cloudinary:', error);
    res.status(500).json({ message: 'Error fetching images', error: error.message });
  }
});

// Eliminar: app.listen(PORT, ...)
// ¡IMPORTANTE! Exporta tu app Express como una función HTTP de Firebase.
// Esto la hace accesible en la URL de Firebase Functions.
export const api = functions.https.onRequest(app);