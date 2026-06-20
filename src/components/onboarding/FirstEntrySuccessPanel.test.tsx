import { beforeEach, describe, expect, it, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../test/test-utils';
import { FirstEntrySuccessPanel } from './FirstEntrySuccessPanel';

describe('FirstEntrySuccessPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('requires an explicit user action before preparing feedback for another app', async () => {
    const user = userEvent.setup();
    const writeText = vi.spyOn(navigator.clipboard, 'writeText');

    render(
      <FirstEntrySuccessPanel entryCount={1} onAddAnother={vi.fn()} onExportReport={vi.fn()} />
    );

    const confirmation = screen.getByRole('region', { name: /saved on this device/i });
    expect(confirmation).toHaveFocus();
    expect(writeText).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: /draft feedback manually/i }));
    await user.type(
      screen.getByRole('textbox', { name: /what almost stopped you/i }),
      'The first save button was hard to find.'
    );

    expect(writeText).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: /copy draft/i }));

    expect(writeText).toHaveBeenCalledWith(
      expect.stringContaining('No pain entry data is attached by this screen.')
    );
  });
});
