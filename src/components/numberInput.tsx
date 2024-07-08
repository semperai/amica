type Props = {
  value: number;
  min: number;
  max: number;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

export const NumberInput = ({
  value,
  onChange,
  ...rest
}: Props) => {
  return (
    <input
      className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-gray-400 sm:text-sm sm:leading-6"
      type="number"
      value={value}
      onChange={onChange}
      {...rest}
    />
  );
};


