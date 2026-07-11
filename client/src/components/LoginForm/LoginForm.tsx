import { FormEvent, useState } from "react";
import styles from "./LoginForm.module.css";

export type LoginFormData = {
  login: string;
  password: string;
}

type FormProps = {
  onSubmit: (data: LoginFormData) => void;
}

export default function LoginForm({onSubmit}: FormProps) {
  const [login, setLogin] = useState("");
  const [loginError, setLoginError] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const isValid = (): boolean => {
    let result = true;

    // очищаем ошибки
    setLoginError("");

    const isLogin = /^[a-z0-9]{6,20}$/.test(login);
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(login);
    const isPhone = /^[\d\-\+\(\)\s]+$/.test(login) && login.replace(/\D/g, '').length >= 6;

    if (!isLogin && !isEmail && !isPhone) {
      setLoginError("Введите логин (6-20 символов), email или номер телефона.");
      result = false;
    }

    if (login.length === 0) {
      setLoginError("Поле не может быть пустым.");
      result = false;
    }

    setPasswordError("");

    if (password.length === 0) {
      setPasswordError("Пароль не может быть пустым.");
      result = false;
    }

    return result;
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isValid()) {
      onSubmit({
        login,
        password
      });
    }
  };

  return <>
    <h3>Вход</h3>
    <form onSubmit={handleSubmit}>
      <div>
        <label>Логин, email или телефон:
          <input value={login} onChange={e => setLogin(e.target.value)} placeholder="Логин, email или телефон"/>
        </label>
        {loginError && <div className={styles.error}>
          {loginError}
        </div>}
      </div>
      <div>
        <label>Пароль:
          <input type="password" value={password} onChange={e => setPassword(e.target.value)}/>
        </label>
        {passwordError && <div className={styles.error}>
          {passwordError}
        </div>}
      </div>
      <button type="submit">Войти</button>
    </form>
  </>;
}