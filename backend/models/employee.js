// models/Employee.js
import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema({
  name: String,
  department: String,
  deskNumber: String,
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // 🔹 new
  role: { type: String, enum: ["admin", "employee"], default: "employee" }, // 🔹 new
  phone: String,
  age: Number,
  gender: String,
  assignedInventory: [
    {
      inventoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Inventory" },
      quantity: Number,
    },
  ],
});

const Employee = mongoose.model("Employee", employeeSchema);
export default Employee;
