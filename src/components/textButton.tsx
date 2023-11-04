import { ButtonHTMLAttributes } from "react";
type Props = ButtonHTMLAttributes<HTMLButtonElement>;

export const TextButton = (props: Props) => {
  return (
    <button
      {...props}
      className={`px-4 py-2 text-white font-bold bg-primary hover:bg-primary-hover active:bg-primary-press-press disabled:bg-primary-disabled rounded-lg ${props.className}`}
    >
      {props.children}
    </button>
  );
};
