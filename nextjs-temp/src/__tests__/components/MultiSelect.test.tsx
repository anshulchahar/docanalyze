import { render, screen, fireEvent } from '@testing-library/react';
import MultiSelect from '@/components/MultiSelect';
import { SelectOption } from '@/components/CustomSelect';

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
    <div data-testid="listbox-options" className={className} {...props}>
      {children}
    </div>
  );

  const Listbox = ({ children, value, onChange, multiple }: any) => (
    <div data-testid="multi-listbox" data-multiple={multiple}>
      {children}
    </div>
  );

  Listbox.Button = ListboxButton;
  Listbox.Options = ListboxOptions;

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

describe('MultiSelect', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders with placeholder when no values are selected', () => {
    render(
      <MultiSelect
        options={mockOptions}
        value={[]}
        onChange={mockOnChange}
        placeholder="Select options"
      />
    );

    expect(screen.getByTestId('multiselect-value')).toHaveTextContent('Select options');
  });

  test('renders with selected value when one item is selected', () => {
    render(
      <MultiSelect
        options={mockOptions}
        value={['option1']}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByTestId('multiselect-value')).toHaveTextContent('Option 1');
  });

  test('shows count of items when multiple items are selected', () => {
    render(
      <MultiSelect
        options={mockOptions}
        value={['option1', 'option2']}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByTestId('multiselect-value')).toHaveTextContent('2 items selected');
  });

  test('renders with custom label', () => {
    render(
      <MultiSelect
        options={mockOptions}
        value={[]}
        onChange={mockOnChange}
        label="Test Label"
      />
    );

    expect(screen.getByText('Test Label')).toBeInTheDocument();
  });

  test('shows required asterisk when required is true', () => {
    render(
      <MultiSelect
        options={mockOptions}
        value={[]}
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
      <MultiSelect
        options={mockOptions}
        value={[]}
        onChange={mockOnChange}
        error={errorMessage}
      />
    );

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  test('passes id and name props correctly', () => {
    render(
      <MultiSelect
        options={mockOptions}
        value={[]}
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
      <MultiSelect
        options={mockOptions}
        value={[]}
        onChange={mockOnChange}
        required={true}
        error="Error message"
      />
    );

    const button = screen.getByTestId('listbox-button');
    expect(button).toHaveAttribute('aria-required', 'true');
    expect(button).toHaveAttribute('aria-invalid', 'true');
  });

  test('sets multiple attribute on Listbox', () => {
    render(
      <MultiSelect
        options={mockOptions}
        value={[]}
        onChange={mockOnChange}
      />
    );

    const listbox = screen.getByTestId('multi-listbox');
    expect(listbox).toHaveAttribute('data-multiple');
  });
});