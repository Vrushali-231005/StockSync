// controllers/inventoryRequestController.js
import InventoryRequest from "../models/inventoryRequest.js";
import Inventory from "../models/inventory.js";
import Employee from "../models/employee.js";


/** Helper: case-insensitive exact match for strings */
const ciExact = (text) =>
  new RegExp(`^${String(text).replace(/[.*+?^${}()|[\\]\\\\]/g, "\\$&")}$`, "i");

/**
 * GET form data for request creation
 * Sends employee name + desk number, inventory name, request types, and reasons
 */
export const getRequestFormData = async (req, res) => {
  try {
    const employees = await Employee.find({}, "name deskNumber");
    const inventory = await Inventory.find({}, "name");

    const requestTypes = ["new", "exchange"];
    const reasonOptions = ["Damaged item", "Lost item", "Need upgrade", "Other"];

    res.status(200).json({ employees, inventory, requestTypes, reasonOptions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * POST create a new inventory request (status = pending)
 * Required body:
 * {
 *   "employeeName": "John Doe",
 *   "deskNumber": "D-123",
 *   "inventoryName": "Hp Pavilion 15",
 *   "requestType": "new" | "exchange",
 *   "reason": "..."
 * }
 *
 * Rules:
 * - Block if there's any PENDING request for same employee+inventory.
 * - Block if there's any REJECTED request for same employee+inventory (permanently).
 * - Allowed after APPROVED (no block).
 */
export const createRequest = async (req, res) => {
  try {
    let { employeeName, deskNumber, inventoryName, requestType, reason } = req.body;

    // Validation
    if (!employeeName || !deskNumber || !inventoryName || !requestType || !reason) {
      return res.status(400).json({
        message:
          "employeeName, deskNumber, inventoryName, requestType and reason are required.",
      });
    }

    const type = String(requestType).toLowerCase().trim();
    if (!["new", "exchange"].includes(type)) {
      return res.status(400).json({ message: "requestType must be 'new' or 'exchange'." });
    }

    // Resolve Employee (by name + deskNumber)
    const employee = await Employee.findOne({
      name: ciExact(employeeName.trim()),
      deskNumber: ciExact(deskNumber.trim()),
    });
    if (!employee) {
      return res
        .status(404)
        .json({ message: "Employee not found for the provided name and deskNumber." });
    }

    // Resolve Inventory (by name)
    const inventory = await Inventory.findOne({ name: ciExact(inventoryName.trim()) });
    if (!inventory) {
      return res
        .status(404)
        .json({ message: "Inventory not found for the provided inventoryName." });
    }

    // ❌ Block if any REJECTED exists for this pair (permanent block)
    const hasRejected = await InventoryRequest.exists({
      employee: employee._id,
      inventory: inventory._id,
      status: "rejected",
    });
    if (hasRejected) {
      return res.status(400).json({
        message: `Your previous request for "${inventory.name}" was rejected. You cannot request this item again.`,
      });
    }

    // ❌ Block if there is a PENDING request for this pair
    const hasPending = await InventoryRequest.exists({
      employee: employee._id,
      inventory: inventory._id,
      status: "pending",
    });
    if (hasPending) {
      return res.status(400).json({
        message: `A pending request for "${inventory.name}" by ${employee.name} already exists.`,
      });
    }

    // ✅ Approved history does NOT block
    const request = new InventoryRequest({
      employee: employee._id,
      inventory: inventory._id,
      requestType: type,
      reason: String(reason).trim(),
    });

    await request.save();
    return res.status(201).json({ message: "Request submitted successfully", request });
  } catch (error) {
    console.error("createRequest error:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * GET all requests for admin (pending, approved, rejected)
 */
export const getRequests = async (req, res) => {
  try {
    const requests = await InventoryRequest.find()
      .populate("employee", "name deskNumber")
      .populate("inventory", "name")
      .sort({ createdAt: -1 }); // newest first
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * PUT approve or reject request
 * Body: { status: "approved" | "rejected" }
 *
 * Notes:
 *  - Inventory effects ONLY when approved.
 *  - "new": stock -1, assign to employee (qty +1).
 *  - "exchange": employee must already have item; log defective; stock -1; qty unchanged (1:1 replacement).
 *  - After APPROVE: auto-reject any other PENDING for same employee+inventory (unblocks future requests).
 */
export const updateRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const nextStatus = String(status || "").toLowerCase();

    if (!["approved", "rejected"].includes(nextStatus)) {
      return res.status(400).json({ message: "status must be 'approved' or 'rejected'." });
    }

    const request = await InventoryRequest.findById(req.params.id)
      .populate("employee")
      .populate("inventory");

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    // Prevent re-processing
    if (request.status !== "pending") {
      if (request.status === nextStatus) {
        return res.status(200).json({ message: `Request already ${nextStatus}`, request });
      }
      return res
        .status(400)
        .json({ message: `Cannot change status from '${request.status}' to '${nextStatus}'.` });
    }

    // ✅ Only update if approved
    if (nextStatus === "approved") {
      if (request.requestType === "new") {
        // Stock check
        if (request.inventory.availableQty <= 0) {
          return res.status(400).json({ message: "No stock available" });
        }

        // Reduce stock
        request.inventory.availableQty -= 1;
        await request.inventory.save();

        // Assign to employee
        if (!Array.isArray(request.employee.assignedInventory)) {
          request.employee.assignedInventory = [];
        }

        const existing = request.employee.assignedInventory.find(
          (i) => String(i.inventoryId) === String(request.inventory._id)
        );

        if (existing) {
          existing.quantity += 1;
        } else {
          request.employee.assignedInventory.push({
            inventoryId: request.inventory._id,
            quantity: 1,
          });
        }
        await request.employee.save();

      } else if (request.requestType === "exchange") {
        // Just approve without changing availableQty
        // (keeps employee quantity as-is)
      }

      // Auto-reject any other pending requests for same employee + inventory
      await InventoryRequest.updateMany(
        {
          _id: { $ne: request._id },
          employee: request.employee._id,
          inventory: request.inventory._id,
          status: "pending",
        },
        { $set: { status: "rejected" } }
      );
    }

    // Update request status
    request.status = nextStatus;
    await request.save();

    res.status(200).json({ message: `Request ${nextStatus}`, request });
  } catch (error) {
    console.error("updateRequestStatus error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const deleteRequest = async (req, res) => {
  try {
    const deleted = await InventoryRequest.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Request not found" });
    }
    res.status(200).json({ message: "Request deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
