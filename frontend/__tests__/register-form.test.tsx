import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RegisterForm } from '@/components/auth/register-form'
import { authApi, tokenStorage } from '@/lib/api'

// Mock the API module
jest.mock('@/lib/api', () => ({
  authApi: {
    register: jest.fn(),
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

describe('RegisterForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders email and password inputs', () => {
    render(<RegisterForm />)

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /register|sign up/i })
    ).toBeInTheDocument()
  })

  it('calls register API with credentials on form submission', async () => {
    const user = userEvent.setup()
    const mockRegisterResponse = {
      token: 'test-token',
      user: { id: '1', email: 'newuser@example.com', role: 'user' as const },
    }

    ;(authApi.register as jest.Mock).mockResolvedValue(mockRegisterResponse)

    render(<RegisterForm />)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/^password$/i)
    const submitButton = screen.getByRole('button', {
      name: /register|sign up/i,
    })

    await user.type(emailInput, 'newuser@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)

    await waitFor(() => {
      expect(authApi.register).toHaveBeenCalledWith({
        email: 'newuser@example.com',
        password: 'password123',
      })
    })
  })

  it('stores token in localStorage on successful registration', async () => {
    const user = userEvent.setup()
    const mockRegisterResponse = {
      token: 'new-user-token',
      user: { id: '2', email: 'newuser@example.com', role: 'user' as const },
    }

    ;(authApi.register as jest.Mock).mockResolvedValue(mockRegisterResponse)

    render(<RegisterForm />)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/^password$/i)
    const submitButton = screen.getByRole('button', {
      name: /register|sign up/i,
    })

    await user.type(emailInput, 'newuser@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)

    await waitFor(() => {
      expect(tokenStorage.set).toHaveBeenCalledWith('new-user-token')
    })
  })

  it('displays error message when email already exists', async () => {
    const user = userEvent.setup()
    const errorMessage = 'Email already exists'

    ;(authApi.register as jest.Mock).mockRejectedValue({
      response: { data: { message: errorMessage } },
    })

    render(<RegisterForm />)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/^password$/i)
    const submitButton = screen.getByRole('button', {
      name: /register|sign up/i,
    })

    await user.type(emailInput, 'existing@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/email already exists/i)).toBeInTheDocument()
    })
  })

  it('validates email format before submission', async () => {
    const user = userEvent.setup()

    render(<RegisterForm />)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/^password$/i)
    const submitButton = screen.getByRole('button', {
      name: /register|sign up/i,
    })

    await user.type(emailInput, 'invalid-email')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)

    await waitFor(() => {
      expect(
        screen.getByText(/please enter a valid email address/i)
      ).toBeInTheDocument()
    })

    expect(authApi.register).not.toHaveBeenCalled()
  })

  it('validates password requirements before submission', async () => {
    const user = userEvent.setup()

    render(<RegisterForm />)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/^password$/i)
    const submitButton = screen.getByRole('button', {
      name: /register|sign up/i,
    })

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, '123')
    await user.click(submitButton)

    await waitFor(() => {
      expect(
        screen.getByText(/password must be at least/i)
      ).toBeInTheDocument()
    })

    expect(authApi.register).not.toHaveBeenCalled()
  })
})
