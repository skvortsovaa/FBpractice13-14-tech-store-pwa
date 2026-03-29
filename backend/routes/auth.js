const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { nanoid } = require("nanoid");

const users = require("../data/users");
const authJwt = require("../middleware/authJwt");
const {
  REFRESH_SECRET,
  generateAccessToken,
  generateRefreshToken,
} = require("../utils/tokens");
const {
  validateRegisterPayload,
  validateLoginPayload,
} = require("../utils/validators");

const router = express.Router();

let refreshTokens = [];

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Регистрация пользователя
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: Пользователь успешно зарегистрирован
 *       400:
 *         description: Ошибка валидации
 *       409:
 *         description: Пользователь уже существует
 */
router.post("/register", async (req, res) => {
  const errors = validateRegisterPayload(req.body);

  if (errors.length) {
    return res.status(400).json({
      error: "Validation error",
      details: errors,
    });
  }

  const email = req.body.email.trim().toLowerCase();
  const password = req.body.password;

  const existingUser = users.find((user) => user.email === email);

  if (existingUser) {
    return res.status(409).json({ message: "Пользователь уже существует" });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const newUser = {
    id: nanoid(6),
    email,
    passwordHash,
    role: "user",
  };

  users.push(newUser);

  res.status(201).json({
    message: "Пользователь успешно зарегистрирован",
    user: {
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
    },
  });
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Вход пользователя
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Успешный вход
 *       400:
 *         description: Ошибка валидации
 *       401:
 *         description: Неверный email или пароль
 */
router.post("/login", async (req, res) => {
  const errors = validateLoginPayload(req.body);

  if (errors.length) {
    return res.status(400).json({
      error: "Validation error",
      details: errors,
    });
  }

  const email = req.body.email.trim().toLowerCase();
  const password = req.body.password;

  const user = users.find((u) => u.email === email);

  if (!user) {
    return res.status(401).json({ message: "Неверный email или пароль" });
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

  if (!isPasswordValid) {
    return res.status(401).json({ message: "Неверный email или пароль" });
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  refreshTokens.push(refreshToken);

  res.json({
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
  });
});

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Обновление access token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RefreshRequest'
 *     responses:
 *       200:
 *         description: Новый access token выдан
 *       401:
 *         description: Refresh token отсутствует
 *       403:
 *         description: Refresh token недействителен
 */
router.post("/refresh", (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ message: "Refresh token отсутствует" });
  }

  if (!refreshTokens.includes(refreshToken)) {
    return res.status(403).json({ message: "Refresh token недействителен" });
  }

  try {
    const decoded = jwt.verify(refreshToken, REFRESH_SECRET);

    const accessToken = generateAccessToken(decoded);

    res.json({ accessToken });
  } catch (error) {
    return res.status(403).json({ message: "Refresh token истёк или недействителен" });
  }
});

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Выход пользователя
 *     tags: [Auth]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RefreshRequest'
 *     responses:
 *       200:
 *         description: Выход выполнен
 */
router.post("/logout", (req, res) => {
  const { refreshToken } = req.body;

  if (refreshToken) {
    refreshTokens = refreshTokens.filter((token) => token !== refreshToken);
  }

  res.json({ message: "Выход выполнен" });
});

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Получить текущего пользователя
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Данные текущего пользователя
 *       401:
 *         description: Токен отсутствует или недействителен
 */
router.get("/me", authJwt, (req, res) => {
  const user = users.find((u) => u.id === req.user.id);

  if (!user) {
    return res.status(404).json({ message: "Пользователь не найден" });
  }

  res.json({
    id: user.id,
    email: user.email,
    role: user.role,
  });
});

module.exports = router;