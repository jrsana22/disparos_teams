import cron from 'node-cron'

let started = false

export function startCron() {
  if (started) return
  started = true

  console.log('[Cron] Starting scheduler...')

  // Run every minute
  cron.schedule('* * * * *', async () => {
    try {
      const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
      const res = await fetch(`${baseUrl}/api/cron`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-cron-secret': process.env.CRON_SECRET || '',
        },
      })
      if (res.ok) {
        const data = await res.json()
        if (data.processed > 0 || data.errors > 0) {
          console.log(`[Cron] Processed: ${data.processed}, Errors: ${data.errors}`)
        }
      }
    } catch (err) {
      console.error('[Cron] Error:', err)
    }
  })
}
