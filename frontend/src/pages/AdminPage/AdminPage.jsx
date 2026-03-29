import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, apiClient } from "../../api";
import "./AdminPage.scss";

export default function AdminPage() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState("");

  const loadUsers = async () => {
    try {
      setLoading(true);
      const { data } = await apiClient.get("/api/admin/users");
      setUsers(data);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Ошибка загрузки пользователей");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const logout = async () => {
    await api.logout();
    navigate("/login");
  };

  const handleChangeRole = async (id, nextRole) => {
    try {
      setActionLoadingId(id);
      await apiClient.patch(`/api/admin/users/${id}`, { role: nextRole });
      await loadUsers();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Ошибка изменения роли");
    } finally {
      setActionLoadingId("");
    }
  };

  const handleDelete = async (id, email) => {
    const ok = window.confirm(`Удалить пользователя ${email}?`);
    if (!ok) return;

    try {
      setActionLoadingId(id);
      await apiClient.delete(`/api/admin/users/${id}`);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Ошибка удаления пользователя");
    } finally {
      setActionLoadingId("");
    }
  };

  return (
    <div className="adminPage">
      <header className="adminHeader">
        <div className="adminHeader__inner">
          <div>
            <div className="adminHeader__brand">Tech Store</div>
            <h1 className="adminHeader__title">Панель администратора</h1>
          </div>

          <div className="adminHeader__actions">
            <Link to="/" className="adminBtn adminBtn--ghost">
              К товарам
            </Link>
            <button className="adminBtn" onClick={logout}>
              Выйти
            </button>
          </div>
        </div>
      </header>

      <main className="adminMain">
        <div className="adminContainer">
          <div className="adminCard">
            <div className="adminCard__top">
              <div>
                <h2 className="adminCard__title">Пользователи</h2>
                <p className="adminCard__subtitle">
                  Управление ролями и удаление аккаунтов
                </p>
              </div>
            </div>

            {loading ? (
              <div className="adminEmpty">Загрузка пользователей...</div>
            ) : users.length === 0 ? (
              <div className="adminEmpty">Пользователи не найдены</div>
            ) : (
              <div className="adminTableWrap">
                <table className="adminTable">
                  <thead>
                    <tr>
                      <th>Email</th>
                      <th>Роль</th>
                      <th>Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td>{user.email}</td>
                        <td>
                          <span
                            className={
                              user.role === "admin"
                                ? "roleBadge roleBadge--admin"
                                : "roleBadge roleBadge--user"
                            }
                          >
                            {user.role}
                          </span>
                        </td>
                        <td>
                          <div className="adminActions">
                            {user.role !== "admin" ? (
                              <button
                                className="tableBtn tableBtn--blue"
                                disabled={actionLoadingId === user.id}
                                onClick={() => handleChangeRole(user.id, "admin")}
                              >
                                Сделать admin
                              </button>
                            ) : (
                              <button
                                className="tableBtn tableBtn--gray"
                                disabled={actionLoadingId === user.id}
                                onClick={() => handleChangeRole(user.id, "user")}
                              >
                                Сделать user
                              </button>
                            )}

                            <button
                              className="tableBtn tableBtn--danger"
                              disabled={actionLoadingId === user.id}
                              onClick={() => handleDelete(user.id, user.email)}
                            >
                              Удалить
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}