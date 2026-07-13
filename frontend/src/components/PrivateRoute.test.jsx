import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import PrivateRoute from './PrivateRoute';

const renderWithAuth = (role) => {
  render(
    <AuthContext.Provider
      value={{
        token: 'fake-token',
        user: { role, full_name: 'Test User' },
        loading: false,
        login: jest.fn(),
        logout: jest.fn(),
      }}
    >
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route
            path="/dashboard"
            element={
              <PrivateRoute allowedRoles={['researcher']}>
                <div>Dashboard content</div>
              </PrivateRoute>
            }
          />
          <Route path="/login" element={<div>Login page</div>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  );
};

test('allows researchers to access the dashboard', () => {
  renderWithAuth('researcher');
  expect(screen.getByText('Dashboard content')).toBeInTheDocument();
});

test('blocks reviewers from accessing the dashboard', () => {
  renderWithAuth('reviewer');
  expect(screen.getByText(/access denied/i)).toBeInTheDocument();
});
