
const sellerOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Please log in first.",
    });
  }

  if (
    req.user.role !== "seller" ||
    req.user.sellerApplicationStatus !== "approved"
  ) {
    return res.status(403).json({
      success: false,
      message: "Only approved sellers can manage products.",
    });
  }

  next();
};

module.exports = { sellerOnly };
