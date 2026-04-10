import PatientQueueBoard from "@/components/saas/PatientQueueBoard"

export default async function PublicQueuePage({ params }: { params: Promise<{ doctorId: string }> }) {
  const doctorId = (await params).doctorId

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl mb-8 flex justify-between items-center px-4">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Clinic Live Screen</h1>
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">Live Status</span>
        </div>
      </div>
      
      <PatientQueueBoard doctorId={doctorId} />
    </div>
  )
}
