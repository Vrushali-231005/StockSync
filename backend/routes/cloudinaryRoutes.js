import express from "express";
import upload from "../middlewares/upload.js";
import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Upload
 *   description: Upload images to Cloudinary
 */

/**
 * @swagger
 * /api/cloudinary:
 *   post:
 *     summary: Upload an image to Cloudinary
 *     tags: [Upload]
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Image file to upload
 *     responses:
 *       200:
 *         description: Image uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 url:
 *                   type: string
 *                   description: Secure URL of the uploaded image
 *       400:
 *         description: No file uploaded
 *       500:
 *         description: Cloudinary upload failed
 */
router.post("/", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const stream = cloudinary.uploader.upload_stream(
      { folder: "inventory" }, // optional folder in Cloudinary
      (error, result) => {
        if (error) return res.status(500).json({ message: "Cloudinary upload failed", error });
        res.status(200).json({ url: result.secure_url });
      }
    );

    // Pipe the buffer to upload_stream
    streamifier.createReadStream(req.file.buffer).pipe(stream);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to upload image", error: err.message });
  }
});

export default router;
