const User = require("../models/User");
const cloudinary = require("../config/cloudinary");

// Become a Vendor
const becomeVendor = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (user.role === "vendor") {
      return res.status(400).json({
        message: "You are already a vendor",
      });
    }

    if (user.role === "admin") {
      return res.status(400).json({
        message: "Admin cannot become a vendor",
      });
    }

    const { storeName, storeDescription, storeLogo } = req.body;

    if (!storeName || !storeName.trim()) {
      return res.status(400).json({
        message: "Store name is required",
      });
    }

    user.role = "vendor";

    user.store = {
      name: storeName.trim(),
      description: storeDescription || "",
      logo: storeLogo || "",
    };

    await user.save();

    res.status(200).json({
      message: "You are now a vendor",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        store: user.store,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to become a vendor",
      error: error.message,
    });
  }
};

// Get current user profile
const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch profile",
      error: error.message,
    });
  }
};

// Update Store
const updateStore = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Only vendors can update store
    if (user.role !== "vendor") {
      return res.status(403).json({
        message: "Only vendors can manage a store",
      });
    }

    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Store name is required",
      });
    }

    let logoUrl = user.store.logo;

    // If a new logo file was uploaded, push it to Cloudinary
    if (req.file) {
      const uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "artisans-corner/store-logos",
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

      logoUrl = uploadResult.secure_url;
    }

    user.store.name = name.trim();
    user.store.description = description || "";
    user.store.logo = logoUrl;

    await user.save();

    res.status(200).json({
      message: "Store updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        store: user.store,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update store",
      error: error.message,
    });
  }
};

module.exports = {
  becomeVendor,
  getMyProfile,
  updateStore,
};