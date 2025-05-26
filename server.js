// my-project/backend/server.js
import express from 'express';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import cors from 'cors'; // Para permitir solicitudes desde tu frontend

dotenv.config(); // Carga las variables de entorno desde .env

const app = express();
const PORT = process.env.PORT || 5000;

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

// Middlewares
app.use(cors()); // Permite todas las solicitudes de origen cruzado (ajustar en producción)
app.use(express.json());

// Endpoint para obtener imágenes de una carpeta específica de Cloudinary
app.get('/api/images', async (req, res) => {
  const { cursor, folder } = req.query; // Para paginación y folder

  try {
    // Listar recursos de Cloudinary en una carpeta específica
    // 'max_results' es para la paginación. 'next_cursor' para la siguiente página.
    // 'expression' para filtrar por carpeta
    const result = await cloudinary.api.resources({
      type: 'upload',
      prefix: folder || 'dysconstructora', 
      max_results: 8, // Cantidad de imágenes por página
      next_cursor: cursor, // Para paginación
      // transformation: [{ width: 400, height: 300, crop: "fill" }] // Opcional: Aplicar transformación en el servidor
    });

    const images = result.resources.map(resource => ({
      id: resource.public_id,
      src: resource.secure_url, // URL segura de Cloudinary
      alt: resource.filename || 'Imagen de proyecto', // Puedes obtener el nombre del archivo o generar una descripción
      // Si quieres aplicar transformaciones aquí:
      // src: cloudinary.url(resource.public_id, {
      //   width: 400,
      //   height: 300,
      //   crop: "fill",
      //   quality: "auto",
      //   fetch_format: "auto"
      // }),
    }));

    res.json({
      images,
      next_cursor: result.next_cursor, // Envía el cursor para la siguiente solicitud
      hasMore: !!result.next_cursor,
    });

  } catch (error) {
    console.error('Error fetching images from Cloudinary:', error);
    res.status(500).json({ message: 'Error fetching images', error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});