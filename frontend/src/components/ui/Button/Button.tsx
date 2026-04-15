import React from "react";
import classNames from "classnames";
import "./Button.scss";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "danger";
    size?: "small" | "medium" | "large";
    fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
                                                  children,
                                                  variant = "primary",
                                                  size = "medium",
                                                  fullWidth = false,
                                                  className,
                                                  ...rest
                                              }) => {
    const classes = classNames(
        "ui-button",
        `ui-button--${variant}`,
        `ui-button--${size}`,
        { "ui-button--full": fullWidth },
        className
    );

    return (
        <button className={classes} {...rest}>
            {children}
        </button>
    );
};

export default Button;
