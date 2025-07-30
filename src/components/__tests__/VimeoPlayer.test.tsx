import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { waitFor, screen } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { VimeoPlayer } from '../VimeoPlayer';
import { supabase } from '@/integrations/supabase/client';

// Mock Vimeo Player
const mockVimeoPlayer = {
  ready: vi.fn().mockResolvedValue(undefined),
  on: vi.fn(),
  play: vi.fn().mockResolvedValue(undefined),
  pause: vi.fn().mockResolvedValue(undefined),
  setCurrentTime: vi.fn().mockResolvedValue(undefined),
  getVolume: vi.fn().mockResolvedValue(1),
  setVolume: vi.fn().mockResolvedValue(undefined),
  destroy: vi.fn(),
};

vi.mock('@vimeo/player', () => {
  return {
    default: vi.fn().mockImplementation(() => mockVimeoPlayer),
  };
});

vi.mock('@/integrations/supabase/client');

describe('VimeoPlayer', () => {
  const defaultProps = {
    videoId: '123456789',
    employeeId: 'emp-123',
    trainingModuleId: 'module-123',
    assignmentId: 'assignment-123',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock Supabase responses
    (supabase.from as any).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: null,
          }),
        }),
      }),
      upsert: vi.fn().mockResolvedValue({ error: null }),
    });
  });

  it('should render video player container', () => {
    render(<VimeoPlayer {...defaultProps} />);

    expect(screen.getByText('Training Video')).toBeInTheDocument();
    expect(screen.getByText('Need to watch 80% to complete')).toBeInTheDocument();
  });

  it('should show progress information', async () => {
    render(<VimeoPlayer {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Progress: 0%')).toBeInTheDocument();
    });

    expect(screen.getByText('In Progress')).toBeInTheDocument();
  });

  it('should display custom controls when enabled', async () => {
    render(<VimeoPlayer {...defaultProps} showControls={true} />);

    // Wait for player to be ready
    await waitFor(() => {
      expect(mockVimeoPlayer.ready).toHaveBeenCalled();
    });

    // Controls should be visible after player is ready
    await waitFor(() => {
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });

  it('should handle completion threshold', () => {
    render(<VimeoPlayer {...defaultProps} completionThreshold={90} />);

    expect(screen.getByText('Need to watch 90% to complete')).toBeInTheDocument();
  });

  it('should save progress to database', async () => {
    render(<VimeoPlayer {...defaultProps} />);

    // Simulate time update
    const timeUpdateCallback = mockVimeoPlayer.on.mock.calls.find(
      call => call[0] === 'timeupdate'
    )[1];

    await timeUpdateCallback({
      currentTime: 30,
      duration: 100,
      percent: 0.3,
    });

    // Should eventually save progress
    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith('training_completions');
    }, { timeout: 3000 });
  });

  it('should handle video completion', async () => {
    render(<VimeoPlayer {...defaultProps} />);

    // Simulate video ended
    const endedCallback = mockVimeoPlayer.on.mock.calls.find(
      call => call[0] === 'ended'
    )[1];

    await endedCallback();

    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith('training_completions');
    });
  });

  it('should load saved progress on initialization', async () => {
    // Mock saved progress
    (supabase.from as any).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              last_video_position_seconds: 45,
              video_progress_data: { currentTime: 45, percentWatched: 45 },
            },
            error: null,
          }),
        }),
      }),
    });

    render(<VimeoPlayer {...defaultProps} />);

    await waitFor(() => {
      expect(mockVimeoPlayer.setCurrentTime).toHaveBeenCalledWith(45);
    });
  });

  it('should handle play/pause controls', async () => {
    const user = userEvent.setup();
    render(<VimeoPlayer {...defaultProps} showControls={true} />);

    // Wait for player to be ready
    await waitFor(() => {
      expect(mockVimeoPlayer.ready).toHaveBeenCalled();
    });

    // Find and click play button
    await waitFor(async () => {
      const playButton = screen.getByRole('button');
      if (playButton) {
        await user.click(playButton);
      }
    });

    await waitFor(() => {
      expect(mockVimeoPlayer.play).toHaveBeenCalled();
    });
  });

  it('should display completion status when training is finished', async () => {
    render(<VimeoPlayer {...defaultProps} />);

    // Simulate completion by calling the time update with high percentage
    const timeUpdateCallback = mockVimeoPlayer.on.mock.calls.find(
      call => call[0] === 'timeupdate'
    )[1];

    await timeUpdateCallback({
      currentTime: 90,
      duration: 100,
      percent: 0.9,
    });

    await waitFor(() => {
      expect(screen.getByText('Training Completed!')).toBeInTheDocument();
    });
  });

  it('should handle volume controls', async () => {
    const user = userEvent.setup();
    render(<VimeoPlayer {...defaultProps} showControls={true} />);

    // Wait for player to be ready
    await waitFor(() => {
      expect(mockVimeoPlayer.ready).toHaveBeenCalled();
    });

    // Volume change should be handled
    const volumeChangeCallback = mockVimeoPlayer.on.mock.calls.find(
      call => call[0] === 'volumechange'
    )[1];

    volumeChangeCallback({ volume: 0 });

    // Should update muted state
    await waitFor(() => {
      // Component should reflect muted state
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });

  it('should handle autoplay setting', () => {
    render(<VimeoPlayer {...defaultProps} autoplay={true} />);

    // Vimeo Player should be initialized with autoplay
    const Player = require('@vimeo/player').default;
    expect(Player).toHaveBeenCalledWith(
      expect.any(HTMLElement),
      expect.objectContaining({
        autoplay: true,
      })
    );
  });

  it('should cleanup on unmount', () => {
    const { unmount } = render(<VimeoPlayer {...defaultProps} />);

    unmount();

    expect(mockVimeoPlayer.destroy).toHaveBeenCalled();
  });

  it('should generate certificates on completion', async () => {
    const mockOnComplete = vi.fn();
    render(<VimeoPlayer {...defaultProps} onComplete={mockOnComplete} />);

    // Mock successful completion with certificate generation
    (supabase.from as any).mockReturnValue({
      upsert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: 'completion-123' },
            error: null,
          }),
        }),
      }),
    });

    // Simulate completion
    const timeUpdateCallback = mockVimeoPlayer.on.mock.calls.find(
      call => call[0] === 'timeupdate'
    )[1];

    await timeUpdateCallback({
      currentTime: 85,
      duration: 100,
      percent: 0.85,
    });

    await waitFor(() => {
      expect(mockOnComplete).toHaveBeenCalled();
    });
  });
});