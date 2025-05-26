// C:\Users\sofia\OneDrive\Escritorio\dys-fullstack.v1\backend\api\index.js

import express from 'express';
import { v2 as cloudinary } from 'cloudinary';
import cors from 'cors';



// ELIMINAR: import dotenv from 'dotenv';
// ELIMINAR: dotenv.config(); // Vercel maneja las variables de entorno en su plataforma

const app = express();
// ELIMINAR: const PORT = process.env.PORT || 5000;

// Configurar Cloudinary usando las variables de entorno de Vercel
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME, // Vercel inyecta estas variables directamente en process.env
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

// Middlewares
app.use(cors({
  origin: ['https://dysconstructora.com']
}));

app.use(express.json());

// Endpoint para obtener imágenes de una carpeta específica de Cloudinary
app.get('/api/images', async (req, res) => {
  const { cursor, folder } = req.query;

  try {
    const result = await cloudinary.api.resources({
      type: 'upload',
      prefix: folder || 'dysconstructora',
      max_results: 8,
      next_cursor: cursor,
      context: true, // Asegura que se recuperen los metadatos personalizados
    });

    const images = result.resources.map(resource => ({
      id: resource.public_id,
      src: resource.secure_url,
      // Accede a la descripción del contexto si existe, si no, usa el filename o un fallback
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

// ELIMINAR: app.listen(PORT, () => { console.log(`Server running on port ${PORT}`); });

// ¡IMPORTANTE! Exporta la aplicación Express para Vercel
export default app;