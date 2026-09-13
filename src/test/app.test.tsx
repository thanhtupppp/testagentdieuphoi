import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../App';

vi.mock('../components/FloodMap', () => ({ FloodMap: () => <div data-testid="flood-map">map</div> }));
vi.mock('../features/flood/hooks/useFlood', () => ({ useFlood: () => ({ data: undefined, loading: false, error: undefined, refresh: vi.fn() }) }));
vi.mock('../features/flood/api', () => ({ geocode: vi.fn(async () => []) }));

beforeEach(() => localStorage.clear());

describe('App dashboard', () => {
  it('renders the empty dashboard state', () => {
    render(<App />);
    expect(screen.getByText('Chưa có điểm theo dõi')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Dùng vị trí hiện tại' })).toBeTruthy();
  });

  it('keeps invalid coordinate input and shows a separate validation error', () => {
    render(<App />);
    const input = screen.getByLabelText('Tọa độ') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '999, 106' } });
    fireEvent.click(screen.getByRole('button', { name: 'Thêm' }));
    expect(input.value).toBe('999, 106');
    expect(screen.getByRole('alert').textContent).toContain('Vĩ độ phải nằm trong [-90, 90].');
  });
});
