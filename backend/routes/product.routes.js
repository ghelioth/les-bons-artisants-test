const router = require("express").Router();
const productController = require("../controllers/product.controller");

router.get("/", productController.getAllProduct);
router.get("/:id", productController.getProductById);
router.post("/", productController.createProduct);
router.patch("/:id", productController.editProduct);
router.delete("/:id", productController.deleteProduct);

module.exports = router;
