import express from "express";
import { loginEmployee } from "../controllers/loginEmployeeController.js";
import {
  getEmployee,
  addEmployee,
  updateEmployee,
  deleteEmployee,
  getAssignedInventory,
  assignInventoryToEmployee,
  removeAssignedInventory,
} from "../controllers/employeeController.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Employees
 *   description: Employee management and inventory assignment
 */

/**
 * @swagger
 * /api/employees/login:
 *   post:
 *     summary: Login an employee
 *     tags: [Employees]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: john@gmail.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: Login successful }
 *                 token: { type: string, example: eyJhbGciOiJIUzI1NiIsInR... }
 *                 employee:
 *                   type: object
 *                   properties:
 *                     id: { type: string }
 *                     name: { type: string, example: John Doe }
 *                     email: { type: string, example: john@gmail.com }
 *                     role: { type: string, enum: [admin, employee] }
 *                     deskNumber: { type: string, example: D-123 }
 *       401:
 *         description: Invalid email or password
 */
router.post("/login", loginEmployee);

/**
 * @swagger
 * /api/employees:
 *   get:
 *     summary: Get employees with pagination and search
 *     tags: [Employees]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number (default 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Items per page (default 10)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by employee name
 *     responses:
 *       200:
 *         description: List of employees
 */
router.get("/", getEmployee);

/**
 * @swagger
 * /api/employees/add:
 *   post:
 *     summary: Add a new employee
 *     tags: [Employees]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - department
 *               - deskNumber
 *               - email
 *               - password
 *               - phone
 *               - age
 *               - gender
 *             properties:
 *               name: { type: string, example: John Doe }
 *               department: { type: string, example: IT }
 *               deskNumber: { type: string, example: D-123 }
 *               email: { type: string, example: john@gmail.com }
 *               password: { type: string, example: password123 }
 *               phone: { type: string, example: 9876543210 }
 *               age: { type: number, example: 28 }
 *               gender: { type: string, enum: [Male, Female, Other] }
 *     responses:
 *       201:
 *         description: Employee added successfully
 */
router.post("/add", addEmployee);

/**
 * @swagger
 * /api/employees/{id}/edit:
 *   put:
 *     summary: Update an employee
 *     tags: [Employees]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Employee ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               department: { type: string }
 *               deskNumber: { type: string }
 *               email: { type: string }
 *               phone: { type: string }
 *               age: { type: number }
 *               gender: { type: string }
 *     responses:
 *       200:
 *         description: Employee updated successfully
 */
router.put("/:id/edit", updateEmployee);

/**
 * @swagger
 * /api/employees/{id}/deleteEmp:
 *   delete:
 *     summary: Delete an employee and restore their assigned inventory
 *     tags: [Employees]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Employee ID
 *     responses:
 *       200:
 *         description: Employee deleted successfully
 */
router.delete("/:id/deleteEmp", deleteEmployee);

/**
 * @swagger
 * /api/employees/{id}/assigned-inventory:
 *   get:
 *     summary: Get all assigned inventory for an employee
 *     tags: [Employees]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Employee ID
 *     responses:
 *       200:
 *         description: List of assigned inventory
 */
router.get("/:id/assigned-inventory", getAssignedInventory);

/**
 * @swagger
 * /api/employees/{id}/assigned-inventory:
 *   post:
 *     summary: Assign inventory to an employee
 *     tags: [Employees]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Employee ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - inventoryId
 *               - quantity
 *             properties:
 *               inventoryId: { type: string, example: 64b6f7... }
 *               quantity: { type: number, example: 2 }
 *     responses:
 *       200:
 *         description: Inventory assigned successfully
 */
router.post("/:id/assigned-inventory", assignInventoryToEmployee);

/**
 * @swagger
 * /api/employees/{id}/assigned-inventory/{inventoryId}:
 *   delete:
 *     summary: Reduce assigned inventory quantity by 1 (or remove if last unit)
 *     tags: [Employees]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Employee ID
 *       - in: path
 *         name: inventoryId
 *         required: true
 *         schema:
 *           type: string
 *         description: Inventory ID
 *     responses:
 *       200:
 *         description: Inventory reduced/removed successfully
 */
router.delete("/:id/assigned-inventory/:inventoryId", removeAssignedInventory);

export default router;
