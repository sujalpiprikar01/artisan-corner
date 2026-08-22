const Product = require("../models/Product");
const cloudinary = require("../config/cloudinary");

// Get all products
const getProducts = async (req, res) => {
  try {
    const products = await Product.find().populate(
      "vendor",
      "name email store",
    );

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch products",
      error: error.message,
    });
  }
};

// Get products of logged-in vendor
const getMyProducts = async (req, res) => {
  try {
    const products = await Product.find({
      vendor: req.user.id,
    }).populate("vendor", "name email store");

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch your products",
      error: error.message,
    });
  }
};

// Get single product
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "vendor",
      "name email store",
    );

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch product",
      error: error.message,
    });
  }
};

// Create product
const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, stock } = req.body;


    if (!name || !description || price === undefined || !category) {
      return res.status(400).json({
        message: "Please provide name, description, price and category",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "Product image is required",
      });
    }

    // Upload image to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "artisans-corner/products",
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        },
      );

      uploadStream.end(req.file.buffer);
    });

    // Create product
    const product = await Product.create({
      name,
      description,
      price,
      category,
      image: uploadResult.secure_url,
      stock: Number(stock) || 0,
      vendor: req.user.id,
    });

    const populatedProduct = await Product.findById(product._id).populate(
      "vendor",
      "name email store",
    );

    res.status(201).json(populatedProduct);
  } catch (error) {
    res.status(400).json({
      message: "Failed to create product",
      error: error.message,
    });
  }
};

// Update product
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    // Only product owner can update
    if (product.vendor.toString() !== req.user.id) {
      return res.status(403).json({
        message: "You can only update your own products",
      });
    }

    const { name, description, price, category, image, stock } = req.body;

    product.name = name ?? product.name;
    product.description = description ?? product.description;
    product.price = price ?? product.price;
    product.category = category ?? product.category;
    product.image = image ?? product.image;
    product.stock = stock ?? product.stock;

    const updatedProduct = await product.save();

    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(400).json({
      message: "Failed to update product",
      error: error.message,
    });
  }
};

// Delete product
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    // Only product owner can delete
    if (product.vendor.toString() !== req.user.id) {
      return res.status(403).json({
        message: "You can only delete your own products",
      });
    }

    await product.deleteOne();

    res.status(200).json({
      message: "Product deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete product",
      error: error.message,
    });
  }
};

module.exports = {
  getProducts,
  getMyProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
