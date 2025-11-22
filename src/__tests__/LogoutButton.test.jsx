import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MockAdapter from 'axios-mock-adapter'
import api from '../lib/axios'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { AppProviders } from '../auth/AuthProvider'
import Nav from '../Components/Nav/Nav'
import Login from '../pages/Login'
import { useUserStore } from '../stores/userStore'

let mock
beforeEach(() => {
  mock = new MockAdapter(api)
  mock.reset()
  useUserStore.setState({ currentUser: { role: null, user_id: 6, username: 'Clrkk' } })
})

describe('Logout button', () => {
  it('clears user and navigates to login', async () => {
    mock.onPost('/auth/logout').reply(200)
    render(
      <MemoryRouter initialEntries={["/"]}>
        <AppProviders>
          <Routes>
            <Route path="/" element={<Nav />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </AppProviders>
      </MemoryRouter>
    )
    const btn = await screen.findByRole('button', { name: /logout/i })
    await userEvent.click(btn)
    expect(useUserStore.getState().currentUser).toBeNull()
  })
})