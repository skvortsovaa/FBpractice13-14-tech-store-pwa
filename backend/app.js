const express = require("express");
const path = require("path");
const cors = require("cors");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const authRoutes = require("./routes/auth");
const productsRoutes = require("./routes/products");
const adminRoutes = require("./routes/admin");

const app = express();
const port = 3000;

app.use(express.json());

app.use(
  cors({
    origin: ["http://localhost:3001", "http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use("/img", express.static(path.join(__dirname, "img")));

app.use((req, res, next) => {
  res.on("finish", () => {
    console.log(
      `[${new Date().toISOString()}] [${req.method}] ${res.statusCode} ${req.path}`
    );
    if (["POST", "PUT", "PATCH"].includes(req.method)) {
      console.log("Body:", req.body);
    }
  });
  next();
});

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API интернет-магазина",
      version: "1.0.0",
      description:
        "API для регистрации, авторизации, работы с товарами и администрирования пользователей",
    },
    servers: [
      {
        url: `http://localhost:${port}`,
        description: "Локальный сервер",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        RegisterRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", example: "user@mail.com" },
            password: { type: "string", example: "123456" },
          },
        },
        LoginRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", example: "admin@mail.com" },
            password: { type: "string", example: "123456" },
          },
        },
        RefreshRequest: {
          type: "object",
          required: ["refreshToken"],
          properties: {
            refreshToken: { type: "string" },
          },
        },
        Product: {
          type: "object",
          required: ["name", "category", "description", "price", "stock"],
          properties: {
            id: { type: "string" },
            name: { type: "string" },
            category: { type: "string" },
            description: { type: "string" },
            price: { type: "number" },
            stock: { type: "integer" },
            rating: { type: "number", nullable: true },
            image: { type: "string", nullable: true },
          },
        },
        ProductCreateRequest: {
          type: "object",
          required: ["name", "category", "description", "price", "stock"],
          properties: {
            name: { type: "string", example: "Игровая мышь" },
            category: { type: "string", example: "Периферия" },
            description: { type: "string", example: "Удобная игровая мышь" },
            price: { type: "number", example: 2990 },
            stock: { type: "integer", example: 15 },
            rating: { type: "number", example: 4.5 },
            image: { type: "string", example: "/img/p1.jpg" },
          },
        },
        User: {
          type: "object",
          properties: {
            id: { type: "string" },
            email: { type: "string" },
            role: { type: "string", example: "user" },
          },
        },
        UpdateUserRoleRequest: {
          type: "object",
          required: ["role"],
          properties: {
            role: {
              type: "string",
              enum: ["user", "admin"],
              example: "admin",
            },
          },
        },
        AuthResponse: {
          type: "object",
          properties: {
            accessToken: { type: "string" },
            refreshToken: { type: "string" },
            user: {
              $ref: "#/components/schemas/User",
            },
          },
        },
      },
    },
  },
  apis: ["./app.js", "./routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @swagger
 * /:
 *   get:
 *     summary: Проверка работы сервера
 *     tags: [Service]
 *     responses:
 *       200:
 *         description: Сервер работает
 */
app.get("/", (req, res) => {
  res.json({
    message: "Backend is running",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/admin", adminRoutes);

app.use((req, res) => {
  res.status(404).json({ error: "Маршрут не найден" });
});

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Внутренняя ошибка сервера" });
});

app.listen(port, () => {
  console.log(`Backend started: http://localhost:${port}`);
  console.log(`Swagger docs: http://localhost:${port}/api-docs`);
});