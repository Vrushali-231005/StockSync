import Inventory from "../models/inventory.js";
import Employee from "../models/employee.js";
import cloudinary from "../config/cloudinary.js";
import fs from "fs";
import path from "path";

// Get all inventory items
export const getAllInventory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;     // Get current page or default to 1
    const limit = parseInt(req.query.limit) || 6;   // Number of items per page (default 6)
    const skip = (page - 1) * limit;

    const total = await Inventory.countDocuments(); // Total number of documents
    const inventory = await Inventory.find()
      .skip(skip)
      .limit(limit)
      

    res.status(200).json({
      totalItems: total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: inventory
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Add new inventory

export const addInventory = async (req, res) => {
  try {
    const { name, category, availableQty, totalQuantity, description } = req.body;

    // req.file.path now contains the Cloudinary URL
    const imageUrl = req.file?.path; 


    const newItem = await Inventory.create({
      name,
      category,
      availableQty,
      totalQuantity,
      description,
      image: imageUrl,

    });

    res.status(201).json({ message: "Inventory added successfully", newItem });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to add inventory" });
  }
};



// Edit an inventory
export const editInventory = async (req, res) => {
  try {
    const updatedItem = await Inventory.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.status(200).json(updatedItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete inventory
export const deleteInventory = async (req, res) => {
  try {
    const inventoryId = req.params.id;

    // 1️⃣ Find the inventory item
    const inventoryItem = await Inventory.findById(inventoryId);
    if (!inventoryItem) return res.status(404).json({ message: "Inventory not found" });

    // 2️⃣ Find all employees who have this inventory assigned
    const employees = await Employee.find({
      assignedInventory: { $elemMatch: { inventoryId: inventoryId } }
    });

    // 3️⃣ Remove this inventory from each employee
    for (const emp of employees) {
      const item = emp.assignedInventory.find(inv => inv.inventoryId?.toString() === inventoryId);
      if (item) {
        // Return quantity back to inventory before deletion
        inventoryItem.availableQty += item.quantity;
        // Remove from employee assignedInventory
        emp.assignedInventory = emp.assignedInventory.filter(inv => inv.inventoryId?.toString() !== inventoryId);
        await emp.save();
      }
    }

    // 4️⃣ Delete image file if exists
    if (inventoryItem.image) {
      const filePath = path.join(process.cwd(), "uploads", path.basename(inventoryItem.image));
      fs.unlink(filePath, (err) => {
        if (err) console.error("Failed to delete image:", err);
        else console.log("✅ Image deleted:", filePath);
      });
    }

    // 5️⃣ Delete the inventory itself
    await Inventory.findByIdAndDelete(inventoryId);

    res.status(200).json({ message: "Inventory, assigned quantities, and image deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete inventory", error: err.message });
  }
};