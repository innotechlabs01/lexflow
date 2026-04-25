'use client'

import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface DeleteUserModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userName: string
  onConfirm: () => void
  loading?: boolean
}

export function DeleteUserModal({ 
  open, 
  onOpenChange, 
  userName,
  onConfirm,
  loading 
}: DeleteUserModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-slate-900">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            Desactivar Usuario
          </DialogTitle>
          <DialogDescription className="text-slate-600">
            ¿Estás seguro de que deseas desactivar este usuario?
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <p className="text-sm text-slate-700">
            El usuario <strong className="font-semibold">{userName}</strong> será desactivado y ya no podrá acceder al sistema. Podrás reactivarlo más tarde si es necesario.
          </p>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {loading ? (
              <>Desactivando...</>
            ) : (
              <>Desactivar Usuario</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}