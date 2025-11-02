import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SweetCard } from '@/components/sweets/sweet-card'
import { sweetApi } from '@/lib/api'
import type { Sweet } from '@/lib/api'

// Mock the API module
jest.mock('@/lib/api', () => ({
  sweetApi: {
    purchase: jest.fn(),
  },
}))

describe('SweetCard', () => {
  const mockSweet: Sweet = {
    id: '1',
    name: 'Chocolate Bar',
    category: 'Chocolate',
    price: 2.5,
    quantity: 10,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders sweet name, category, price, and quantity', () => {
    render(<SweetCard sweet={mockSweet} />)

    expect(screen.getByText('Chocolate Bar')).toBeInTheDocument()
    expect(screen.getByText('Chocolate')).toBeInTheDocument()
    expect(screen.getByText('$2.50')).toBeInTheDocument()
    expect(screen.getByText(/quantity: 10/i)).toBeInTheDocument()
  })

  it('shows "Out of Stock" when quantity is 0', () => {
    const outOfStockSweet: Sweet = {
      ...mockSweet,
      quantity: 0,
    }

    render(<SweetCard sweet={outOfStockSweet} />)

    expect(screen.getByText(/out of stock/i)).toBeInTheDocument()
  })

  it('disables purchase button when quantity is 0', () => {
    const outOfStockSweet: Sweet = {
      ...mockSweet,
      quantity: 0,
    }

    render(<SweetCard sweet={outOfStockSweet} />)

    const purchaseButton = screen.getByRole('button', { name: /purchase/i })
    expect(purchaseButton).toBeDisabled()
  })

  it('calls purchaseSweet API when purchase button is clicked', async () => {
    const user = userEvent.setup()
    const mockOnPurchase = jest.fn()

    ;(sweetApi.purchase as jest.Mock).mockResolvedValue({
      ...mockSweet,
      quantity: 9,
    })

    render(<SweetCard sweet={mockSweet} onPurchase={mockOnPurchase} />)

    const purchaseButton = screen.getByRole('button', { name: /purchase/i })
    await user.click(purchaseButton)

    await waitFor(() => {
      expect(sweetApi.purchase).toHaveBeenCalledWith('1')
    })
  })

  it('disables purchase button during loading', async () => {
    const user = userEvent.setup()
    const mockOnPurchase = jest.fn()

    ;(sweetApi.purchase as jest.Mock).mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    )

    render(<SweetCard sweet={mockSweet} onPurchase={mockOnPurchase} />)

    const purchaseButton = screen.getByRole('button', { name: /purchase/i })
    await user.click(purchaseButton)

    expect(purchaseButton).toBeDisabled()
  })
})
