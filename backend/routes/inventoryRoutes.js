// backend/routes/inventoryRoutes.js
import express from "express";
import {
  getAllInventory,
  addInventory,
  editInventory,
  deleteInventory,
} from "../controllers/inventoryController.js";
import upload from "../middlewares/upload.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Inventory
 *   description: Inventory management routes
 */

/**
 * @swagger
 * /api/inventory:
 *   get:
 *     summary: Get all inventory items
 *     tags: [Inventory]
 *     responses:
 *       200:
 *         description: List of inventory items
 */
router.get("/", getAllInventory);

/**
 * @swagger
 * /api/inventory/add:
 *   post:
 *     summary: Add a new inventory item
 *     tags : [Inventory]
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               category:
 *                 type: string
 *               availableQty:
 *                 type: integer
 *               totalQuantity:
 *                 type: integer
 *               description:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Item created successfully
 *       400:
 *         description: Bad request
 */

router.post("/add", upload.single("image"), addInventory);

/**
 * @swagger
 * /api/inventory/{id}/edit:
 *   put:
 *     summary: Edit an inventory item
 *     tags: [Inventory]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Inventory ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               availableQty:
 *                 type: number
 *     responses:
 *       200:
 *         description: Inventory item updated
 */
router.put("/:id/edit", editInventory);

/**
 * @swagger
 * /api/inventory/{id}/delete:
 *   delete:
 *     summary: Delete an inventory item
 *     tags: [Inventory]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Inventory ID
 *     responses:
 *       200:
 *         description: Inventory item deleted
 */
router.delete("/:id/delete", deleteInventory);

export default router;
