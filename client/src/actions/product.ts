"use server";

import { createNewProductRules } from "@/arcjet";
import { request } from "@arcjet/next";

export const protectProductFormAction = async () => {
  const req = await request();
  const decision = await createNewProductRules.protect(req);

  if (decision.isDenied()) {
    if (decision.reason.isBot()) {
      return {
        error: "Bot activity detected",
        success: false,
        status: 403,
      };
    } else if (decision.reason.isRateLimit()) {
      return {
        error: "Too many requests! Please try again later",
        success: false,
        status: 403,
      };
    } else if (decision.reason.isShield()) {
      return {
        error: "Invalid activity detected",
        success: false,
        status: 403,
      };
    }
  }

  return {
    success: true,
  };
};
