import { useState, useEffect } from "react";
import { clsx } from "clsx";

type Option = {
  label: string;
  value: string;
};

type Props = {
  options: Option[];
  selectedValue: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

export const RadioBox = ({ options, selectedValue, onChange, disabled = false }: Props) => {
  const [selected, setSelected] = useState(selectedValue);

  useEffect(() => {
    setSelected(selectedValue);
  }, [selectedValue]);

  return (
    <div className="flex space-x-2">
      {options.map((option) => (
        <button
          key={option.value}
          className={clsx(
            "px-4 py-2 rounded-lg border-2 text-sm font-medium transition",
            selected === option.value ? "border-indigo-600 bg-indigo-100" : "border-gray-300 bg-white",
            disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-200"
          )}
          onClick={() => {
            if (!disabled) {
              setSelected(option.value);
              onChange(option.value);
            }
          }}
          disabled={disabled}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};
