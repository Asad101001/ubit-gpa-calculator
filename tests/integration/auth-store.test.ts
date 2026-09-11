import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAuthStore } from '../../src/store/useAuthStore';

describe('Auth Store (useAuthStore)', () => {
  beforeEach(() => {
    // Reset store state
    useAuthStore.setState({
      user: null,
      session: null,
      profile: null,
      isLoading: false,
      isAuthModalOpen: false,
      authModalMode: 'signin',
    });
  });

  it('should initialize with clean default state', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.profile).toBeNull();
    expect(state.isAuthModalOpen).toBe(false);
    expect(state.authModalMode).toBe('signin');
  });

  it('should open and close the authentication modal with specified modes', () => {
    const { openAuthModal, closeAuthModal } = useAuthStore.getState();

    openAuthModal('signup');
    expect(useAuthStore.getState().isAuthModalOpen).toBe(true);
    expect(useAuthStore.getState().authModalMode).toBe('signup');

    openAuthModal('signin');
    expect(useAuthStore.getState().isAuthModalOpen).toBe(true);
    expect(useAuthStore.getState().authModalMode).toBe('signin');

    closeAuthModal();
    expect(useAuthStore.getState().isAuthModalOpen).toBe(false);
  });

  it('should clear user session and profile on signOut', async () => {
    // Pre-populate authenticated state
    useAuthStore.setState({
      user: { id: 'test-user-id', email: 'asad@ubit.edu.pk' },
      session: { access_token: 'fake-jwt' } as any,
      profile: {
        id: 'test-user-id',
        email: 'asad@ubit.edu.pk',
        full_name: 'Muhammad Asad Khan',
        seat_no: 'B24110006087',
        is_admin: true,
        is_verified: true,
        show_results_publicly: true,
        created_at: new Date().toISOString(),
      },
    });

    expect(useAuthStore.getState().user).not.toBeNull();
    expect(useAuthStore.getState().profile?.seat_no).toBe('B24110006087');

    await useAuthStore.getState().signOut();

    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().session).toBeNull();
    expect(useAuthStore.getState().profile).toBeNull();
  });
});
