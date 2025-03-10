import { useState , useEffect } from "react";
import { Switch } from '@headlessui/react'
import { clsx } from "clsx";

type Props = {
  value: boolean;
  label: string;
  onChange: (value: boolean) => void;
  disabled?: boolean; // Add disabled prop
};

export const SwitchBox = ({
  value,
  label,
  onChange,
  disabled = false, // Default to not disabled
  ...rest
}: Props) => {
  const [enabled, setEnabled] = useState(value);

  // Synchronize enabled state with the incoming value prop
  useEffect(() => {
    setEnabled(value);
  }, [value]);

  return (
    <Switch.Group as="div" className="flex items-center">
      <Switch
        checked={enabled}
        onChange={(checked: boolean) => {
          if (!disabled) { // Prevent state change if disabled
            setEnabled(checked);
            onChange(checked);
          }
        }}
        className={clsx(
          disabled ? 'bg-gray-300 cursor-not-allowed' : enabled ? 'bg-indigo-600' : 'bg-gray-200',
          'relative ml-2 inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none',
          disabled && 'pointer-events-none' // Disable pointer events when disabled
        )}
        disabled={disabled} // Set the disabled prop on Switch
        {...rest}
      >
        <span className="sr-only">Use setting</span>
        <span
          className={clsx(
            enabled ? 'translate-x-5' : 'translate-x-0',
            'pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out'
          )}
        >
          <span
            className={clsx(
              enabled ? 'opacity-0 duration-100 ease-out' : 'opacity-100 duration-200 ease-in',
              'absolute inset-0 flex h-full w-full items-center justify-center transition-opacity'
            )}
            aria-hidden="true"
          >
            <svg className="h-3 w-3 text-gray-400" fill="none" viewBox="0 0 12 12">
              <path
                d="M4 8l2-2m0 0l2-2M6 6L4 4m2 2l2 2"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span
            className={clsx(
              enabled ? 'opacity-100 duration-200 ease-in' : 'opacity-0 duration-100 ease-out',
              'absolute inset-0 flex h-full w-full items-center justify-center transition-opacity'
            )}
            aria-hidden="true"
          >
            <svg className="h-3 w-3 text-indigo-600" fill="currentColor" viewBox="0 0 12 12">
              <path d="M3.707 5.293a1 1 0 00-1.414 1.414l1.414-1.414zm1.414 2l-.707.707a1 1 0 001.414 0L5 8zm4.707-3.293a1 1 0 00-1.414-1.414l1.414 1.414zm-7.414 2l2 2 1.414-1.414-2-2-1.414 1.414zm3.414 2l4-4-1.414-1.414-4 4 1.414 1.414z" />
            </svg>
          </span>
        </span>
      </Switch>
      <Switch.Label as="span" className="ml-3 text-sm">
        <span className="font-medium text-gray-900 whitespace-nowrap">{label}</span>
      </Switch.Label>
    </Switch.Group>
  );
};

interface VerticalProps {
  value: boolean;
  label: string;
  onChange: (checked: boolean) => void;
  [key: string]: any; // Additional props
}

export const VerticalSwitchBox = ({
  value,
  label,
  onChange,
  ...rest
}: VerticalProps) => {
  const [enabled, setEnabled] = useState(value);

  useEffect(() => {
    setEnabled(value);
  }, [value]);

  const handleChange = (checked: boolean) => {
    setEnabled(checked);
    onChange(checked);
  };

  return (
    <Switch.Group as="div" className="flex flex-col items-center">
      <Switch
        checked={enabled}
        onChange={handleChange}
        className={clsx(
          enabled ? 'bg-gray-400' : 'bg-gray-200',
          'relative inline-flex h-8 w-4 items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-200 focus:ring-offset-2'
        )}
        {...rest}
      >
        <span className="sr-only">{label}</span>
        <span
          className={clsx(
            enabled ? '-translate-y-2' : 'translate-y-2',
            'inline-block h-3 w-3 transform rounded-full bg-white shadow ring-0 transition-transform duration-200 ease-in-out'
          )}
        >
          <span
            className={clsx(
              enabled ? 'opacity-0' : 'opacity-100',
              'absolute inset-0 flex h-full w-full items-center justify-center transition-opacity duration-200'
            )}
            aria-hidden="true"
          >
            {/* Off Icon */}
            <svg className="h-3 w-3 text-gray-400" fill="none" viewBox="0 0 12 12">
              <path
                d="M4 8l2-2m0 0l2-2M6 6L4 4m2 2l2 2"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span
            className={clsx(
              enabled ? 'opacity-100' : 'opacity-0',
              'absolute inset-0 flex h-full w-full items-center justify-center transition-opacity duration-200'
            )}
            aria-hidden="true"
          >
            {/* On Icon */}
            <svg className="h-3 w-3 text-gray-600" fill="currentColor" viewBox="0 0 12 12">
              <path d="M3.707 5.293a1 1 0 00-1.414 1.414l1.414-1.414zM5 8l-.707.707a1 1 0 001.414 0L5 8zm4.707-3.293a1 1 0 00-1.414-1.414l1.414 1.414zm-7.414 2l2 2 1.414-1.414-2-2-1.414 1.414zm3.414 2l4-4-1.414-1.414-4 4 1.414 1.414z" />
            </svg>
          </span>
        </span>
      </Switch>
      <Switch.Label as="span" className="text-sm font-medium text-gray-900">
        {label}
      </Switch.Label>
    </Switch.Group>
  );
}