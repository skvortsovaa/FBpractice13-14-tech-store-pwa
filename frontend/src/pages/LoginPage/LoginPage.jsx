import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../api";
import "./LoginPage.scss";

export default function LoginPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);
      await api.login(form.email, form.password);
      navigate("/");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Ошибка входа");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="authPage">
      <div className="authCard">
        <div className="authCard__top">
          <div className="authCard__brand">Tech Store</div>
          <h1 className="authCard__title">Вход</h1>
          <p className="authCard__subtitle">
            Войдите в аккаунт для работы с товарами и личным профилем
          </p>
        </div>

        <form className="authForm" onSubmit={onSubmit}>
          <label className="authField">
            <span>Email</span>
            <input
              type="email"
              name="email"
              placeholder="user@mail.com"
              value={form.email}
              onChange={onChange}
              required
            />
          </label>

          <label className="authField">
            <span>Пароль</span>
            <input
              type="password"
              name="password"
              placeholder="Введите пароль"
              value={form.password}
              onChange={onChange}
              required
            />
          </label>

          {error && <div className="authError">{error}</div>}

          <button className="authBtn authBtn--primary" type="submit" disabled={loading}>
            {loading ? "Вход..." : "Войти"}
          </button>
        </form>

        <div className="authCard__bottom">
          <span>Нет аккаунта?</span>
          <Link to="/register" className="authLink">
            Зарегистрироваться
          </Link>
        </div>

        <div className="authHint">
          Тестовый администратор: <b>admin@mail.com</b> / <b>123456</b>
        </div>
      </div>
    </div>
  );
}