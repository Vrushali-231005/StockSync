import mongoose from "mongoose";

const inventoryRequestSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    inventory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Inventory",
      required: true,
    },
    requestType: {
      type: String,
      enum: ["new", "exchange"],
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const InventoryRequest = mongoose.model("InventoryRequest", inventoryRequestSchema);
export default InventoryRequest;
