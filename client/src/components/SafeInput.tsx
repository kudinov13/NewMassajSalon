import React, { InputHTMLAttributes, useEffect, useId, useRef } from "react";

const EXTENSION_IGNORE = {
  "data-lpignore": "true",
  "data-1p-ignore": true,
  "data-bwignore": true,
  "data-protonpass-ignore": true,
  "data-form-type": "other",
  "data-yandex-parsed": "false",
} as const;

type SafeInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "value" | "defaultValue" | "onChange" | "readOnly"
> & {
  name: string;
};

/**
 * Поле ввода без React state — устойчиво к конфликтам
 * с менеджерами паролей (Яндекс, LastPass и др.).
 */
const SafeInput: React.FC<SafeInputProps> = ({
  name,
  className,
  autoComplete = "off",
  type = "text",
  id,
  onFocus,
  ...rest
}) => {
  const generatedId = useId();
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      ref.current?.removeAttribute("readonly");
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  const unlock = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.removeAttribute("readonly");
    onFocus?.(e);
  };

  return (
    <input
      {...EXTENSION_IGNORE}
      {...rest}
      ref={ref}
      id={id ?? generatedId}
      name={name}
      type={type}
      defaultValue=""
      autoComplete={autoComplete}
      readOnly
      onFocus={unlock}
      className={className}
    />
  );
};

export default SafeInput;
