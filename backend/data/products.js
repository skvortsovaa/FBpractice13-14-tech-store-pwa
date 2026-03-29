const { nanoid } = require("nanoid");

const products = [
  {
    id: nanoid(6),
    name: "Компьютерная мышь",
    category: "Периферия",
    description: "Эргономичная форма, точный сенсор.",
    price: 1490,
    stock: 34,
    rating: 4.6,
    image: "/img/p1.jpg",
  },
  {
    id: nanoid(6),
    name: "Клавиатура механическая",
    category: "Периферия",
    description: "Переключатели Blue, подсветка, anti-ghosting.",
    price: 4990,
    stock: 12,
    rating: 4.7,
    image: "/img/p2.jpg",
  },
  {
    id: nanoid(6),
    name: "Наушники",
    category: "Аудио",
    description: "Закрытые, чистый звук, микрофон.",
    price: 3590,
    stock: 18,
    rating: 4.4,
    image: "/img/p3.jpg",
  },
  {
    id: nanoid(6),
    name: 'Монитор 24" IPS',
    category: "Мониторы",
    description: "1920x1080, 75Hz, IPS матрица.",
    price: 12990,
    stock: 9,
    rating: 4.5,
    image: "/img/p4.jpg",
  },
];

module.exports = products;