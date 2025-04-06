'use client';

import { useState } from 'react';
import Navigation from '@/components/Navigation';
import { useSidebar } from '@/contexts/SidebarContext';
import CustomSelect, { SelectOption } from '@/components/CustomSelect';
import MultiSelect from '@/components/MultiSelect';
import { PuzzlePieceIcon } from '@heroicons/react/24/outline';

export default function ComponentsExample() {
    const { isOpen } = useSidebar();

    // Example data for selects
    const colorOptions: SelectOption[] = [
        { value: 'red', label: 'Red' },
        { value: 'blue', label: 'Blue' },
        { value: 'green', label: 'Green' },
        { value: 'yellow', label: 'Yellow' },
        { value: 'purple', label: 'Purple' },
        { value: 'orange', label: 'Orange' },
    ];

    const categoryOptions: SelectOption[] = [
        { value: 'technology', label: 'Technology' },
        { value: 'design', label: 'Design' },
        { value: 'business', label: 'Business' },
        { value: 'marketing', label: 'Marketing' },
        { value: 'development', label: 'Development' },
    ];

    const tagOptions: SelectOption[] = [
        { value: 'javascript', label: 'JavaScript' },
        { value: 'react', label: 'React' },
        { value: 'nextjs', label: 'Next.js' },
        { value: 'tailwind', label: 'Tailwind CSS' },
        { value: 'typescript', label: 'TypeScript' },
        { value: 'node', label: 'Node.js' },
        { value: 'graphql', label: 'GraphQL' },
        { value: 'api', label: 'API' },
    ];

    // State for example selections
    const [selectedColor, setSelectedColor] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [errorDemo, setErrorDemo] = useState('');

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#1E1E1E] transition-colors duration-200">
            <Navigation history={[]} />

            <div className={`pt-16 pb-8 w-full transition-all duration-300 ease-in-out ${isOpen ? 'pl-64' : 'pl-16'}`}>
                <div className="px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 w-full">
                    <div className="mx-auto w-full max-w-4xl">
                        <div className="bg-white dark:bg-[#2C2C2C] border dark:border-[#333333] rounded-lg shadow-lg p-6 mb-8">
                            <div className="flex items-center gap-3 mb-6">
                                <PuzzlePieceIcon className="h-8 w-8 text-primary" />
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Components Example</h1>
                            </div>

                            <div className="space-y-8">
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Custom Select Components</h2>
                                    <p className="text-gray-700 dark:text-gray-200 mb-6">
                                        These custom select components provide enhanced visuals and usability, especially in dark mode.
                                    </p>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Single Select</h3>

                                            <div>
                                                <CustomSelect
                                                    label="Select a Color"
                                                    options={colorOptions}
                                                    value={selectedColor}
                                                    onChange={setSelectedColor}
                                                    placeholder="Choose a color"
                                                />

                                                {selectedColor && (
                                                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                                        Selected: {colorOptions.find(opt => opt.value === selectedColor)?.label}
                                                    </p>
                                                )}
                                            </div>

                                            <div>
                                                <CustomSelect
                                                    label="Category"
                                                    options={categoryOptions}
                                                    value={selectedCategory}
                                                    onChange={setSelectedCategory}
                                                    required
                                                />

                                                {selectedCategory && (
                                                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                                        Selected: {categoryOptions.find(opt => opt.value === selectedCategory)?.label}
                                                    </p>
                                                )}
                                            </div>

                                            <div>
                                                <CustomSelect
                                                    label="With Error State"
                                                    options={colorOptions}
                                                    value={errorDemo}
                                                    onChange={setErrorDemo}
                                                    required
                                                    error="This field is required"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Multi Select</h3>

                                            <div>
                                                <MultiSelect
                                                    label="Select Tags"
                                                    options={tagOptions}
                                                    value={selectedTags}
                                                    onChange={setSelectedTags}
                                                    placeholder="Choose tags"
                                                />

                                                {selectedTags.length > 0 && (
                                                    <div className="mt-2 flex flex-wrap gap-2">
                                                        {selectedTags.map(tag => (
                                                            <span
                                                                key={tag}
                                                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 dark:bg-primary/20 text-primary"
                                                            >
                                                                {tagOptions.find(opt => opt.value === tag)?.label}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 border-t dark:border-[#333333]">
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Component Features</h2>

                                    <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-200">
                                        <li>Custom styling consistent with dark mode color palette</li>
                                        <li>Dropdown options with hover effects and clear selection indicators</li>
                                        <li>Support for single and multiple selections</li>
                                        <li>Checkboxes in multi-select for clearer item selection</li>
                                        <li>Accessible keyboard navigation support</li>
                                        <li>Support for form validation with error messages</li>
                                        <li>Required field indicators</li>
                                        <li>Fully responsive design</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 