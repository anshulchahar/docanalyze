import { render, screen } from '@testing-library/react';
import CustomSelect, { SelectOption } from '@/components/CustomSelect';

// Mock headlessui components
jest.mock('@headlessui/react', () => {
  const ListboxButton = ({ children, className, id, name, ...props }: any) => (
    <button 
      data-testid="listbox-button" 
      className={className}
      id={id}
      name={name}
      {...props}
    >
      {typeof children === 'function' ? children({}) : children}
    </button>
  );

  const ListboxOptions = ({ children, className, ...props }: any) => (
    <ul data-testid="listbox-options" className={className} {...props}>
      {children}
    </ul>
  );

  const ListboxOption = ({ children, value, className, ...props }: any) => (
    <li 
      data-testid={`listbox-option-${value.value}`}
      data-value={value.value}
      data-label={value.label}
      className={typeof className === 'function' ? className({ active: false, selected: false }) : className}
      onClick={() => props.onClick && props.onClick(value)}
      {...props}
    >
      {typeof children === 'function' ? children({ selected: false, active: false }) : children}
    </li>
  );

  const Listbox = ({ children, value, onChange }: any) => (
    <div data-testid="listbox">
      {children}
    </div>
  );

  Listbox.Button = ListboxButton;
  Listbox.Options = ListboxOptions;
  Listbox.Option = ListboxOption;

  return {
    Listbox,
    Transition: ({ children, ...props }: any) => (
      <div data-testid="transition" {...props}>
        {typeof children === 'function' ? children() : children}
      </div>
    ),
    Fragment: ({ children }: any) => <>{children}</>,
  };
});

// Mock heroicons
jest.mock('@heroicons/react/20/solid', () => ({
  CheckIcon: () => <svg data-testid="check-icon" />,
  ChevronUpDownIcon: () => <svg data-testid="chevron-icon" />
}));

const mockOptions: SelectOption[] = [
  { value: 'option1', label: 'Option 1' },
  { value: 'option2', label: 'Option 2' },
  { value: 'option3', label: 'Option 3' }
];

describe('CustomSelect', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders with placeholder when no value is selected', () => {
    render(
      <CustomSelect
        options={mockOptions}
        value=""
        onChange={mockOnChange}
        placeholder="Select an option"
      />
    );

    expect(screen.getByText('Select an option')).toBeInTheDocument();
  });

  test('renders with selected value', () => {
    render(
      <CustomSelect
        options={mockOptions}
        value="option1"
        onChange={mockOnChange}
      />
    );

    expect(screen.getByTestId('select-value')).toHaveTextContent('Option 1');
  });

  test('renders with custom label', () => {
    render(
      <CustomSelect
        options={mockOptions}
        value=""
        onChange={mockOnChange}
        label="Test Label"
      />
    );

    expect(screen.getByText('Test Label')).toBeInTheDocument();
  });

  test('shows required asterisk when required is true', () => {
    render(
      <CustomSelect
        options={mockOptions}
        value=""
        onChange={mockOnChange}
        label="Test Label"
        required={true}
      />
    );

    expect(screen.getByText('*')).toBeInTheDocument();
  });

  test('displays error message when provided', () => {
    const errorMessage = 'This field is required';
    render(
      <CustomSelect
        options={mockOptions}
        value=""
        onChange={mockOnChange}
        error={errorMessage}
      />
    );

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  test('passes id and name props correctly', () => {
    render(
      <CustomSelect
        options={mockOptions}
        value=""
        onChange={mockOnChange}
        id="test-id"
        name="test-name"
      />
    );

    const button = screen.getByTestId('listbox-button');
    expect(button).toHaveAttribute('id', 'test-id');
    expect(button).toHaveAttribute('name', 'test-name');
  });

  test('has proper accessibility attributes', () => {
    render(
      <CustomSelect
        options={mockOptions}
        value=""
        onChange={mockOnChange}
        required={true}
        error="Error message"
      />
    );

    const button = screen.getByTestId('listbox-button');
    expect(button).toHaveAttribute('aria-required', 'true');
    expect(button).toHaveAttribute('aria-invalid', 'true');
  });
});