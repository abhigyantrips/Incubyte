'use client'

import { useState } from 'react'
import { Sweet, sweetApi } from '@/lib/api'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface SweetCardProps {
  sweet: Sweet
  onPurchase?: (id: string) => void
  isAdmin?: boolean
  onRestock?: (id: string) => void
}

export function SweetCard({
  sweet,
  onPurchase,
  isAdmin = false,
  onRestock,
}: SweetCardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isRestocking, setIsRestocking] = useState(false)
  const [restockQuantity, setRestockQuantity] = useState<number>(0)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handlePurchase = async () => {
    setIsLoading(true)
    try {
      await sweetApi.purchase(sweet.id)
      onPurchase?.(sweet.id)
    } catch (error) {
      console.error('Failed to purchase sweet:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRestock = async () => {
    if (restockQuantity <= 0) return

    setIsRestocking(true)
    try {
      await sweetApi.restock(sweet.id, restockQuantity)
      setIsDialogOpen(false)
      setRestockQuantity(0)
      onRestock?.(sweet.id)
    } catch (error) {
      console.error('Failed to restock sweet:', error)
    } finally {
      setIsRestocking(false)
    }
  }

  const isOutOfStock = sweet.quantity === 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>{sweet.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground capitalize">
            {sweet.category}
          </p>
          <p className="text-lg font-semibold">${sweet.price.toFixed(2)}</p>
          <p className="text-sm">
            {isOutOfStock ? (
              <span className="text-destructive font-medium">Out of Stock</span>
            ) : (
              <span>Quantity: {sweet.quantity}</span>
            )}
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        {!isAdmin ? (
          <Button
            onClick={handlePurchase}
            disabled={isOutOfStock || isLoading}
            className="w-full"
          >
            {isLoading ? 'Purchasing...' : 'Purchase'}
          </Button>
        ) : (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full">Restock</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Restock {sweet.name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="restock-quantity">Quantity to Add</Label>
                  <Input
                    id="restock-quantity"
                    type="number"
                    min="1"
                    value={restockQuantity || ''}
                    onChange={(e) =>
                      setRestockQuantity(parseInt(e.target.value) || 0)
                    }
                    placeholder="Enter quantity"
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Current quantity: {sweet.quantity}
                </p>
              </div>
              <DialogFooter>
                <Button
                  onClick={handleRestock}
                  disabled={isRestocking || restockQuantity <= 0}
                >
                  {isRestocking ? 'Adding...' : 'Confirm'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </CardFooter>
    </Card>
  )
}
