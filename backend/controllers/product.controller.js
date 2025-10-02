const { getDB } = require("../config/connection");

// Module pour récupérer l'ensemble des prosuits
module.exports.getAllProduct = async (req, res, next) => {
  try {
    const db = getDB();
    const results = await db.collection("products").find({}).toArray();
    return res.status(200).json(results);
  } catch (err) {
    return next(err);
  }
};

// Module pour récupérer un produit connaissant son id
module.exports.getProductById = async (req, res, next) => {
  try {
    const db = getDB();
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({ error: "Invalid id (must be a number)" });
    }

    const result = await db.collection("products").findOne({ _id: id });

    if (!result) res.status(404).json({ error: "Not found" });
    return res.status(200).json(result);
  } catch (err) {
    return next(err);
  }
};

// Module pour créer ou ajouter un produit
module.exports.createProduct = async (req, res, next) => {
  try {
    const db = getDB();
    let newProduct = {
      _id: req.body._id,
      name: req.body.name,
      type: req.body.type,
      price: req.body.price,
      rating: req.body.rating,
      warranty_years: req.body.warranty_years,
      available: req.body.available,
    };

    if (!newProduct) {
      return res.status(400).json({ error: "Invalid new product" });
    }

    if (newProduct.price !== undefined && newProduct.price !== null) {
      newProduct.price = Number(newProduct.price);
      if (Number.isNaN(newProduct.price)) {
        return res.status(400).json({ error: "price must be a number" });
      }
    }

    if (newProduct.rating !== undefined && newProduct.rating !== null) {
      newProduct.rating = Number(newProduct.rating);
      if (Number.isNaN(newProduct.rating)) {
        return res.status(400).json({ error: "rating must be a number" });
      }
      if (newProduct.rating < 0 || newProduct.rating > 5) {
        return res
          .status(400)
          .json({ error: "rating must be between 0 and 5" });
      }
    }

    if (
      newProduct.warranty_years !== undefined &&
      newProduct.warranty_years !== null
    ) {
      newProduct.warranty_years = parseInt(newProduct.warranty_years, 10);
      if (
        Number.isNaN(newProduct.warranty_years) ||
        newProduct.warranty_years < 0
      ) {
        return res
          .status(400)
          .json({ error: "warranty_years must be a non-negative integer" });
      }
    }

    if (newProduct.available !== undefined && newProduct.available !== null) {
      // accepte true/false ou "true"/"false"
      newProduct.available =
        newProduct.available === true || newProduct.available === "true";
    }

    const result = await db.collection("products").insertOne(newProduct);

    if (!result) res.status(500).json({ error: "Failed to create" });
    return res.status(200).json(result);
  } catch (err) {
    return next(err);
  }
};

// Module pour modifier un produit spécifique
module.exports.editProduct = async (req, res, next) => {
  try {
    const db = getDB();
    const id = Number(req.params.id);
    const allowed = [
      "name",
      "type",
      "price",
      "rating",
      "warranty_years",
      "available",
    ];
    const updates = {};
    for (const key of allowed) {
      if (Object.prototype.hasOwnProperty.call(req.body, key)) {
        updates[key] = req.body[key];
      }
    }

    if (Number.isNaN(id)) {
      return res.status(400).json({ error: "Invalid id (must be a number" });
    }

    if (!updates) {
      return res.status(400).json({ error: "Updates cannot be empty" });
    }

    if (updates.price !== undefined && updates.price !== null) {
      updates.price = Number(updates.price);
      if (Number.isNaN(updates.price)) {
        return res.status(400).json({ error: "price must be a number" });
      }
    }

    if (updates.rating !== undefined && updates.rating !== null) {
      updates.rating = Number(updates.rating);
      if (Number.isNaN(updates.rating)) {
        return res.status(400).json({ error: "rating must be a number" });
      }
      if (updates.rating < 0 || updates.rating > 5) {
        return res
          .status(400)
          .json({ error: "rating must be between 0 and 5" });
      }
    }

    if (
      updates.warranty_years !== undefined &&
      updates.warranty_years !== null
    ) {
      updates.warranty_years = parseInt(updates.warranty_years, 10);
      if (Number.isNaN(updates.warranty_years) || updates.warranty_years < 0) {
        return res
          .status(400)
          .json({ error: "warranty_years must be a non-negative integer" });
      }
    }

    if (updates.available !== undefined && updates.available !== null) {
      // accepte true/false ou "true"/"false"
      updates.available =
        updates.available === true || updates.available === "true";
    }

    const result = await db
      .collection("products")
      .updateOne({ _id: id }, { $set: updates });

    if (!result) res.status(500).json({ error: "Failed to update" });
    return res.status(200).json(result);
  } catch (err) {
    return next(err);
  }
};

// Module pour supprimer un produit
module.exports.deleteProduct = async (req, res, next) => {
  try {
    const db = getDB();
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({ error: "Invalid id (must be a number)" });
    }

    const result = await db.collection("products").deleteOne({ _id: id });

    if (!result) res.status(404).json({ error: "Not found" });
    return res.status(200).json(result);
  } catch (err) {
    return next(err);
  }
};
