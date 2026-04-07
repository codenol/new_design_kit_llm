import React from "react";
import { Search } from "lucide-react";
import { InputText } from "primereact/inputtext";
import classNames from "classnames";

export interface SearchFieldProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  id?: string;
  "aria-label"?: string;
  /** Обёртка (например `uikit-drawer-body__search-wrap` или `hm-search-field`). */
  wrapClassName?: string;
  /** Класс для `InputText` (например `uikit-drawer-body__search` или `hm-search-field__input`). */
  inputClassName: string;
  iconClassName: string;
}

/**
 * Общее поле поиска: Prime InputText + иконка лупы.
 * Стили задаются снаружи классами (дроер, health monitor и т.д.).
 */
export const SearchField: React.FC<SearchFieldProps> = ({
  value,
  onChange,
  placeholder = "Поиск",
  id,
  "aria-label": ariaLabel,
  wrapClassName,
  inputClassName,
  iconClassName,
}) => (
  <div className={classNames(wrapClassName)}>
    <InputText
      id={id}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={inputClassName}
      aria-label={ariaLabel}
    />
    <span className={iconClassName} aria-hidden>
      <Search size={16} strokeWidth={2} />
    </span>
  </div>
);
