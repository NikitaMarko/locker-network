import React from "react";
import "./Input.scss";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
}

export const Input: React.FC<InputProps> = ({ label, ...rest }) => {
    return (
        <div className="ui-input">
            {label && <label className="ui-input__label">{label}</label>}
            <input className="ui-input__field" {...rest} />
        </div>
    );
};

export default Input;
