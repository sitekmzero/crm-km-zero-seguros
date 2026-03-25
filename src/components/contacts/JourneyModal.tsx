import { Contact } from '@/stores/useContactsStore'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { JourneyFlow } from './JourneyFlow'

interface JourneyModalProps {
  isOpen: boolean
  onClose: () => void
  contact: Contact | null
}

export function JourneyModal({ isOpen, onClose, contact }: JourneyModalProps) {
  if (!contact) return null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[90vw] w-[1000px] h-[80vh] flex flex-col">
        <DialogHeader className="px-1">
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <span>Jornada do Cliente:</span>
            <span className="text-primary">
              {contact.firstName} {contact.lastName}
            </span>
          </DialogTitle>
          <DialogDescription>
            Visualize o progresso e o status atual do contato no funil de
            vendas.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 w-full mt-4 min-h-0">
          <JourneyFlow currentStatus={contact.status} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
