import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";
import { auth } from "../../../lib/auth";


// --- M-Pesa Helper Functions ---

// 1. Get Daraja Access Token
async function getMpesaToken() {
  const consumerKey = process.env.MPESA_CONSUMER_KEY;
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");

  const response = await fetch("https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials", {
    headers: { Authorization: `Basic ${auth}` },
    cache: "no-store"
  });

  if (!response.ok) throw new Error("Failed to get M-Pesa access token");
  const data = await response.json();
  return data.access_token;
}

// 2. Initiate STK Push
async function initiateSTKPush(phone, amount, orderId, token) {
  const shortCode = process.env.MPESA_SHORTCODE;
  const passkey = process.env.MPESA_PASSKEY;
  const callbackUrl = process.env.MPESA_CALLBACK_URL; // Must be HTTPS (use ngrok for local dev)

  // Format timestamp: YYYYMMDDHHmmss
  const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
  const password = Buffer.from(`${shortCode}${passkey}${timestamp}`).toString("base64");

  // Format phone number to 2547XXXXXXXX
  let formattedPhone = phone.replace(/\D/g, "");
  if (formattedPhone.startsWith("0")) formattedPhone = "254" + formattedPhone.substring(1);
  if (formattedPhone.startsWith("+254")) formattedPhone = "254" + formattedPhone.substring(4);

  const payload = {
    BusinessShortCode: shortCode,
    Password: password,
    Timestamp: timestamp,
    TransactionType: "CustomerPayBillOnline",
    Amount: Math.ceil(amount), // M-Pesa strictly accepts whole numbers
    PartyA: formattedPhone,
    PartyB: shortCode,
    PhoneNumber: formattedPhone,
    CallBackURL: callbackUrl,
    AccountReference: `Order ${orderId}`,
    TransactionDesc: "CampusBite Food Order"
  };

  const response = await fetch("https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();
  if (data.errorMessage) throw new Error(data.errorMessage);
  
  return data; // Returns CheckoutRequestID needed for the callback
}

// --- Main Route Handler ---

export async function POST(req) {
  try {
    // 1. Verify User Session
    const session = await auth();
    if (!session || !session.user.id) {
      return NextResponse.json({ error: "You must be logged in to place an order" }, { status: 401 });
    }

    const body = await req.json();
    const { items, totalAmount, paymentMethod, phone } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Your cart is empty" }, { status: 400 });
    }

    // 2. Generate a 4-digit pickup code (e.g., #4821)
    const pickupCode = Math.floor(1000 + Math.random() * 9000).toString();

    // 3. Create the Order in the Database (Nested Write)
    // This creates the Order AND the OrderItems at the exact same time
    const newOrder = await prisma.order.create({
      data: {
        studentId: session.user.id,
        totalAmount: parseFloat(totalAmount),
        paymentMethod: paymentMethod, // "CASH" or "MPESA"
        paymentStatus: "PENDING",
        orderStatus: "PENDING",
        pickupCode: pickupCode,
        orderItems: {
          create: items.map(item => ({
            foodItemId: item.id,
            quantity: item.quantity,
            unitPrice: parseFloat(item.price),
            subtotal: parseFloat(item.price) * item.quantity
          }))
        }
      }
    });

    // 4. Handle Payment Logic based on Method
    if (paymentMethod === "CASH") {
      // Cash is simple. Just return success. Staff will mark it PAID later.
      return NextResponse.json({ 
        message: "Order placed successfully", 
        orderId: newOrder.id,
        pickupCode 
      }, { status: 201 });
    } 
    
    if (paymentMethod === "MPESA") {
      try {
        // Trigger STK Push to user's phone
        const token = await getMpesaToken();
        const stkResponse = await initiateSTKPush(phone, totalAmount, newOrder.id, token);

        // Save the CheckoutRequestID to our MpesaTransaction table so we can verify it later
        await prisma.mpesaTransaction.create({
          data: {
            orderId: newOrder.id,
            checkoutRequestId: stkResponse.CheckoutRequestID,
            merchantRequestId: stkResponse.MerchantRequestID,
            phoneNumber: phone,
            amount: parseFloat(totalAmount)
          }
        });

        return NextResponse.json({ 
          message: "M-Pesa prompt sent to your phone. Please enter your PIN.", 
          orderId: newOrder.id 
        }, { status: 201 });

      } catch (mpesaError) {
        console.error("M-Pesa STK Push Failed:", mpesaError);
        // Note: The order was still created in the DB as PENDING. 
        // We let the user know the prompt failed so they can try again.
        return NextResponse.json({ 
          error: "Failed to send M-Pesa prompt. Please check your phone number and try again.",
          orderId: newOrder.id
        }, { status: 500 });
      }
    }

  } catch (error) {
    console.error("Order Creation Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}