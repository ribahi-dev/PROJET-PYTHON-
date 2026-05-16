import { useEffect } from 'react'
import useToastStore from '../../store/toastStore'

export function ToastViewport(){ const toasts=useToastStore((s)=>s.toasts); const dismissToast=useToastStore((s)=>s.dismissToast); useEffect(()=>{const timers=toasts.map((t)=>setTimeout(()=>dismissToast(t.id),3000)); return ()=>timers.forEach(clearTimeout)},[toasts,dismissToast]); return <div className='fixed bottom-4 right-4 z-[60] space-y-2'>{toasts.map((t)=><div key={t.id} className='rounded-lg border border-secondary/30 bg-primary px-3 py-2 text-sm text-secondary shadow'>{t.message}</div>)}</div>}
export const useToast=()=>{ const push=useToastStore((s)=>s.pushToast); return {success:(message)=>push({type:'success',message}),error:(message)=>push({type:'error',message}),info:(message)=>push({type:'info',message})}}
