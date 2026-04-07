import React from "react";
import { Search } from "lucide-react";
import { InputText } from "primereact/inputtext";
import classNames from "classnames";

export interface HmSearchFieldProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  /** Layout: фиксированная ширина в тулбаре монитора */
  variant?: "toolbar" | "flex";
  id?: string;
  "aria-label"?: string;
}

export const HmSearchField: React.FC<HmSearchFieldProps> = ({
  value,
  onChange,
  placeholder = "Поиск",
  variant = "flex",
  id,
  "aria-label": ariaLabel,
}) => (
  <div
    className={classNames("hm-search-field", {
      "hm-search-field--toolbar": variant === "toolbar",
    })}
  >
    <InputText
      id={id}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="hm-search-field__input"
      aria-label={ariaLabel}
    />
    <span className="hm-search-field__icon" aria-hidden>
      <Search size={16} strokeWidth={2} />
    </span>
  </div>
);
