import React from "react";
import classNames from "classnames";
import { Button, ButtonProps } from "primereact/button";
import "./buttonChip.scss";

export type ButtonchipSentiment =
  | "accent"
  | "danger"
  | "warning"
  | "success"
  | "info"
  | "neutral"
  | "subtle"
  | "outline";

export type ButtonchipSize = "small" | "medium" | "large";

export type ButtonchipIconPosition =
  | "text-and-icon"
  | "text-only"
  | "icon-only";

export interface ButtonChipProps
  extends Omit<ButtonProps, "size" | "outlined" | "severity"> {
  sentiment?: ButtonchipSentiment;
  chipSize?: ButtonchipSize;
  iconPosition?: ButtonchipIconPosition;
  /** false — палитра «inactiv» из Figma (например фильтр выкл.). */
  active?: boolean;
}

export const ButtonChip: React.FC<ButtonChipProps> = ({
  sentiment = "accent",
  chipSize = "medium",
  iconPosition = "text-and-icon",
  active = true,
  className,
  iconPos = "right",
  icon,
  label,
  disabled,
  ...rest
}) => {
  const resolvedSize: ButtonchipSize =
    sentiment === "outline" ? "large" : chipSize;

  const showIcon = iconPosition !== "text-only" && Boolean(icon);
  const showLabel = iconPosition !== "icon-only";

  return (
    <Button
      outlined={false}
      disabled={disabled}
      icon={showIcon ? icon : undefined}
      iconPos={iconPos}
      label={showLabel ? label : undefined}
      className={classNames(
        "uikit-buttonchip",
        `uikit-buttonchip--sentiment-${sentiment}`,
        `uikit-buttonchip--size-${resolvedSize === "small" ? "sm" : resolvedSize === "large" ? "lg" : "md"}`,
        `uikit-buttonchip--layout-${iconPosition}`,
        iconPos === "left" && "uikit-buttonchip--icon-start",
        { "is-muted": !active },
        className
      )}
      {...rest}
    />
  );
};
