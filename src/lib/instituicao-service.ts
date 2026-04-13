import { supabase, supabaseAdmin } from './supabase'

// Chave para cache local no SessionStorage
const CACHE_KEY = 'sge_instituicao'

interface InstituicaoPayload {
  nome?: string
  cnpj?: string
  logradouro?: string
  numero?: string
  bairro?: string
  cep?: string
  cidade?: string
  uf?: string
  telefone?: string
  email?: string
  logo_url?: string
  cor_primaria?: string
  [key: string]: any
}

interface InstituicaoData {
  id?: string
  nome?: string
  cnpj?: string
  logradouro?: string
  numero?: string
  bairro?: string
  cep?: string
  cidade?: string
  uf?: string
  telefone?: string
  email?: string
  logo_url?: string | null
  cor_primaria?: string
  [key: string]: any
}

interface PDFHeaderData {
  nome: string
  cnpj: string
  endereco: string
  cidade_uf: string
  telefone: string
  email: string
  logo_url: string | null
  cor_primaria: string
}

export const InstituicaoService = {

  /**
   * Busca os dados da instituição. Usa cache de sessão para evitar
   * chamadas repetidas ao banco a cada carregamento de página.
   */
  async getInstituicao() {
    // Tenta cache primeiro
    const cached = sessionStorage.getItem(CACHE_KEY)
    if (cached) {
      return { data: JSON.parse(cached), error: null }
    }

    const { data, error } = await supabase
      .from('instituicao')
      .select('*')
      .limit(1)
      .maybeSingle()

    if (data) {
      sessionStorage.setItem(CACHE_KEY, JSON.stringify(data))
    }

    return { data, error }
  },

  /**
   * Salva ou atualiza os dados da instituição.
   * Invalida o cache local após salvar.
   */
  async saveInstituicao(payload: InstituicaoPayload) {
    const { data: existing } = await supabase
      .from('instituicao')
      .select('id')
      .limit(1)
      .maybeSingle()

    let result: any
    if (existing?.id) {
      result = await supabase
        .from('instituicao')
        .update(payload)
        .eq('id', existing.id)
        .select()
        .single()
    } else {
      result = await supabase
        .from('instituicao')
        .insert(payload)
        .select()
        .single()
    }

    // Invalida cache para forçar atualização
    if (!result.error) {
      sessionStorage.removeItem(CACHE_KEY)
    }

    return result
  },

  /**
   * Faz upload da logo da instituição para o Storage do Supabase.
   * Retorna a URL pública do arquivo.
   *
   * ══ ESPECIFICAÇÕES DA LOGO ══
   * • Formato ideal: PNG com fundo transparente
   * • Tamanho máximo: 500KB
   * • Dimensões recomendadas: 400×200px (proporção 2:1)
   * • Tamanho mínimo: 200×100px
   * • Outros formatos aceitos: SVG, JPG (sem transparência)
   * ════════════════════════════
   */
  async uploadLogo(file: File) {
    const MAX_SIZE_KB = 500
    const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp']

    // Validação local antes do upload
    if (!ALLOWED_TYPES.includes(file.type)) {
      return { error: { message: 'Formato inválido. Use PNG, JPG, SVG ou WebP.' } }
    }

    if (file.size > MAX_SIZE_KB * 1024) {
      return { error: { message: `Arquivo muito grande. Máximo ${MAX_SIZE_KB}KB.` } }
    }

    const ext = file.name.split('.').pop()
    const filename = `logo_instituicao.${ext}`

    // Upsert no bucket 'instituicao-assets'
    const { error: uploadError } = await supabase.storage
      .from('instituicao-assets')
      .upload(filename, file, { upsert: true, contentType: file.type })

    if (uploadError) return { error: uploadError }

    const { data: urlData } = supabase.storage
      .from('instituicao-assets')
      .getPublicUrl(filename)

    // Salva a URL no registro da instituição e adiciona timestamp para quebrar cache do browser
    const logoUrl = `${urlData.publicUrl}?v=${Date.now()}`
    await this.saveInstituicao({ logo_url: logoUrl })

    return { data: { url: logoUrl }, error: null }
  },

  /**
   * Retorna os dados formatados para uso no cabeçalho dos PDFs.
   * Se não houver dados cadastrados, retorna valores genéricos.
   */
  async getPDFHeader(): Promise<PDFHeaderData> {
    const { data } = await this.getInstituicao()
    const inst = data as InstituicaoData | null
    return {
      nome: inst?.nome || 'INSTITUIÇÃO DE ENSINO',
      cnpj: inst?.cnpj || '',
      endereco: inst?.logradouro
        ? `${inst.logradouro}, ${inst.numero || 'S/N'} - ${inst.bairro || ''} - CEP: ${inst.cep || ''}`
        : '',
      cidade_uf: inst?.cidade && inst?.uf ? `${inst.cidade}/${inst.uf}` : '',
      telefone: inst?.telefone || '',
      email: inst?.email || '',
      logo_url: inst?.logo_url || null,
      cor_primaria: inst?.cor_primaria || '#1E3A5F',
    }
  },

  /**
   * Limpa o cache local. Útil após logout ou troca de escola.
   */
  clearCache() {
    sessionStorage.removeItem(CACHE_KEY)
  }
}
