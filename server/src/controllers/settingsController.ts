import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import cloudinary from "../config/cloudinary";
import { prisma } from "../server";
import fs from "fs";

export const addFeatureBanners = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      res.status(404).json({
        success: false,
        message: "No files provided",
      });
      return;
    }

    const uploadPromises = files.map((file) =>
      cloudinary.uploader.upload(file.path, {
        folder: "ecommerce-feature-banners",
      })
    );

    const uploadResults = await Promise.all(uploadPromises);

    const banners = await Promise.all(
      uploadResults.map((res) =>
        prisma.featureBanner.create({
          data: {
            imageUrl: res.secure_url,
          },
        })
      )
    );

    files.forEach((file) => fs.unlinkSync(file.path));
    res.status(201).json({
      success: true,
      banners,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      success: false,
      message: "Failed to add feature banners",
    });
  }
};

export const fetchFeatureBanners = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const banners = await prisma.featureBanner.findMany({
    orderBy: { createdAt: "desc" },
  });

  res.status(200).json({
    success: true,
    banners,
  });
  try {
  } catch (e) {
    console.error(e);
    res.status(500).json({
      success: false,
      message: "Failed to fetch feature banners",
    });
  }
};

export const updateFeaturedProducts = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { productIds } = req.body;

    if (!Array.isArray(productIds) || productIds.length > 8) {
      res.status(400).json({
        success: false,
        message: `Invalid product Id's or too many requests`,
      });
      return;
    }

    //reset all products to not featured
    await prisma.product.updateMany({
      data: { isFeatured: false },
    });

    //set selected product as featured
    await prisma.product.updateMany({
      where: { id: { in: productIds } },
      data: { isFeatured: true },
    });

    res.status(200).json({
      success: true,
      message: "Featured products updated successfully !",
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      success: false,
      message: "Failed to update feature products",
    });
  }
};

export const getFeaturedProducts = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const featuredProducts = await prisma.product.findMany({
      where: { isFeatured: true },
    });

    res.status(200).json({
      success: true,
      featuredProducts,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      success: false,
      message: "Failed to fetch feature products",
    });
  }
};
