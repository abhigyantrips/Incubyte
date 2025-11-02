import { render, screen, waitFor } from '@testing-library/react'
import { SweetList } from '@/components/sweets/sweet-list'
import { sweetApi } from '@/lib/api'
import type { Sweet } from '@/lib/api'

// Mock the API module
jest.mock('@/lib/api', () => ({
  sweetApi: {
    getAll: jest.fn(),
  },
}))

describe('SweetList', () => {
  const mockSweets: Sweet[] = [
    {
      id: '1',
      name: 'Chocolate Bar',
      category: 'Chocolate',
      price: 2.5,
      quantity: 10,
    },
    {
      id: '2',
      name: 'Gummy Bears',
      category: 'Candy',
      price: 1.99,
      quantity: 5,
    },
    {
      id: '3',
      name: 'Lollipop',
      category: 'Candy',
      price: 0.5,
      quantity: 0,
    },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('fetches and displays sweets from API', async () => {
    ;(sweetApi.getAll as jest.Mock).mockResolvedValue(mockSweets)

    render(<SweetList />)

    await waitFor(() => {
      expect(sweetApi.getAll).toHaveBeenCalled()
    })

    await waitFor(() => {
      expect(screen.getByText('Chocolate Bar')).toBeInTheDocument()
      expect(screen.getByText('Gummy Bears')).toBeInTheDocument()
      expect(screen.getByText('Lollipop')).toBeInTheDocument()
    })
  })

  it('displays loading state while fetching sweets', () => {
    ;(sweetApi.getAll as jest.Mock).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(mockSweets), 100))
    )

    render(<SweetList />)

    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('displays error message when API call fails', async () => {
    ;(sweetApi.getAll as jest.Mock).mockRejectedValue(
      new Error('Failed to fetch sweets')
    )

    render(<SweetList />)

    await waitFor(() => {
      expect(
        screen.getByText(/failed to load sweets|error/i)
      ).toBeInTheDocument()
    })
  })

  it('displays empty state when no sweets are available', async () => {
    ;(sweetApi.getAll as jest.Mock).mockResolvedValue([])

    render(<SweetList />)

    await waitFor(() => {
      expect(
        screen.getByText(/no sweets available|empty/i)
      ).toBeInTheDocument()
    })
  })
})
