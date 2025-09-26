import Employee from "../models/employee.js";
import Inventory from "../models/inventory.js";
import bcrypt from "bcrypt";

import { sendEmail } from "../utils/email.js";
import { welcomeTemplate } from "../utils/templates/welcomeTemplate.js";



// ✅ Get employees with pagination + search
export const getEmployee = async (req, res) => {
  try {
    let { page = 1, limit = 10, search = "" } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);

    const query = search
      ? { name: { $regex: search, $options: "i" } }
      : {};

    const totalEmployees = await Employee.countDocuments(query);

    const employees = await Employee.find(query)
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      employees,
      totalEmployees,
      totalPages: Math.ceil(totalEmployees / limit),
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addEmployee = async (req, res) => {
  try {
    const {
      name,
      department,
      deskNumber,
      email,
      phone,
      age,
      gender,
      role,
      password, // generated from frontend
      assignedInventory = [],
    } = req.body;

    // Check for duplicate email
    const existing = await Employee.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Handle inventory assignments
    const inventoryWithIds = await Promise.all(
      assignedInventory.map(async (item) => {
        const inventoryItem = await Inventory.findOne({ name: item.inventoryName });
        if (!inventoryItem) throw new Error(`Inventory not found: ${item.inventoryName}`);
        if (inventoryItem.availableQty < item.quantity) {
          throw new Error(`Not enough quantity available for: ${item.inventoryName}`);
        }

        inventoryItem.availableQty -= item.quantity;
        await inventoryItem.save();

        return {
          inventoryId: inventoryItem._id,
          quantity: item.quantity,
        };
      })
    );

    // Create new employee
    const newEmployee = new Employee({
      name,
      department,
      deskNumber,
      email,
      phone,
      age,
      gender,
      password: hashedPassword,   // hashed
      role: role || "employee",   // default
      assignedInventory: inventoryWithIds,
    });

    await newEmployee.save();

    // ✅ Fire-and-forget email (non-blocking, response won’t hang)
    sendEmail(
      email,
      "Welcome to StockSync 🎉",
      `Hi ${name}, your account has been created. Email: ${email}, Password: ${password}`,
      welcomeTemplate(name, email, password)
    ).catch((emailError) => {
      console.error("❌ Failed to send email:", emailError.message);
    });

    
    res.status(201).json({
      message: "Employee added successfully. Password sent via email if email delivery succeeded.",
      employee: newEmployee,
    });

  } catch (error) {
    res.status(500).json({ message: "Error adding employee", error: error.message });
  }
};

// ✅ Update employee
export const updateEmployee = async (req, res) => {
  try {
    const employeeId = req.params.id;
    const { name, department, deskNumber, email, phone, age, gender, assignedInventory } = req.body;

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    employee.name = name || employee.name;
    employee.department = department || employee.department;
    employee.deskNumber = deskNumber || employee.deskNumber;
    employee.email = email || employee.email;
    employee.phone = phone || employee.phone;
    employee.age = age || employee.age;
    employee.gender = gender || employee.gender;

    if (assignedInventory && assignedInventory.length > 0) {
      for (let updatedItem of assignedInventory) {
        const inventoryItem = await Inventory.findOne({ name: updatedItem.inventoryName });
        if (!inventoryItem) continue;

        const existingItem = employee.assignedInventory.find(
          (i) => i.inventoryId.toString() === inventoryItem._id.toString()
        );

        const newQty = parseInt(updatedItem.quantity);

        if (existingItem) {
          const diff = newQty - existingItem.quantity;
          if (diff > 0 && inventoryItem.availableQty < diff) {
            return res.status(400).json({ message: `Not enough inventory for ${inventoryItem.name}` });
          }
          inventoryItem.availableQty -= diff;
          existingItem.quantity = newQty;
        } else {
          if (inventoryItem.availableQty < newQty) {
            return res.status(400).json({ message: `Not enough inventory for ${inventoryItem.name}` });
          }
          inventoryItem.availableQty -= newQty;
          employee.assignedInventory.push({
            inventoryId: inventoryItem._id,
            quantity: newQty,
          });
        }
        await inventoryItem.save();
      }
    }

    await employee.save();
    res.status(200).json({ message: "Employee updated successfully", employee });
  } catch (error) {
    res.status(500).json({ message: "Error updating employee", error: error.message });
  }
};

// ✅ Delete employee and restore inventory
export const deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    for (const item of employee.assignedInventory) {
      await Inventory.findByIdAndUpdate(item.inventoryId, {
        $inc: { availableQty: item.quantity },
      });
    }

    await employee.deleteOne();
    res.status(200).json({ message: "Employee deleted and inventory restored" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting employee", error: error.message });
  }
};


// ✅ Get assigned inventory for an employee
export const getAssignedInventory = async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await Employee.findById(id).populate("assignedInventory.inventoryId");
    if (!employee) return res.status(404).json({ message: "Employee not found" });

    res.status(200).json(
      employee.assignedInventory.map(item => ({
        id: item._id, // subdocument ID
        inventoryId: item.inventoryId?._id, // ✅ actual Inventory ID
        name: item.inventoryId?.name || "Unknown",
        image: item.inventoryId?.image || null,
        quantity: item.quantity,
        description: item.inventoryId?.description || "No description"

      }))
    );
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }};


// ✅ Assign inventory to employee
export const assignInventoryToEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const { inventoryId, quantity } = req.body;

    if (!inventoryId || !quantity || quantity <= 0) {
      return res.status(400).json({ message: "Invalid inventory or quantity" });
    }

    const employee = await Employee.findById(id);
    if (!employee) return res.status(404).json({ message: "Employee not found" });

    const inventoryItem = await Inventory.findById(inventoryId);
    if (!inventoryItem) return res.status(404).json({ message: "Inventory item not found" });

    if (inventoryItem.availableQty < quantity) {
      return res.status(400).json({ message: `Not enough quantity available for ${inventoryItem.name}` });
    }

    inventoryItem.availableQty -= quantity;
    await inventoryItem.save();

    const existing = employee.assignedInventory.find(
      (i) => i.inventoryId.toString() === inventoryId
    );
    if (existing) {
      existing.quantity += quantity;
    } else {
      employee.assignedInventory.push({ inventoryId, quantity });
    }

    await employee.save();
    res.status(200).json({ message: "Inventory assigned successfully", assignedInventory: employee.assignedInventory });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


// Reduce quantity by 1 or remove if last item
export const removeAssignedInventory = async (req, res) => {
  try {
    const { id, inventoryId } = req.params;
    const { all } = req.query; // check if "all=true" is sent

    const employee = await Employee.findById(id).populate('assignedInventory.inventoryId');
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const item = employee.assignedInventory.find(
      inv => inv.inventoryId?._id.toString() === inventoryId
    );
    if (!item) {
      return res.status(404).json({ message: "Inventory item not found for employee" });
    }

    const inventoryItem = await Inventory.findById(inventoryId);
    if (inventoryItem) {
      // Return the quantity back to inventory
      if (all === "true") {
        inventoryItem.availableQty += item.quantity; // return all
      } else {
        inventoryItem.availableQty += 1; // return 1
      }
      await inventoryItem.save();
    }

    // Reduce quantity or remove completely
    if (all === "true" || item.quantity === 1) {
      // remove entire item
      employee.assignedInventory = employee.assignedInventory.filter(
        inv => inv.inventoryId?._id.toString() !== inventoryId
      );
    } else {
      // reduce by 1
      item.quantity -= 1;
    }

    await employee.save();

    res.status(200).json({
      message: all === "true" ? "Removed all quantities" : "Inventory quantity reduced by 1",
      updatedInventory: employee.assignedInventory,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
