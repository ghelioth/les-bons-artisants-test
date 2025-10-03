const router = require("express").Router();
const productController = require("../controllers/product.controller");
const { requireAuth } = require("../middlewares/auth");

// Routes n'ayant pas besoin d'authentification
router.get("/", productController.getAllProduct);
router.get("/:id", productController.getProductById);

// Routes nécessitant une authentification
router.post("/", requireAuth, productController.createProduct);
router.patch("/:id", requireAuth, productController.editProduct);
router.delete("/:id", requireAuth, productController.deleteProduct);

module.exports = router;
