import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";


export async function POST(req) {
  try {
    const data = await req.json();

    // 1. Safaricom sends data nested inside Body.stkCallback
    const stkCallback = data?.Body?.stkCallback;

    if (!stkCallback) {
      return NextResponse.json({ error: "Invalid callback payload" }, { status: 400 });
    }

    const { MerchantRequestID, CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } = stkCallback;

    // 2. Find the transaction in our database using the CheckoutRequestID
    const transaction = await prisma.mpesaTransaction.findFirst({
      where: { checkoutRequestId: CheckoutRequestID },
      include: { order: true } // Bring in the associated order so we can update it
    });

    if (!transaction) {
      console.error("Transaction not found for CheckoutRequestID:", CheckoutRequestID);
      return NextResponse.json({ message: "Transaction not found, but callback received" }, { status: 200 });
    }

    // 3. Handle SUCCESSFUL Payment (ResultCode === 0)
    if (ResultCode === 0) {
      // Extract the exact M-Pesa Receipt Number from the metadata array
      const receiptItem = CallbackMetadata?.Item?.find(item => item.Name === "MpesaReceiptNumber");
      const mpesaReceiptNumber = receiptItem ? receiptItem.Value : null;

      // Update the MpesaTransaction record
      await prisma.mpesaTransaction.update({
        where: { id: transaction.id },
        data: {
          resultCode: ResultCode,
          resultDesc: ResultDesc,
        }
      });

      // Update the actual Order status to CONFIRMED
      await prisma.order.update({
        where: { id: transaction.orderId },
        data: {
          paymentStatus: "PAID",
          orderStatus: "CONFIRMED",
          mpesaReceiptNumber: mpesaReceiptNumber
        }
      });

      console.log(`✅ Order ${transaction.orderId} Paid Successfully! Receipt: ${mpesaReceiptNumber}`);

    } else {
      // 4. Handle FAILED Payment (e.g., user cancelled, insufficient funds)
      // ResultCode !== 0 means it failed.
      
      await prisma.mpesaTransaction.update({
        where: { id: transaction.id },
        data: {
          resultCode: ResultCode,
          resultDesc: ResultDesc,
        }
      });

      await prisma.order.update({
        where: { id: transaction.orderId },
        data: {
          paymentStatus: "FAILED",
          orderStatus: "CANCELLED" // Cancel the order so it doesn't clutter the staff queue
        }
      });

      console.log(`❌ Order ${transaction.orderId} Payment Failed: ${ResultDesc}`);
    }

    // 5. Always return a 200 OK to Safaricom so they know we received it
    // If you don't return 200, Safaricom will keep resending the callback for hours.
    return NextResponse.json({ message: "Callback processed successfully" }, { status: 200 });

  } catch (error) {
    console.error("M-Pesa Callback Error:", error);
    // Still return 200 so Safaricom doesn't block your shortcode for too many 500 errors
    return NextResponse.json({ message: "Error processing callback" }, { status: 200 });
  }
}