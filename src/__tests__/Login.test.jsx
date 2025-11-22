import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Login from '../pages/Login'
import { AuthContext } from '../auth/AuthProvider'
import { MemoryRouter } from 'react-router-dom'

function renderLoginWithAuth(ctx = {}) {
  const value = {
    login: async () => {},
    loginLoading: false,
    loginError: null,
    setRemember: () => {},
    remember: true,
    isAuthenticated: false,
    ...ctx,
  }
  return render(
    <MemoryRouter>
      <AuthContext.Provider value={value}>
        <Login />
      </AuthContext.Provider>
    </MemoryRouter>
  )
}

describe('Login', () => {
  it('renders required inputs', async () => {
    renderLoginWithAuth()
    const form = document.querySelectorAll('[data-testid="login-form"]')[0]
    const usernameInput = form.querySelector('#username')
    const passwordInput = form.querySelector('#password')
    expect(usernameInput).toBeTruthy()
    expect(passwordInput).toBeTruthy()
    expect(usernameInput.hasAttribute('required')).toBe(true)
    expect(passwordInput.hasAttribute('required')).toBe(true)
  })

  it('username input type', async () => {
    renderLoginWithAuth()
    const form = document.querySelectorAll('[data-testid="login-form"]')[0]
    const usernameInput = form.querySelector('#username')
    expect(usernameInput.getAttribute('type')).toBe('text')
  })

  it('shows loading and handles success', async () => {
    renderLoginWithAuth({ loginLoading: true })
    const form = document.querySelectorAll('[data-testid="login-form"]')[0]
    await userEvent.type(form.querySelector('#username'), 'myuser')
    await userEvent.type(form.querySelector('#password'), 'secret')
    const submit = form.querySelector('button[type="submit"]')
    await userEvent.click(submit)
    await waitFor(() => expect(screen.getByText(/signing in/i)).toBeTruthy())
  })

  it('shows error on failure', async () => {
    renderLoginWithAuth({ loginError: new Error('x') })
    const form = document.querySelectorAll('[data-testid="login-form"]')[0]
    await userEvent.type(form.querySelector('#username'), 'myuser')
    await userEvent.type(form.querySelector('#password'), 'secret')
    await userEvent.click(form.querySelector('button[type="submit"]'))
    await waitFor(() => expect(document.querySelector('.alert-danger')).toBeTruthy())
  })
})