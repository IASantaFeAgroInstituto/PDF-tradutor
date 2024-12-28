import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { GlossaryFileUpload } from './GlossaryFileUpload';
import { parseGlossaryFile } from '../../utils/fileParser';

// Mock the file parser utility
jest.mock('../../utils/fileParser');

describe('GlossaryFileUpload', () => {
  const mockOnEntriesLoaded = jest.fn();
  const mockOnError = jest.fn();

  const defaultProps = {
    onEntriesLoaded: mockOnEntriesLoaded,
    onError: mockOnError,
  };

  beforeEach(() => {
    mockOnEntriesLoaded.mockClear();
    mockOnError.mockClear();
    (parseGlossaryFile as jest.Mock).mockClear();
  });

  it('renders file upload area', () => {
    render(<GlossaryFileUpload {...defaultProps} />);

    expect(screen.getByText(/drop your file here/i)).toBeInTheDocument();
    expect(screen.getByText(/browse files/i)).toBeInTheDocument();
    expect(screen.getByText(/accepted formats: csv/i)).toBeInTheDocument();
  });

  it('handles file selection through input', async () => {
    const mockEntries = [
      { id: '1', sourceText: 'hello', targetText: 'hola', createdAt: new Date() },
      { id: '2', sourceText: 'world', targetText: 'mundo', createdAt: new Date() },
    ];

    (parseGlossaryFile as jest.Mock).mockResolvedValue(mockEntries);

    render(<GlossaryFileUpload {...defaultProps} />);

    const file = new File(
      ['sourceText,targetText\nhello,hola\nworld,mundo'],
      'test.csv',
      { type: 'text/csv' }
    );

    const input = screen.getByTestId('file-input');
    Object.defineProperty(input, 'files', {
      value: [file],
    });

    fireEvent.change(input);

    await waitFor(() => {
      expect(parseGlossaryFile).toHaveBeenCalledWith(file);
      expect(mockOnEntriesLoaded).toHaveBeenCalledWith(mockEntries);
    });
  });

  it('handles drag and drop', async () => {
    const mockEntries = [
      { id: '1', sourceText: 'hello', targetText: 'hola', createdAt: new Date() },
      { id: '2', sourceText: 'world', targetText: 'mundo', createdAt: new Date() },
    ];

    (parseGlossaryFile as jest.Mock).mockResolvedValue(mockEntries);

    render(<GlossaryFileUpload {...defaultProps} />);

    const dropZone = screen.getByTestId('drop-zone');

    const file = new File(
      ['sourceText,targetText\nhello,hola\nworld,mundo'],
      'test.csv',
      { type: 'text/csv' }
    );

    // Mock DataTransfer
    const dataTransfer = {
      files: [file],
      items: [
        {
          kind: 'file',
          type: 'text/csv',
          getAsFile: () => file,
        },
      ],
      types: ['Files'],
    };

    fireEvent.dragOver(dropZone, { dataTransfer });
    fireEvent.drop(dropZone, { dataTransfer });

    await waitFor(() => {
      expect(parseGlossaryFile).toHaveBeenCalledWith(file);
      expect(mockOnEntriesLoaded).toHaveBeenCalledWith(mockEntries);
    });
  });

  it('handles file parsing errors', async () => {
    const error = new Error('Invalid CSV format');
    (parseGlossaryFile as jest.Mock).mockRejectedValue(error);

    render(<GlossaryFileUpload {...defaultProps} />);

    const file = new File(['invalid,csv,format'], 'test.csv', { type: 'text/csv' });

    const input = screen.getByTestId('file-input');
    Object.defineProperty(input, 'files', {
      value: [file],
    });

    fireEvent.change(input);

    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith(
        expect.stringContaining('Failed to parse file')
      );
    });
  });
});
