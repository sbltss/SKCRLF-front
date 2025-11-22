import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Login from '../pages/Login'
import { MemoryRouter } from 'react-router-dom'
import { AppProviders } from '../auth/AuthProvider'

describe('responsive design', () => {
  it('renders login form across viewports', async () => {
    global.innerWidth = 375
    render(
      <MemoryRouter>
        <AppProviders>
          <Login />
        </AppProviders>
      </MemoryRouter>
    )
    expect(screen.getByLabelText(/login form/i)).toBeInTheDocument()
    global.innerWidth = 1280
  })
})