import express from "express";
import {
  createRequest,
  getRequests,
  updateRequestStatus,
   deleteRequest }
 from "../controllers/inventoryRequestController.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Inventory Requests
 *   description: Inventory request management routes
 */



/**
 * @swagger
 * /api/inventoryReq/add:
 *   post:
 *     summary: Create a new inventory request (uses employeeName + deskNumber)
 *     tags: [Inventory Requests]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - employeeName
 *               - deskNumber
 *               - inventoryName
 *               - requestType
 *               - reason
 *             properties:
 *               employeeName:
 *                 type: string
 *                 example: "Vrushali"
 *               deskNumber:
 *                 type: string
 *                 example: "D-15"
 *               inventoryName:
 *                 type: string
 *                 example: "HP Laptop"
 *               requestType:
 *                 type: string
 *                 enum: [new, exchange]
 *                 example: "exchange"
 *               reason:
 *                 type: string
 *                 example: "Damaged screen"
 */

router.post("/add", createRequest);

/**
 * @swagger
 * /api/inventoryReq:
 *   get:
 *     summary: Get all inventory requests (Admin view)
 *     tags: [Inventory Requests]
 *     responses:
 *       200:
 *         description: List of all requests with employee and inventory details
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   employee:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                       deskNumber:
 *                         type: string
 *                   inventory:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                   requestType:
 *                     type: string
 *                     enum: [new, exchange]
 *                   reason:
 *                     type: string
 *                   status:
 *                     type: string
 *                     enum: [pending, approved, rejected]
 *       500:
 *         description: Server error
 */
router.get("/", getRequests);

/**
 * @swagger
 * /api/inventoryReq/{id}/status:
 *   put:
 *     summary: Approve or reject an inventory request
 *     tags: [Inventory Requests]
 *     parameters:
 *       - in: path
 *         name: id
 *         description: ID of the inventory request
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [approved, rejected]
 *                 example: approved
 *     responses:
 *       200:
 *         description: Request status updated successfully
 *       400:
 *         description: No stock available (when approved)
 *       404:
 *         description: Request not found
 *       500:
 *         description: Server error
 */
router.put("/:id/status", updateRequestStatus);



router.delete("/:id", deleteRequest);


export default router;
