// Mock do supabase para testes - deve ser importado ANTES de qualquer módulo que use supabase
import { vi } from 'vitest'

// Criar mock chain para supabase.from().update().eq().select().single()
const createMockChain = () => {
  const mockEq = vi.fn().mockReturnValue({
    select: vi.fn().mockReturnValue({
      single: vi.fn().mockResolvedValue({ data: null, error: null })
    })
  })
  
  const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
  const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
  const mockFrom = vi.fn().mockReturnValue({ 
    update: mockUpdate, 
    select: mockSelect,
    insert: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: null, error: null })
      })
    }),
    delete: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null, error: null })
        })
      })
    })
  })
  
  return { mockFrom, mockUpdate, mockSelect, mockEq }
}

const mockChain = createMockChain()

export const supabase = {
  from: mockChain.mockFrom,
  auth: {
    getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
    getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
    signOut: vi.fn().mockResolvedValue({ error: null })
  }
}

export default supabase