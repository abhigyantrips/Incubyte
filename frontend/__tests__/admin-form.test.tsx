import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AdminForm } from '@/components/sweets/admin-form'
import { sweetApi } from '@/lib/api'

// Mock the API module
jest.mock('@/lib/api', () => ({
  sweetApi: {
    create: jest.fn(),
  },
}))

describe('AdminForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders sweet creation form fields', () => {
    render(<AdminForm />)

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/category/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/price/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/quantity/i)).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /create sweet|add sweet/i })
    ).toBeInTheDocument()
  })

  it('validates that all fields are required', async () => {
    const user = userEvent.setup()

    render(<AdminForm />)

    const submitButton = screen.getByRole('button', {
      name: /create sweet|add sweet/i,
    })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument()
    })

    expect(sweetApi.create).not.toHaveBeenCalled()
  })

  it('calls createSweet API on form submission', async () => {
    const user = userEvent.setup()
    const mockOnSuccess = jest.fn()
    const mockCreatedSweet = {
      id: '1',
      name: 'Chocolate Bar',
      category: 'Chocolate',
      price: 2.5,
      quantity: 100,
    }

    ;(sweetApi.create as jest.Mock).mockResolvedValue(mockCreatedSweet)

    render(<AdminForm onSuccess={mockOnSuccess} />)

    const nameInput = screen.getByLabelText(/name/i)
    const categoryInput = screen.getByLabelText(/category/i)
    const priceInput = screen.getByLabelText(/price/i)
    const quantityInput = screen.getByLabelText(/quantity/i)
    const submitButton = screen.getByRole('button', {
      name: /create sweet|add sweet/i,
    })

    await user.type(nameInput, 'Chocolate Bar')
    await user.type(categoryInput, 'Chocolate')
    await user.type(priceInput, '2.5')
    await user.type(quantityInput, '100')
    await user.click(submitButton)

    await waitFor(() => {
      expect(sweetApi.create).toHaveBeenCalledWith({
        name: 'Chocolate Bar',
        category: 'Chocolate',
        price: 2.5,
        quantity: 100,
      })
    })
  })

  it('validates numeric values for price and quantity', async () => {
    const user = userEvent.setup()

    render(<AdminForm />)

    const nameInput = screen.getByLabelText(/name/i)
    const categoryInput = screen.getByLabelText(/category/i)
    const priceInput = screen.getByLabelText(/price/i)
    const quantityInput = screen.getByLabelText(/quantity/i)
    const submitButton = screen.getByRole('button', {
      name: /create sweet|add sweet/i,
    })

    await user.type(nameInput, 'Test Sweet')
    await user.type(categoryInput, 'Test')
    await user.type(priceInput, '-5')
    await user.type(quantityInput, '-10')
    await user.click(submitButton)

    await waitFor(() => {
      expect(
        screen.getByText(/price must be a positive number/i)
      ).toBeInTheDocument()
    })

    expect(sweetApi.create).not.toHaveBeenCalled()
  })
})
