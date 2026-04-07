import React from "react";
import classNames from "classnames";
import { SearchField } from "uikit";

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
  <SearchField
    wrapClassName={classNames("hm-search-field", {
      "hm-search-field--toolbar": variant === "toolbar",
    })}
    inputClassName="hm-search-field__input p-inputtext"
    iconClassName="hm-search-field__icon"
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    id={id}
    aria-label={ariaLabel}
  />
);
