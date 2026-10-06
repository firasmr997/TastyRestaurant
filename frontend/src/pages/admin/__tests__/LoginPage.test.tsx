import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '@/api/client'
import LoginPage from '@/pages/admin/LoginPage'
import { authService } from '@/services/authService'
import { settingsService } from '@/services/settingsService'
import { renderRoutes, settingsFixture } from '@/test/utils'

vi.mock('@/services/authService')
vi.mock('@/services/settingsService')

const routes = [
  { path: '/admin/login', element: <LoginPage /> },
  { path: '/admin', element: <h1>Admin home</h1> },
]

describe('Admin login', () => {
  beforeEach(() => {
    vi.mocked(settingsService.get).mockResolvedValue(settingsFixture)
  })

  it('validates the form before calling the API', async () => {
    const user = userEvent.setup()
    renderRoutes(routes, ['/admin/login'])
    await user.click(screen.getByRole('button', { name: /sign in/i }))
    expect(await screen.findByText(/enter the email address/i)).toBeInTheDocument()
    expect(screen.getByText(/enter your password/i)).toBeInTheDocument()
    expect(authService.login).not.toHaveBeenCalled()
  })

  it('signs in, stores the session and opens the dashboard', async () => {
    vi.mocked(authService.login).mockResolvedValue({
      token: 'jwt-token',
      tokenType: 'Bearer',
      expiresAt: new Date(Date.now() + 3_600_000).toISOString(),
      user: { id: 1, name: 'Tasty Admin', email: 'admin@tasty.local', role: 'ADMIN' },
    })
    const user = userEvent.setup()
    renderRoutes(routes, ['/admin/login'])
    await user.type(screen.getByLabelText(/email/i), 'admin@tasty.local')
    await user.type(screen.getByLabelText(/^password/i, { selector: 'input' }), 'Admin123!')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    expect(await screen.findByRole('heading', { name: 'Admin home' })).toBeInTheDocument()
    expect(authService.login).toHaveBeenCalledWith('admin@tasty.local', 'Admin123!')
    expect(JSON.parse(window.localStorage.getItem('tasty.session')!).token).toBe('jwt-token')
  })

  it('shows the server message when the credentials are wrong', async () => {
    vi.mocked(authService.login).mockRejectedValue(new ApiError('Invalid email or password', 401))
    const user = userEvent.setup()
    renderRoutes(routes, ['/admin/login'])
    await user.type(screen.getByLabelText(/email/i), 'admin@tasty.local')
    await user.type(screen.getByLabelText(/^password/i, { selector: 'input' }), 'nope')
    await user.click(screen.getByRole('button', { name: /sign in/i }))
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Invalid email or password'))
  })
})
