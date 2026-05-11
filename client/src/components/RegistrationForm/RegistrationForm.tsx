import { FormEvent, useState } from "react";
import styles from "./RegistrationForm.module.css"

export type RegistrationFormData = {
  login: string;
  password: string;
  fullName: string;
  phone: string;
}

type FormProps = {
  onSubmit: (data: RegistrationFormData) => void;
}

export default function RegistrationForm({onSubmit}: FormProps) {
  const [login, setLogin] = useState("");
  const [loginError, setLoginError] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [fullName, setFullName] = useState("");
  const [fullNameError, setFullNameError] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");

  const isValid = (): boolean => {
    let result = true;

    setLoginError("");
    setFullNameError("");
    setPhoneError("");

    if (!/^([a-z0-9]{6,20})$/.test(login)) {
      setLoginError("Логин должен содержать от 6 до 20 символов латинского алфавита и цифры.");
      result = false;
    }

    if (login.length === 0) {
      setLoginError("Логин не может быть пустым.");
      result = false;
    }

    setPasswordError("");

    if (password.length === 0) {
      setPasswordError("Пароль не может быть пустым.");
      result = false;
    }

    if (fullName.trim().length === 0) {
      setFullNameError("Укажите ФИО.");
      result = false;
    }

    if (phone.trim().length === 0) {
      setPhoneError("Укажите номер телефона.");
      result = false;
    }

    return result;
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isValid()) {
      onSubmit({
        login,
        password,
        fullName: fullName.trim(),
        phone: phone.trim()
      });
    }
  };

  return <>
    <h3>Регистрация</h3>
    <form onSubmit={handleSubmit}>
      <div>
        <label>ФИО:
          <input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Иванов Иван Иванович"/>
        </label>
        {fullNameError && <div className={styles.error}>
          {fullNameError}
        </div>}
      </div>
      <div>
        <label>Телефон:
          <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+7 (999) 123-45-67"/>
        </label>
        {phoneError && <div className={styles.error}>
          {phoneError}
        </div>}
      </div>
      <div>
        <label>Логин:
          <input value={login} onChange={e => setLogin(e.target.value)}/>
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
      <button type="submit">Зарегистрироваться</button>
    </form>
  </>;
}