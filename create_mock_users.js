import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://cfybsocrydeziibonvbd.supabase.co'
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmeWJzb2NyeWRlemlpYm9udmJkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDk2NjE2OSwiZXhwIjoyMDkwNTQyMTY5fQ.iYszfZxeS9fHnsuPYKLzVhu188ZBtg3sFkEaAoGYg_A'

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

const usersToCreate = [
  {
    email: 'secretaria@teste.com',
    password: 'senha_secretaria123',
    perfil: 'secretaria',
    nomeCompleto: 'Ana Maria (Secretária)'
  },
  {
    email: 'professor@teste.com',
    password: 'senha_professor123',
    perfil: 'professor',
    nomeCompleto: 'Carlos Eduardo (Professor)'
  },
  {
    email: 'aluno@teste.com',
    password: 'senha_aluno123',
    perfil: 'aluno',
    nomeCompleto: 'Lucas Silva (Aluno)'
  }
]

async function run() {
  for (const u of usersToCreate) {
    console.log(`Criando usuário: ${u.email}...`)
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: u.email,
      password: u.password,
      email_confirm: true
    })

    if (authError) {
      console.error(`Erro ao criar ${u.email} no Auth:`, authError.message)
      continue
    }

    const { error: profileError } = await supabase
      .from('perfis')
      .update({
        nome_completo: u.nomeCompleto,
        perfil: u.perfil
      })
      .eq('id', authData.user.id)

    if (profileError) {
      console.error(`Erro ao criar perfil de ${u.email}:`, profileError.message)
    } else {
      console.log(`Sucesso: ${u.email} [${u.perfil}]`)
    }
  }
}

run()
