import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react'
import { X } from 'lucide-react'

export default function Modal({ isOpen, onClose, title, children }) {
  return (
    <Dialog open={isOpen} onClose={onClose} className='relative z-50'>
      <div className='fixed inset-0 bg-secondary/40 backdrop-blur-sm' aria-hidden='true' />
      <div className='fixed inset-0 flex items-center justify-center p-4'>
        <DialogPanel className='w-full max-w-lg rounded-xl bg-primary p-6 shadow-lg border border-secondary/25'>
          <div className='mb-4 flex items-center justify-between'>
            <DialogTitle className='text-lg font-semibold text-secondary'>{title}</DialogTitle>
            <button onClick={onClose} className='rounded p-1 text-secondary/60 hover:bg-secondary/10'><X size={18} /></button>
          </div>
          {children}
        </DialogPanel>
      </div>
    </Dialog>
  )
}
