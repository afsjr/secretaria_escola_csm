export function formatDateBR(dateStr: string | undefined): string {
  if (!dateStr) return '-'
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString('pt-BR')
}

export function formatDateTimeBR(dateStr: string | undefined): string {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  const [year, month, day] = [date.getFullYear(), date.getMonth() + 1, date.getDate()]
  const [hour, minute] = [date.getHours(), date.getMinutes()]
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${pad(day)}/${pad(month)}/${year} ${pad(hour)}:${pad(minute)}`
}