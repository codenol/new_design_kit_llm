import React, { useState } from "react";

import { Button } from "primereact/button";

import { ChevronsUpDown } from "lucide-react";

import classNames from "classnames";

import { SearchField } from "../SearchField";

import "./drawerBody.scss";

export interface DrawerBodyProps {
  /** Значение поля поиска; без `onSearchChange` используется внутреннее состояние. */
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  /** Обработчик кнопки со стрелками (в макете — list-chevrons-down-up). */
  onExpandToggleClick?: () => void;
  expandToggleAriaLabel?: string;
  /** Дополнительные элементы в строке тулбара (между поиском и кнопкой разворота). */
  toolbarExtra?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

export const DrawerBody: React.FC<DrawerBodyProps> = ({
  searchValue: searchValueProp,
  onSearchChange,
  searchPlaceholder = "Поиск",
  onExpandToggleClick,
  expandToggleAriaLabel = "Развернуть или свернуть все",
  toolbarExtra,
  className,
  children,
}) => {
  const [uncontrolledSearch, setUncontrolledSearch] = useState("");
  const controlled = typeof searchValueProp === "string";
  const searchValue = controlled ? searchValueProp : uncontrolledSearch;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    if (controlled) onSearchChange?.(v);
    else setUncontrolledSearch(v);
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleSearchChange(e);
  };

  return (
    <div className={classNames("uikit-drawer-body", className)}>
      <div className="uikit-drawer-body__inner">
        <div className="uikit-drawer-body__toolbar">
          <SearchField
            wrapClassName="uikit-drawer-body__search-wrap"
            inputClassName="uikit-drawer-body__search"
            iconClassName="uikit-drawer-body__search-icon"
            value={searchValue}
            onChange={onInputChange}
            placeholder={searchPlaceholder}
          />
          {toolbarExtra != null ? (
            <div className="uikit-drawer-body__toolbar-extra">{toolbarExtra}</div>
          ) : null}
          <Button
            type="button"
            rounded
            text
            disabled={!onExpandToggleClick}
            className="uikit-drawer-body__expand-btn"
            onClick={onExpandToggleClick ?? undefined}
            aria-label={expandToggleAriaLabel}
          >
            <ChevronsUpDown className="uikit-drawer-body__expand-icon" aria-hidden size={20} strokeWidth={2} />
          </Button>
        </div>
        <div className="uikit-drawer-body__cards">{children}</div>
      </div>
    </div>
  );
};
