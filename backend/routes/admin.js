const express = require("express");

const users = require("../data/users");
const authJwt = require("../middleware/authJwt");
const requireRole = require("../middleware/requireRole");

const router = express.Router();

function mapUser(user) {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
  };
}

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Получить список пользователей
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Список пользователей
 *       401:
 *         description: Не авторизован
 *       403:
 *         description: Недостаточно прав
 */
router.get("/users", authJwt, requireRole(["admin"]), (req, res) => {
  res.json(users.map(mapUser));
});

/**
 * @swagger
 * /api/admin/users/{id}:
 *   get:
 *     summary: Получить пользователя по id
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Пользователь найден
 *       401:
 *         description: Не авторизован
 *       403:
 *         description: Недостаточно прав
 *       404:
 *         description: Пользователь не найден
 */
router.get("/users/:id", authJwt, requireRole(["admin"]), (req, res) => {
  const user = users.find((u) => u.id === req.params.id);

  if (!user) {
    return res.status(404).json({ message: "Пользователь не найден" });
  }

  res.json(mapUser(user));
});

/**
 * @swagger
 * /api/admin/users/{id}:
 *   patch:
 *     summary: Изменить роль пользователя
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Роль пользователя обновлена
 *       400:
 *         description: Некорректная роль
 *       401:
 *         description: Не авторизован
 *       403:
 *         description: Недостаточно прав
 *       404:
 *         description: Пользователь не найден
 */
router.patch("/users/:id", authJwt, requireRole(["admin"]), (req, res) => {
  const user = users.find((u) => u.id === req.params.id);

  if (!user) {
    return res.status(404).json({ message: "Пользователь не найден" });
  }

  const { role } = req.body;

  if (!role || !["user", "admin"].includes(role)) {
    return res.status(400).json({ message: "Роль должна быть user или admin" });
  }

  user.role = role;

  res.json({
    message: "Роль пользователя обновлена",
    user: mapUser(user),
  });
});

/**
 * @swagger
 * /api/admin/users/{id}:
 *   delete:
 *     summary: Удалить пользователя
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Пользователь удален
 *       401:
 *         description: Не авторизован
 *       403:
 *         description: Недостаточно прав
 *       404:
 *         description: Пользователь не найден
 */
router.delete("/users/:id", authJwt, requireRole(["admin"]), (req, res) => {
  const index = users.findIndex((u) => u.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ message: "Пользователь не найден" });
  }

  users.splice(index, 1);

  res.json({ message: "Пользователь удален" });
});

module.exports = router;