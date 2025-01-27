"use client";

import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import CheckoutSuspense from "./checkoutSkeleton";

function CheckoutPage() {
  const options = {
    clientId:
      "AYYtmQuBVHm_q4fO-nRv84xIKhQk1-BdhSLckYRxcBJLhxI5EcxafPKdkvKpqLDP-pNLNXalxvlUSgZE",
  };

  return (
    <PayPalScriptProvider options={options}>
      <CheckoutSuspense />
    </PayPalScriptProvider>
  );
}

export default CheckoutPage;
