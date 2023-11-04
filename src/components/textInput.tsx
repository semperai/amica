type Props = {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

export const TextInput = ({
  value,
  onChange,
  ...rest
}: Props) => {
  return (
    <input
      className="w-col-span-4 text-ellipsis rounded-md bg-surface1 px-2 py-2 hover:bg-surface1-hover"
      type="text"
      value={value}
      onChange={onChange}
      {...rest}
    />
  );
};
