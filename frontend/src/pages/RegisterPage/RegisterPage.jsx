import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../api";
import "./RegisterPage.scss";

export default function RegisterPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const onChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (form.password !== form.confirmPassword) {
      setError("Пароли не совпадают");
      return;
    }

    try {
      setLoading(true);
      const data = await api.register(form.email, form.password);
      setSuccess(data?.message || "Регистрация прошла успешно");

      setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          err.response?.data?.details?.join(", ") ||
          "Ошибка регистрации"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="authPage">
      <div className="authCard">
        <div className="authCard__top">
          <div className="authCard__brand">Tech Store</div>
          <h1 className="authCard__title">Регистрация</h1>
          <p className="authCard__subtitle">
            Создайте новый аккаунт для входа в систему
          </p>
        </div>

        <form className="authForm" onSubmit={onSubmit}>
          <label className="authField">
            <span>Email</span>
            <input
              type="email"
              name="email"
              placeholder="newuser@mail.com"
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
              placeholder="Минимум 6 символов"
              value={form.password}
              onChange={onChange}
              required
            />
          </label>

          <label className="authField">
            <span>Повторите пароль</span>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Повторите пароль"
              value={form.confirmPassword}
              onChange={onChange}
              required
            />
          </label>

          {error && <div className="authError">{error}</div>}
          {success && <div className="authSuccess">{success}</div>}

          <button className="authBtn authBtn--primary" type="submit" disabled={loading}>
            {loading ? "Регистрация..." : "Зарегистрироваться"}
          </button>
        </form>

        <div className="authCard__bottom">
          <span>Уже есть аккаунт?</span>
          <Link to="/login" className="authLink">
            Войти
          </Link>
        </div>
      </div>
    </div>
  );
}