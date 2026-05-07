export type ScheduleShow = {
  day: string
  time: string | null
  timezone: string
  isoDate?: string | null
}

// Returns the show's air day in the user's local timezone.
// Uses isoDate (AnimeSchedule UTC timestamp) when available for accuracy.
// Falls back to the server-computed day string for Jikan/AniList shows.
export const getLocalDay = (show: ScheduleShow): string => {
  if (show.isoDate) {
    return new Date(show.isoDate).toLocaleDateString('en-US', { weekday: 'long' })
  }
  return show.day
}

// Returns the show's air time formatted for the user's local timezone.
// Uses isoDate when available, falls back to time + timezone string conversion.
export const getLocalTime = (show: ScheduleShow): string | null => {
  if (show.isoDate) {
    return new Date(show.isoDate).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }
  if (!show.time) return null
  try {
    const [hours, minutes] = show.time.split(':').map(Number)
    const now = new Date()
    const dateStr = `${now.toLocaleDateString('en-CA')}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`
    const sourceTzFormatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: show.timezone,
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hour12: false,
    })
    const tempDate = new Date(dateStr + 'Z')
    const parts = sourceTzFormatter.formatToParts(tempDate)
    const tzHour = parseInt(parts.find(p => p.type === 'hour')?.value || '0')
    const tzMin = parseInt(parts.find(p => p.type === 'minute')?.value || '0')
    const diffMs = ((hours - tzHour) * 60 + (minutes - tzMin)) * 60 * 1000
    const corrected = new Date(tempDate.getTime() + diffMs)
    return corrected.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  } catch {
    return show.time
  }
}

// Returns the show's air time as UTC minutes for sorting purposes.
// Uses isoDate when available for accuracy across timezone boundaries.
export const getLocalMinutes = (show: ScheduleShow): number => {
  if (show.isoDate) {
    const date = new Date(show.isoDate)
    const local = new Date(date.toLocaleString('en-US'))
    return local.getHours() * 60 + local.getMinutes()
  }
  if (!show.time) return 0
  try {
    const [hours, minutes] = show.time.split(':').map(Number)
    const now = new Date()
    const dateStr = `${now.toLocaleDateString('en-CA')}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`
    const utcDate = new Date(dateStr + 'Z')
    const localString = utcDate.toLocaleString('en-US', { timeZone: show.timezone })
    const tzDate = new Date(localString)
    const offsetMs = utcDate.getTime() - tzDate.getTime()
    const corrected = new Date(utcDate.getTime() + offsetMs)
    return corrected.getUTCHours() * 60 + corrected.getUTCMinutes()
  } catch {
    const [h, m] = (show.time || '0:0').split(':').map(Number)
    return h * 60 + m
  }
}