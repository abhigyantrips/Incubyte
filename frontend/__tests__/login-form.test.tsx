import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LoginForm } from '@/components/auth/login-form'
import { authApi, tokenStorage } from '@/lib/api'

// Mock the API module
jest.mock('@/lib/api', () => ({
  authApi: {
    login: jest.fn(),
  },
  tokenStorage: {
    set: jest.fn(),
  },
}))

// Mock next/navigation
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

describe('LoginForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders email and password inputs', () => {
    render(<LoginForm />)

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /log in|sign in/i })
    ).toBeInTheDocument()
  })

  it('calls login API with credentials on form submission', async () => {
    const user = userEvent.setup()
    const mockLoginResponse = {
      token: 'test-token',
      user: { id: '1', email: 'test@example.com', role: 'user' as const },
    }

    ;(authApi.login as jest.Mock).mockResolvedValue(mockLoginResponse)

    render(<LoginForm />)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /log in|sign in/i })

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)

    await waitFor(() => {
      expect(authApi.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      })
    })
  })

  it('stores token in localStorage on successful login', async () => {
    const user = userEvent.setup()
    const mockLoginResponse = {
      token: 'test-token-123',
      user: { id: '1', email: 'test@example.com', role: 'user' as const },
    }

    ;(authApi.login as jest.Mock).mockResolvedValue(mockLoginResponse)

    render(<LoginForm />)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /log in|sign in/i })

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)

    await waitFor(() => {
      expect(tokenStorage.set).toHaveBeenCalledWith('test-token-123')
    })
  })

  it('displays error message on login failure', async () => {
    const user = userEvent.setup()
    const errorMessage = 'Invalid credentials'

    ;(authApi.login as jest.Mock).mockRejectedValue({
      response: { data: { message: errorMessage } },
    })

    render(<LoginForm />)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /log in|sign in/i })

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'wrongpassword')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument()
    })
  })

  it('validates email format before submission', async () => {
    const user = userEvent.setup()

    render(<LoginForm />)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /log in|sign in/i })

    await user.type(emailInput, 'invalid-email')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)

    await waitFor(() => {
      expect(
        screen.getByText(/please enter a valid email address/i)
      ).toBeInTheDocument()
    })

    expect(authApi.login).not.toHaveBeenCalled()
  })
})
