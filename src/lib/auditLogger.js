// src/lib/auditLogger.js
import prisma from "@/lib/prisma";

export async function logAuditEvent({ entityType, entityId, action, actorId = null, details = {} }) {
  try {
    await prisma.auditLog.create({
      data: {
        entityType,
        entityId,
        action,
        actorId,
        details, // Prisma handles JSON serialization automatically
      }
    });
  } catch (error) {
    console.error("Failed to write to audit log:", error);
    // You generally don't want an audit log failure to crash the main transaction
  }
}