import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SweetCard } from '@/components/sweets/sweet-card'
import { sweetApi } from '@/lib/api'
import type { Sweet } from '@/lib/api'

// Mock the API module
jest.mock('@/lib/api', () => ({
  sweetApi: {
    purchase: jest.fn(),
    restock: jest.fn(),
  },
}))

describe('SweetCard - Admin Restock', () => {
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

  it('calls restock API when restock button is clicked', async () => {
    const user = userEvent.setup()
    const mockOnRestock = jest.fn()

    ;(sweetApi.restock as jest.Mock).mockResolvedValue({
      ...mockSweet,
      quantity: 20,
    })

    render(
      <SweetCard sweet={mockSweet} isAdmin={true} onRestock={mockOnRestock} />
    )

    const restockButton = screen.getByRole('button', { name: /restock/i })
    await user.click(restockButton)

    // Assuming a dialog opens for restock quantity input
    const quantityInput = screen.getByLabelText(/quantity|amount/i)
    await user.type(quantityInput, '10')

    const confirmButton = screen.getByRole('button', { name: /confirm|add/i })
    await user.click(confirmButton)

    await waitFor(() => {
      expect(sweetApi.restock).toHaveBeenCalledWith('1', 10)
    })
  })

  it('displays restock button only in admin mode', () => {
    const { rerender } = render(<SweetCard sweet={mockSweet} isAdmin={false} />)

    expect(
      screen.queryByRole('button', { name: /restock/i })
    ).not.toBeInTheDocument()

    rerender(<SweetCard sweet={mockSweet} isAdmin={true} />)

    expect(
      screen.getByRole('button', { name: /restock/i })
    ).toBeInTheDocument()
  })
})
