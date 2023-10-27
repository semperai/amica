import { KnownIconType } from "@charcoal-ui/icons";
import { useState, ButtonHTMLAttributes } from "react";
type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

export const SecretTextInput = ({
  value,
  onChange,
  ...rest
}: Props) => {
  const [inputType, setInputType] = useState("password");
  return (
    <>
      <input
        className="w-col-span-4 text-ellipsis rounded-8 bg-surface1 px-16 py-8 hover:bg-surface1-hover"
        type={inputType}
        placeholder="sk-..."
        value={value}
        onChange={onChange}
      />
      
      <button
        className={`bg-secondary hover:bg-secondary-hover active:bg-secondary-press disabled:bg-secondary-disabled text-white rounded-oval text-xs p-4 text-center items-center inline-block ml-4 pt-2 pb-0`}
        onClick={() => {
          setInputType(inputType === "password" ? "text" : "password");
        }}
      >
        <pixiv-icon name={inputType === "password" ? "24/Show" : "24/Hide"} scale="1"></pixiv-icon>
      </button>
    </>
  );
};

