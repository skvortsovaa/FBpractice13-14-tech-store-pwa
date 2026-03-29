const express = require("express");
const { nanoid } = require("nanoid");

const products = require("../data/products");
const authJwt = require("../middleware/authJwt");
const requireRole = require("../middleware/requireRole");
const { validateProductPayload } = require("../utils/validators");

const router = express.Router();

function findProductById(id) {
  return products.find((product) => product.id === id);
}

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Получить список товаров
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Список товаров
 */
router.get("/", (req, res) => {
  res.json(products);
});

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Получить товар по id
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Товар найден
 *       404:
 *         description: Товар не найден
 */
router.get("/:id", (req, res) => {
  const product = findProductById(req.params.id);

  if (!product) {
    return res.status(404).json({ error: "Товар не найден" });
  }

  res.json(product);
});

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Создать товар
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Товар создан
 *       400:
 *         description: Ошибка валидации
 *       401:
 *         description: Не авторизован
 *       403:
 *         description: Недостаточно прав
 */
router.post("/", authJwt, requireRole(["admin"]), (req, res) => {
  const errors = validateProductPayload(req.body, { partial: false });

  if (errors.length) {
    return res.status(400).json({
      error: "Validation error",
      details: errors,
    });
  }

  const newProduct = {
    id: nanoid(6),
    name: req.body.name.trim(),
    category: req.body.category.trim(),
    description: req.body.description.trim(),
    price: req.body.price,
    stock: req.body.stock,
    rating: req.body.rating ?? null,
    image: req.body.image?.trim() ? req.body.image.trim() : null,
  };

  products.push(newProduct);

  res.status(201).json(newProduct);
});

/**
 * @swagger
 * /api/products/{id}:
 *   patch:
 *     summary: Обновить товар
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Товар обновлен
 *       400:
 *         description: Ошибка валидации
 *       401:
 *         description: Не авторизован
 *       403:
 *         description: Недостаточно прав
 *       404:
 *         description: Товар не найден
 */
router.patch("/:id", authJwt, requireRole(["admin"]), (req, res) => {
  const product = findProductById(req.params.id);

  if (!product) {
    return res.status(404).json({ error: "Товар не найден" });
  }

  if (
    req.body?.name === undefined &&
    req.body?.category === undefined &&
    req.body?.description === undefined &&
    req.body?.price === undefined &&
    req.body?.stock === undefined &&
    req.body?.rating === undefined &&
    req.body?.image === undefined
  ) {
    return res.status(400).json({ error: "Нет полей для обновления" });
  }

  const errors = validateProductPayload(req.body, { partial: true });

  if (errors.length) {
    return res.status(400).json({
      error: "Validation error",
      details: errors,
    });
  }

  if (req.body.name !== undefined) product.name = req.body.name.trim();
  if (req.body.category !== undefined) product.category = req.body.category.trim();
  if (req.body.description !== undefined) product.description = req.body.description.trim();
  if (req.body.price !== undefined) product.price = req.body.price;
  if (req.body.stock !== undefined) product.stock = req.body.stock;
  if (req.body.rating !== undefined) product.rating = req.body.rating;
  if (req.body.image !== undefined) {
    product.image = req.body.image?.trim() ? req.body.image.trim() : null;
  }

  res.json(product);
});

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Удалить товар
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: Товар удален
 *       401:
 *         description: Не авторизован
 *       403:
 *         description: Недостаточно прав
 *       404:
 *         description: Товар не найден
 */
router.delete("/:id", authJwt, requireRole(["admin"]), (req, res) => {
  const index = products.findIndex((product) => product.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: "Товар не найден" });
  }

  products.splice(index, 1);

  res.status(204).send();
});

module.exports = router;