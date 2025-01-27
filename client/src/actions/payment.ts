"use server";

import { prePaymentFlowRules } from "@/arcjet";
import { request } from "@arcjet/next";

export const paymentAction = async (email: string) => {
  const req = await request();
  const decision = await prePaymentFlowRules.protect(req, { email });

  if (decision.isDenied()) {
    if (decision.reason.isEmail()) {
      const emailTypes = decision.reason.emailTypes;
      if (emailTypes.includes("DISPOSABLE")) {
        return {
          error: "Disposable email address are not allowed",
          success: false,
          status: 403,
        };
      } else if (emailTypes.includes("INVALID")) {
        return {
          error: "Invalid email",
          success: false,
          status: 403,
        };
      } else if (emailTypes.includes("NO_MX_RECORDS")) {
        return {
          error:
            "Email domain does not have valid MX Records! Please try with different email",
          success: false,
          status: 403,
        };
      }
    } else if (decision.reason.isBot()) {
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
    }
  }

  return {
    success: true,
  };
};
