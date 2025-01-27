import axios from "axios";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import { NextFunction, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { prisma } from "../server";

const PAYPAL_CLIENT_ID =
  "AYYtmQuBVHm_q4fO-nRv84xIKhQk1-BdhSLckYRxcBJLhxI5EcxafPKdkvKpqLDP-pNLNXalxvlUSgZE";
const PAYPAL_CLIENT_SECRET =
  "EH6X0HMUA-0gB0Z1m8fq_p-YTy1dDLZT7Zs-Q8VcuX33xJN9RID883YWb38JSMwz88t2grJNwKR5ct_W";

async function getPaypalAccessToken() {
  const response = await axios.post(
    "https://api-m.sandbox.paypal.com/v1/oauth2/token",
    "grant_type=client_credentials",
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(
          `${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`
        ).toString("base64")}`,
      },
    }
  );

  return response.data.access_token;
}

export const createPaypalOrder = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { items, total } = req.body;
    const accessToken = await getPaypalAccessToken();

    const paypalItems = items.map((item: any) => ({
      name: item.name,
      description: item.description || "",
      sku: item.id,
      unit_amount: {
        currency_code: "USD",
        value: item.price.toFixed(2),
      },
      quantity: item.quantity.toString(),
      category: "PHYSICAL_GOODS",
    }));

    const itemTotal = paypalItems.reduce(
      (sum: any, item: any) =>
        sum + parseFloat(item.unit_amount.value) * parseInt(item.quantity),
      0
    );

    const response = await axios.post(
      "https://api-m.sandbox.paypal.com/v2/checkout/orders",
      {
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: "USD",
              value: total.toFixed(2),
              breakdown: {
                item_total: {
                  currency_code: "USD",
                  value: itemTotal.toFixed(2),
                },
              },
            },
            items: paypalItems,
          },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
          "PayPal-Request-ID": uuidv4(),
        },
      }
    );

    res.status(200).json(response.data);
  } catch (e) {
    res.status(500).json({
      success: false,
      message: "Unexpected error occured!",
    });
  }
};

export const capturePaypalOrder = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { orderId } = req.body;
    const accessToken = await getPaypalAccessToken();

    const response = await axios.post(
      `https://api-m.sandbox.paypal.com/v2/checkout/orders/${orderId}/capture`,
      {},
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    res.status(200).json(response.data);
  } catch (e) {
    res.status(500).json({
      success: false,
      message: "Unexpected error occured!",
    });
  }
};

export const createFinalOrder = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { items, addressId, couponId, total, paymentId } = req.body;
    const userId = req.user?.userId;

    console.log(items, "itemsitemsitems");

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Unauthenticated user",
      });

      return;
    }

    //start our transaction

    const order = await prisma.$transaction(async (prisma) => {
      //create new order
      const newOrder = await prisma.order.create({
        data: {
          userId,
          addressId,
          couponId,
          total,
          paymentMethod: "CREDIT_CARD",
          paymentStatus: "COMPLETED",
          paymentId,
          items: {
            create: items.map((item: any) => ({
              productId: item.productId,
              productName: item.productName,
              productCategory: item.productCategory,
              quantity: item.quantity,
              size: item.size,
              color: item.color,
              price: item.price,
            })),
          },
        },
        include: {
          items: true,
        },
      });

      for (const item of items) {
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            stock: { decrement: item.quantity },
            soldCount: { increment: item.quantity },
          },
        });
      }

      await prisma.cartItem.deleteMany({
        where: {
          cart: { userId },
        },
      });

      await prisma.cart.delete({
        where: { userId },
      });

      if (couponId) {
        await prisma.coupon.update({
          where: { id: couponId },
          data: { usageCount: { increment: 1 } },
        });
      }

      return newOrder;
    });

    res.status(201).json(order);
  } catch (e) {
    console.log(e, "createFinalOrder");

    res.status(500).json({
      success: false,
      message: "Unexpected error occured!",
    });
  }
};

export const getOrder = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { orderId } = req.params;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Unauthenticated user",
      });

      return;
    }

    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId,
      },
      include: {
        items: true,
        address: true,
        coupon: true,
      },
    });

    res.status(200).json(order);
  } catch (e) {
    res.status(500).json({
      success: false,
      message: "Unexpected error occured!",
    });
  }
};

export const updateOrderStatus = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { orderId } = req.params;
    const { status } = req.body;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Unauthenticated user",
      });

      return;
    }

    await prisma.order.updateMany({
      where: {
        id: orderId,
      },
      data: {
        status,
      },
    });

    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
    });
  } catch (e) {
    res.status(500).json({
      success: false,
      message: "Unexpected error occured!",
    });
  }
};

export const getAllOrdersForAdmin = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Unauthenticated user",
      });

      return;
    }

    const orders = await prisma.order.findMany({
      include: {
        items: true,
        address: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    res.status(200).json(orders);
  } catch (e) {
    res.status(500).json({
      success: false,
      message: "Unexpected error occured!",
    });
  }
};

export const getOrdersByUserId = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Unauthenticated user",
      });

      return;
    }

    const orders = await prisma.order.findMany({
      where: {
        userId: userId,
      },
      include: {
        items: true,
        address: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(orders);
  } catch (e) {
    res.status(500).json({
      success: false,
      message: "Unexpected error occured!",
    });
  }
};
