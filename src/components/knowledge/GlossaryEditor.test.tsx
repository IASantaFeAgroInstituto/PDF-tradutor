import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GlossaryEditor } from './GlossaryEditor';
import { KnowledgeBase } from '../../types';

describe('GlossaryEditor', () => {
  const mockOnSave = jest.fn();

  const mockKnowledgeBase: KnowledgeBase = {
    id: '1',
    name: 'Test Knowledge Base',
    description: 'Test Description',
    sourceLanguage: 'en',
    targetLanguage: 'es',
    entries: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    mockOnSave.mockClear();
  });

  it('renders empty glossary editor when no entries exist', () => {
    render(<GlossaryEditor knowledgeBase={mockKnowledgeBase} onSave={mockOnSave} />);

    expect(screen.getByText(/edit glossary/i)).toBeInTheDocument();
    expect(screen.getByText(/add entry/i)).toBeInTheDocument();
    expect(screen.getByText(/import from file/i)).toBeInTheDocument();
    expect(screen.getByText(/export to csv/i)).toBeInTheDocument();
  });

  it('renders existing entries', () => {
    const knowledgeBaseWithEntries: KnowledgeBase = {
      ...mockKnowledgeBase,
      entries: [
        {
          id: '1',
          sourceText: 'hello',
          targetText: 'hola',
          createdAt: new Date(),
        },
        {
          id: '2',
          sourceText: 'world',
          targetText: 'mundo',
          createdAt: new Date(),
        },
      ],
    };

    render(<GlossaryEditor knowledgeBase={knowledgeBaseWithEntries} onSave={mockOnSave} />);

    expect(screen.getByDisplayValue('hello')).toBeInTheDocument();
    expect(screen.getByDisplayValue('hola')).toBeInTheDocument();
    expect(screen.getByDisplayValue('world')).toBeInTheDocument();
    expect(screen.getByDisplayValue('mundo')).toBeInTheDocument();
  });

  it('allows adding new entries', async () => {
    render(<GlossaryEditor knowledgeBase={mockKnowledgeBase} onSave={mockOnSave} />);

    const addButton = screen.getByText(/add entry/i);
    fireEvent.click(addButton);

    const sourceInputs = screen.getAllByLabelText(/source text/i);
    const targetInputs = screen.getAllByLabelText(/target text/i);

    expect(sourceInputs).toHaveLength(1);
    expect(targetInputs).toHaveLength(1);

    await userEvent.type(sourceInputs[0], 'hello');
    await userEvent.type(targetInputs[0], 'hola');

    expect(sourceInputs[0]).toHaveValue('hello');
    expect(targetInputs[0]).toHaveValue('hola');
  });

  it('allows removing entries', async () => {
    const knowledgeBaseWithEntries: KnowledgeBase = {
      ...mockKnowledgeBase,
      entries: [
        {
          id: '1',
          sourceText: 'hello',
          targetText: 'hola',
          createdAt: new Date(),
        },
        {
          id: '2',
          sourceText: 'world',
          targetText: 'mundo',
          createdAt: new Date(),
        },
      ],
    };

    render(<GlossaryEditor knowledgeBase={knowledgeBaseWithEntries} onSave={mockOnSave} />);

    const removeButtons = screen.getAllByRole('button', { name: '' }); // Trash2 icon button
    expect(removeButtons).toHaveLength(2);

    fireEvent.click(removeButtons[0]);

    await waitFor(() => {
      expect(screen.queryByDisplayValue('hello')).not.toBeInTheDocument();
      expect(screen.queryByDisplayValue('hola')).not.toBeInTheDocument();
      expect(screen.getByDisplayValue('world')).toBeInTheDocument();
      expect(screen.getByDisplayValue('mundo')).toBeInTheDocument();
    });
  });

  it('saves entries when save button is clicked', async () => {
    render(<GlossaryEditor knowledgeBase={mockKnowledgeBase} onSave={mockOnSave} />);

    // Add a new entry
    const addButton = screen.getByText(/add entry/i);
    fireEvent.click(addButton);

    const sourceInput = screen.getByLabelText(/source text/i);
    const targetInput = screen.getByLabelText(/target text/i);

    await userEvent.type(sourceInput, 'hello');
    await userEvent.type(targetInput, 'hola');

    // Save changes
    const saveButton = screen.getByText(/save changes/i);
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            sourceText: 'hello',
            targetText: 'hola',
          }),
        ])
      );
    });
  });
});
