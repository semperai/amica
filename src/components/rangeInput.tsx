import { useTranslation } from 'react-i18next';

type RangeProps = {
  min: number;
  max: number;
  minChange?: (event: React.ChangeEvent<HTMLInputElement>, type: 'min') => void;
  maxChange?: (event: React.ChangeEvent<HTMLInputElement>, type: 'max') => void;
};

export const RangeInput = ({
  min,
  max,
  minChange,
  maxChange,
}: RangeProps) => {
  const { t } = useTranslation();

  const handleMinChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (minChange) minChange(event, 'min');
  };

  const handleMaxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (maxChange) maxChange(event, 'max');
  };

  return (
    <div className="flex space-x-2">
      <label className="flex items-center">
        <span className="mr-2 block text-small font-medium leading-6 text-gray-900">{`${t("Min")}`}</span>
        <input
          className="w-32 block rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-gray-400 sm:text-sm sm:leading-6"
          type="number"
          value={min}
          onChange={handleMinChange}
          placeholder="Min"
          min={0}
          max={max - 1}
        />
      </label>
      <label className="flex items-center">
        <span className="mr-2 block text-small font-medium leading-6 text-gray-900">{`${t("Max")}`}</span>
        <input
          className="w-32 block rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-gray-400 sm:text-sm sm:leading-6"
          type="number"
          value={max}
          onChange={handleMaxChange}
          placeholder="Max"
          min={min + 1}
          max={3600}
        />
      </label>
    </div>
  );
};
