import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorState from '../ErrorState/ErrorState.jsx';
import EmptyState from '../EmptyState/EmptyState.jsx';
import InfoTip from '../InfoTip/InfoTip.jsx';
import Modal from '../Modal/Modal.jsx';

describe('ErrorState', () => {
  it('shows the title and calls onRetry', () => {
    const onRetry = vi.fn();
    render(<ErrorState title="Unable to Load Level Progress" onRetry={onRetry} />);
    expect(screen.getByText('Unable to Load Level Progress')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /try again/i }));
    expect(onRetry).toHaveBeenCalledOnce();
  });
});

describe('EmptyState', () => {
  it('renders an action when provided', () => {
    const onAction = vi.fn();
    render(<EmptyState title="Your XP journey starts here." actionLabel="Start Earning XP" onAction={onAction} />);
    fireEvent.click(screen.getByRole('button', { name: /start earning xp/i }));
    expect(onAction).toHaveBeenCalled();
  });
});

describe('InfoTip', () => {
  it('toggles and closes on Escape', () => {
    render(<InfoTip text="XP helps you progress." />);
    const trigger = screen.getByRole('button', { name: /more info/i });
    fireEvent.click(trigger);
    expect(screen.getByRole('tooltip')).toHaveTextContent('XP helps you progress.');
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });
});

describe('Modal', () => {
  it('renders a labelled dialog and closes on Escape', () => {
    const onClose = vi.fn();
    render(
      <Modal open onClose={onClose} labelledBy="t">
        <h2 id="t">Level Up</h2>
        <button type="button">Continue</button>
      </Modal>,
    );
    expect(screen.getByRole('dialog', { name: 'Level Up' })).toBeInTheDocument();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });

  it('renders nothing when closed', () => {
    render(<Modal open={false} onClose={() => {}} labelledBy="x"><p>hidden</p></Modal>);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
