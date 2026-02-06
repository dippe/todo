import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StorageControls } from '../../../src/components/StorageControls';

describe('StorageControls', () => {
  const mockOnExport = jest.fn();
  const mockOnImport = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render export and import buttons', () => {
    render(<StorageControls onExport={mockOnExport} onImport={mockOnImport} />);

    expect(screen.getByText('Export Tasks')).toBeInTheDocument();
    expect(screen.getByText('Import Tasks')).toBeInTheDocument();
  });

  it('should call onExport when export button is clicked', async () => {
    const user = userEvent.setup();
    render(<StorageControls onExport={mockOnExport} onImport={mockOnImport} />);

    await user.click(screen.getByText('Export Tasks'));

    expect(mockOnExport).toHaveBeenCalledTimes(1);
  });

  it('should call onImport when a file is selected', async () => {
    const user = userEvent.setup();
    render(<StorageControls onExport={mockOnExport} onImport={mockOnImport} />);

    const file = new File(['{"tasks":[]}'], 'tasks.json', {
      type: 'application/json',
    });
    const input = screen.getByLabelText('Import Tasks');

    // Use userEvent for file upload
    await user.upload(input, file);

    expect(mockOnImport).toHaveBeenCalledTimes(1);
    expect(mockOnImport).toHaveBeenCalledWith(file);
  });

  it('should reset input value after file selection to allow selecting same file again', () => {
    render(<StorageControls onExport={mockOnExport} onImport={mockOnImport} />);

    const file = new File(['test'], 'test.json', { type: 'application/json' });
    const input = screen.getByLabelText('Import Tasks') as HTMLInputElement;

    fireEvent.change(input, { target: { files: [file] } });

    expect(mockOnImport).toHaveBeenCalledWith(file);
    expect(input.value).toBe('');
  });
});
