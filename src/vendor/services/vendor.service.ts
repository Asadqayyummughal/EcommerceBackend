import { Vendor } from "../../models/vendor.model";
import User from "../../models/user.model";
import Role from "../../models/role.model";
import Order from "../../models/order.model";
import { VendorWallet } from "../../models/vendorWallet.model";
import mongoose from "mongoose";
import { IPayout, Payout } from "../../models/payout.model";
import Stripe from "stripe";
import { debug } from "console";
const ZERO_DECIMAL_CURRENCIES = [
  "bif",
  "clp",
  "djf",
  "gnf",
  "jpy",
  "kmf",
  "krw",
  "mga",
  "pyg",
  "rwf",
  "ugx",
  "vnd",
  "vuv",
  "xaf",
  "xof",
  "xpf",
];

const getDecimals = (currency: string): number => {
  const lower = currency.toLowerCase();
  if (["isk", "ugx"].includes(lower)) return 2; // special: represent as two-decimal
  if (ZERO_DECIMAL_CURRENCIES.includes(lower)) return 0;
  return 2; // default
};

const toSmallestUnit = (amount: number, currency: string): number => {
  const decimals = getDecimals(currency);
  return Math.round(amount * Math.pow(10, decimals));
};
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-12-15.clover", // use stable version
});

export const applyForVendor = async (userId: string) => {
  //check here if venore role exist or not
  let user = await User.findById(userId); //69809c2a09c9a53278e149f5
  const existing = await Vendor.findOne({ user: userId });
  if (existing) {
    throw new Error("Vendor already exists");
  }
  if (user) {
    const vendor = await Vendor.create({
      user: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
    });
    return vendor;
  }
};

export const getVendorsByStatus = async (status: string) => {
  const vendors = await Vendor.find({ status: status });
  return vendors;
};

export const approveVendor = async (vendorId: string, userId: string) => {
  const vendor = await Vendor.findById(vendorId);
  if (!vendor) throw new Error("Vendor Does not exist");
  const vendorRole = await Role.findOne({ name: "vendor" });
  if (!vendorRole) throw new Error("Vendor role not configured");
  vendor.status = "active";
  vendor.approvedAt = new Date();
  vendor.approvedBy = userId;
  await vendor.save();
  let user = await User.updateOne(
    { _id: vendor.user },
    { role: vendorRole._id },
  );
  const existingWallet = await VendorWallet.findOne({ vendor: vendor._id });
  if (!existingWallet) {
    await VendorWallet.create([
      {
        vendor: vendor._id,
        balance: 0,
        lockedBalance: 0,
        totalEarned: 0,
      },
    ]);
  }

  return { user, vendor };
};

//vedor payout request
export const requestPayout = async (body: IPayout, vendorId: string) => {
  const { amount, method, payoutDetails } = body;
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const vendor = await Vendor.findById({ _id: vendorId });
    if (!vendor || !vendor.payoutsEnabled) {
      throw new Error("Stripe onboarding incomplete");
    }
    const wallet = await VendorWallet.findOne({ vendor: vendorId }).session(
      session,
    );

    if (!wallet || wallet.balance < amount) {
      throw new Error("Wallet does not exist or Insufficient wallet balance");
    }
    if (!vendor.stripeAccountId) throw new Error("Stripe not connected");
    const stripeAccount = await stripe.accounts.retrieve(
      vendor.stripeAccountId,
    );

    if (!stripeAccount.payouts_enabled)
      throw new Error("Stripe payouts not enabled");
    // 🔒 Lock funds
    wallet.balance -= Number(amount);
    wallet.lockedBalance += Number(amount);
    await wallet.save({ session });
    const payout = await Payout.create(
      [
        {
          vendor: vendorId,
          amount,
          method,
          payoutDetails,
          requestedAt: new Date(),
        },
      ],
      { session },
    );

    await session.commitTransaction();
    session.endSession();
    return payout[0];
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};

export const topProductsAnlaytics = async () => {
  // $unwind: "$items"
  // $group: {
  //  _id: "$items.product",
  //   totalSold: { $sum: "$items.quantity" },
  //   revenue: { $sum: "$items.subtotal" }
  // }
};
//admin approved payout
export const approvePayout = async (payoutId: string) => {
  return await Payout.findByIdAndUpdate(
    payoutId,
    { status: "approved" },
    { new: true },
  );
  //send the amount to Vendor Wallet
};
export const listAllPayouts = async () => {
  return await Payout.find();
};

export const rejectPayout = async (payoutId: string, reason: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const payout = await Payout.findById(payoutId).session(session);
    if (!payout) throw new Error("Payout not found");
    const wallet = await VendorWallet.findOne({
      vendor: payout.vendor,
    }).session(session);
    if (!wallet) throw new Error("Wallet not found");
    wallet.balance += payout.amount;
    wallet.lockedBalance -= payout.amount;
    payout.status = "rejected";
    payout.failureReason = reason;
    await wallet.save({ session });
    await payout.save({ session });
    await session.commitTransaction();
    session.endSession();
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};

export const enableVendorStripeAccount = async (userId: string) => {
  const vendor = await Vendor.findOne({ user: userId });
  if (!vendor) throw new Error("Vendor does not exist");
  let stripeAccount;

  // 🟢 CASE 1: Account already exists
  if (vendor.stripeAccountId) {
    stripeAccount = await stripe.accounts.retrieve(vendor.stripeAccountId);

    // ✅ If already fully onboarded
    if (stripeAccount.details_submitted && stripeAccount.payouts_enabled) {
      vendor.stripeOnboarded = true;
      vendor.payoutsEnabled = true;
      await vendor.save();

      return {
        message: "Stripe account already fully onboarded.",
        completed: true,
      };
    }

    // ❗ Not completed → create fresh onboarding link
  }

  // 🔵 CASE 2: No Stripe account yet → create one
  if (!vendor.stripeAccountId) {
    stripeAccount = await stripe.accounts.create({
      type: "express",
      country: "US",
      email: vendor.email,
      capabilities: {
        transfers: { requested: true },
      },
      metadata: {
        vendorId: vendor._id.toString(),
      },
    });

    vendor.stripeAccountId = stripeAccount.id;
    vendor.stripeOnboarded = false;
    vendor.payoutsEnabled = false;
    await vendor.save();
  }
  // 🔁 Create onboarding link (resume flow)
  // const accountLink = await stripe.accountLinks.create({
  //   account: vendor.stripeAccountId,
  //   refresh_url: `${process.env.FRONTEND_URL}/vendor/stripe/refresh`,
  //   return_url: `${process.env.FRONTEND_URL}/vendor/stripe/success`,
  //   type: "account_onboarding",
  // });
  const loginLink = await stripe.accounts.createLoginLink(
    vendor.stripeAccountId,
  );

  return {
    url: loginLink,
    completed: false,
  };
};

export const payoutVendor = async (userId: string, payoutId: string) => {
  const payout = await Payout.findById(payoutId);
  if (!payout) throw new Error("Payout does not exist");

  const vendor = await Vendor.findOne({ user: userId });
  if (!vendor) throw new Error("Vendor not found");

  const wallet = await VendorWallet.findOne({ vendor: vendor._id });
  if (!wallet || wallet.balance < payout.amount)
    throw new Error("Insufficient balance");

  if (!vendor.stripeAccountId) throw new Error("Stripe not connected");

  const stripeAccount = await stripe.accounts.retrieve(vendor.stripeAccountId);
  if (!stripeAccount.payouts_enabled)
    throw new Error("Stripe payouts not enabled");

  // Use the connected account's default currency (safest, avoids FX)
  const currency = stripeAccount.default_currency;

  // Optional: if payout has its own currency field, check/convert here
  // e.g., if (payout.currency !== currency) { convert amount via FX API }

  const transferAmount = toSmallestUnit(payout.amount, currency || "usd");
  payout.currency = currency;
  let transfer;
  try {
    transfer = await stripe.transfers.create(
      {
        amount: transferAmount,
        currency: currency || "usd", // dynamic!
        destination: vendor.stripeAccountId,
        metadata: {
          payoutId: payout._id.toString(),
          vendorId: vendor._id.toString(),
        },
      },
      {
        idempotencyKey: `payout-${payout._id}`,
      },
    );

    // Success: update wallet
    wallet.balance -= payout.amount;
    // wallet.totalWithdrawn += payout.amount;  // uncomment if needed
    await wallet.save();
    await payout.save();
  } catch (error) {
    // Handle Stripe errors
    if (error instanceof Stripe.errors.StripeError) {
      if (
        error.code === "parameter_invalid" ||
        error.message.includes("currency")
      ) {
        throw new Error(`Currency issue: ${error.message}`);
      }
      // Other cases: insufficient_funds, etc.
    }
    throw error; // rethrow for caller
  }

  return transfer;
};
//listAllVendorOrders

export const getVendorWalletDetail = async (vendorId: string) => {
  let vendorWallet = await VendorWallet.findOne({ vendor: vendorId });
  if (!vendorWallet) throw new Error("wallet not exist");
  return vendorWallet;
};
