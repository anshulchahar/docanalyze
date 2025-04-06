'use client';

import { Fragment, useState, useEffect, useRef } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';
import { SelectOption } from './CustomSelect';

type MultiSelectProps = {
    options: SelectOption[];
    value: string[];
    onChange: (value: string[]) => void;
    placeholder?: string;
    label?: string;
    required?: boolean;
    id?: string;
    name?: string;
    error?: string;
};

export default function MultiSelect({
    options,
    value,
    onChange,
    placeholder = 'Please select',
    label,
    required = false,
    id,
    name,
    error,
}: MultiSelectProps) {
    const [selectedOptions, setSelectedOptions] = useState<SelectOption[]>([]);
    const listboxRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Find the selected options based on values
        const selected = options.filter(opt => value.includes(opt.value));
        setSelectedOptions(selected);
    }, [value, options]);

    const handleChange = (selectedOptions: SelectOption[]) => {
        setSelectedOptions(selectedOptions);
        onChange(selectedOptions.map(opt => opt.value));
    };

    const toggleOption = (option: SelectOption) => {
        const isSelected = selectedOptions.some(opt => opt.value === option.value);

        if (isSelected) {
            // Remove option
            const filtered = selectedOptions.filter(opt => opt.value !== option.value);
            handleChange(filtered);
        } else {
            // Add option
            handleChange([...selectedOptions, option]);
        }
    };

    return (
        <div className="relative">
            {label && (
                <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    {label}{required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}

            <Listbox value={selectedOptions} onChange={handleChange} multiple ref={listboxRef}>
                <div className="relative">
                    <Listbox.Button
                        className="relative w-full cursor-default rounded-md bg-white dark:bg-[#3A3A3A] py-3 pl-4 pr-10 text-left border border-gray-300 dark:border-[#333333] shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors text-gray-900 dark:text-white"
                        id={id}
                        name={name}
                        aria-required={required}
                        aria-invalid={!!error}
                    >
                        <span className={`block truncate ${selectedOptions.length === 0 ? 'text-gray-500 dark:text-gray-400' : ''}`}>
                            {selectedOptions.length === 0
                                ? placeholder
                                : selectedOptions.length === 1
                                    ? selectedOptions[0].label
                                    : `${selectedOptions.length} items selected`}
                        </span>
                        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                            <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                        </span>
                    </Listbox.Button>

                    <Transition
                        as={Fragment}
                        leave="transition ease-in duration-100"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-[#2C2C2C] py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:ring-[#333333] border dark:border-[#333333]">
                            {options.map((option) => {
                                const isSelected = selectedOptions.some(opt => opt.value === option.value);

                                return (
                                    <div
                                        key={option.value}
                                        onClick={() => toggleOption(option)}
                                        className={`relative cursor-pointer select-none py-2 pl-10 pr-4 ${isSelected ? 'bg-primary/10 dark:bg-primary/20 text-gray-900 dark:text-white' : 'text-gray-900 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#3A3A3A]'
                                            }`}
                                    >
                                        <span
                                            className={`block truncate ${isSelected ? 'font-medium' : 'font-normal'
                                                }`}
                                        >
                                            {option.label}
                                        </span>
                                        <span
                                            className={`absolute inset-y-0 left-0 flex items-center pl-3 ${isSelected ? 'text-primary' : 'text-gray-400 dark:text-gray-500'
                                                }`}
                                        >
                                            {isSelected ? (
                                                <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                            ) : (
                                                <div className="h-5 w-5 border border-gray-300 dark:border-[#333333] rounded" />
                                            )}
                                        </span>
                                    </div>
                                );
                            })}
                        </Listbox.Options>
                    </Transition>
                </div>
            </Listbox>

            {error && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
            )}
        </div>
    );
} 