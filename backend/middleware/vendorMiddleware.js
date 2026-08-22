const vendorOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      message: "Not authorized. Please login.",
    });
  }

  if (req.user.role !== "vendor") {
    return res.status(403).json({
      message: "Access denied. Vendor access required.",
    });
  }

  next();
};

module.exports = { vendorOnly };