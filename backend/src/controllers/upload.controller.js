import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function uploadImage(request, reply) {
  const data = await request.file()

  if (!data) {
    return reply.status(400).send({ error: 'No se recibió ningún archivo' })
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  if (!allowedTypes.includes(data.mimetype)) {
    return reply.status(400).send({ error: 'Tipo de archivo no permitido' })
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'twitter-clone', resource_type: 'image' },
      (error, result) => {
        if (error) {
          reject(reply.status(500).send({ error: 'Error al subir la imagen' }))
        } else {
          resolve(reply.send({ url: result.secure_url }))
        }
      }
    )
    data.file.pipe(stream)
  })
}
