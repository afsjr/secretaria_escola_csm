import { CourseService } from '../lib/course-service'

interface ModuloInfo {
  titulo: string
  trilha: string
  competencia: string
  color: string
}

interface CursoData {
  id: string
  nome: string
  descricao?: string
}

interface DisciplinaData {
  id: string
  nome: string
  modulo?: string
}

// Descrições padrão dos módulos de Enfermagem
const enfermagemModulos: Record<string, ModuloInfo> = {
  'I Módulo': {
    titulo: 'Fundamentos Biológicos e Científicos',
    trilha: 'Trilha 1',
    competencia: 'Compreender a estrutura e o funcionamento do corpo humano, os princípios éticos e de comunicação da profissão, e os fundamentos de biossegurança e higiene.',
    color: 'var(--primary)'
  },
  'II Módulo': {
    titulo: 'Princípios do Cuidar e Clínicas',
    trilha: 'Trilha 2',
    competencia: 'Prestar assistência de enfermagem vitalícia a pacientes clínicos e instrumentar procedimentos em pacientes cirúrgicos, dominando a administração técnica e segura de fármacos.',
    color: 'var(--accent)'
  },
  'III Módulo': {
    titulo: 'Urgências e Saúde Pública',
    trilha: 'Trilha de Formatura',
    competencia: 'Liderar campanhas preventivas (SUS), atuar sob grande pressão em ambiente de trauma (UPAs), e promover saúde mental humanizada na comunidade.',
    color: '#10b981'
  }
}

// Descrições padrão para Instrumentação Cirúrgica
const instrumentacaoModulos: Record<string, ModuloInfo> = {
  'I Módulo': {
    titulo: 'Fundamentos da Instrumentação',
    trilha: 'Trilha 1',
    competencia: 'Compreender os princípios da esterilização, materiais cirúrgicos e técnicas básicas de instrumentação.',
    color: 'var(--primary)'
  },
  'II Módulo': {
    titulo: 'Procedimentos Cirúrgicos',
    trilha: 'Trilha 2',
    competencia: 'Assistir em procedimentos cirúrgicos diversos, dominando a técnica de passagem de material e controle de campo.',
    color: 'var(--accent)'
  },
  'III Módulo': {
    titulo: 'Especialidades e Estágio',
    trilha: 'Trilha de Formatura',
    competencia: 'Atuar em diferentes especialidades cirúrgicas com autonomia e segurança, seguindo normas de biossegurança.',
    color: '#10b981'
  }
}

// Horas padrão por disciplina (fallback)
const horasDefault: Record<string, string> = {
  'Anatomia e Fisiologia Humana': '100h',
  'Psicologia Aplicada': '60h',
  'Nutrição e Dietética': '60h',
  'Microbiologia e Parasitologia': '50h',
  'Higiene e Profilaxia': '50h',
  'Ética Profissional': '30h',
  'Português Instrumental': '30h',
  'Matemática Instrumental': '30h',
  'Introdução à Enfermagem': '140h (70h Estágio)',
  'Enfermagem Cirúrgica': '110h (70h Estágio)',
  'Enfermagem Médica': '120h (60h Estágio)',
  'Noções de Farmacologia': '40h',
  'Noções de Adm. em Unidade Hospitalar': '30h',
  'Enfermagem Materno Infantil': '130h (80h Estágio)',
  'Enfermagem em Pronto Socorro': '60h (60h Estágio)',
  'Enfermagem em Saúde Pública': '100h (40h Estágio)',
  'Enfermagem Neuro Psiquiátrica': '60h (40h Estágio)'
}

// Vivências padrão por disciplina (fallback)
const vivenciasDefault: Record<string, string> = {
  'Anatomia e Fisiologia Humana': 'Aulas práticas com bonecos anatômicos, identificação tátil de veias, músculos para injeção e sistemas do corpo humano.',
  'Psicologia Aplicada': 'Dinâmicas sobre relações interpessoais paciente-família, identificação de fases do luto e escuta qualificada.',
  'Nutrição e Dietética': 'Estudo de dietas hospitalares, manuseio laboratorial de sondas enterais e parenterais.',
  'Microbiologia e Parasitologia': 'Visita a laboratórios/microscopia. Discussão das Infecções Relacionadas à Assistência à Saúde (IRAS).',
  'Higiene e Profilaxia': 'Treinamento de lavagem técnica das mãos, paramentação de EPIs, desinfecção e esterilização.',
  'Ética Profissional': 'Júri simulado com dilemas éticos (Baseados no COFEN) e direitos legais.',
  'Português Instrumental': 'Simulação intensiva do formato de preenchimentos de Prontuários (Anotação de Enfermagem).',
  'Matemática Instrumental': 'Cálculo de gotejamento de soro e diluição exata de medicamentos.',
  'Introdução à Enfermagem': 'Sinais Vitais (PA, FC, FR, Temp), higiene/banho no leito, curativos asseptizados simples, oxigenoterapia.',
  'Enfermagem Cirúrgica': 'Atuação no Centro Cirúrgico, empacotamento na CME e recepção de paciente na Sala de Recuperação (RPA).',
  'Enfermagem Médica': 'Acompanhamento contínuo em alas médicas; pacientes com diabetes/hipertensão e controle severo de glicemia.',
  'Noções de Farmacologia': 'Preparo e simulação das vias Intramuscular, Endovenosa, Subcutânea e Intradérmica sem bolhas de ar.',
  'Noções de Adm. em Unidade Hospitalar': 'Escalas de serviço, dimensionamento de equipes, passagem de plantão clara entre turnos.',
  'Enfermagem Materno Infantil': 'Triagem pré-natal, mensuração uterina, escuta cardíaca (Sonar). Estágio com primeiro banho de RN e auxílio à amamentação.',
  'Enfermagem em Pronto Socorro': 'Classificação Manchester de Risco, execução de Parada Cardiorrespiratória (RCP com DEA), controle de hemorragia e choque.',
  'Enfermagem em Saúde Pública': 'Imersão na sala de vacina, leitura absoluta do Cartão de Vacinas Nacional e visitas da Estratégia de Saúde da Família (ESF).',
  'Enfermagem Neuro Psiquiátrica': 'Acompanhamento ambulatorial no CAPS, protocolos de contenção humanizada quando requerida no surto.'
}

export async function MatrizView(): Promise<HTMLElement> {
  const container = document.createElement('div')
  container.className = 'matriz-view animate-in'

  // Fetch courses and disciplines from DB
  let cursos: CursoData[] = []
  let disciplinasPorCurso: Record<string, DisciplinaData[]> = {}

  try {
    const { data: cursosData } = await CourseService.getCursosAtivos()
    cursos = cursosData || []

    // Load disciplines for each course
    for (const curso of cursos) {
      const { data: disciplinas } = await CourseService.getDisciplinasDoCurso(curso.id)
      if (disciplinas && disciplinas.length > 0) {
        disciplinasPorCurso[curso.nome] = disciplinas as DisciplinaData[]
      }
    }
  } catch (err) {
    console.warn('Erro ao carregar cursos do banco:', err)
  }

  // Default courses if DB is empty
  if (cursos.length === 0) {
    cursos = [
      { id: 'enfermagem', nome: 'Técnico em Enfermagem', descricao: 'Curso técnico em enfermagem.' },
      { id: 'instrumentacao', nome: 'Instrumentação Cirúrgica', descricao: 'Curso técnico em instrumentação cirúrgica.' }
    ]
  }

  const renderCurso = (curso: CursoData): string => {
    const modulosMap: Record<string, ModuloInfo> = curso.nome.includes('Enfermagem') ? enfermagemModulos :
      curso.nome.includes('Instrumentação') ? instrumentacaoModulos :
        enfermagemModulos

    // Get disciplines from DB or use defaults
    let modulosDB: Record<string, DisciplinaData[]> | null = null
    if (disciplinasPorCurso[curso.nome]) {
      const grouped: Record<string, DisciplinaData[]> = {}
      disciplinasPorCurso[curso.nome].forEach(d => {
        const modulo = d.modulo || 'Sem Módulo'
        if (!grouped[modulo]) grouped[modulo] = []
        grouped[modulo].push(d)
      })
      modulosDB = grouped
    }

    // Use DB data if available, otherwise show static content
    if (modulosDB) {
      return Object.keys(modulosDB).map(moduloNome => {
        const info = modulosMap[moduloNome] || { titulo: moduloNome, trilha: '', competencia: 'Disciplinas do módulo.', color: 'var(--primary)' }
        const disciplinas = modulosDB[moduloNome]

        return `
          <div style="background: white; border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); overflow: hidden;">
            <div style="background: ${info.color}; padding: 1.5rem; color: white;">
              <h2 style="margin: 0; font-size: 1.5rem; display: flex; align-items: center; justify-content: space-between;">
                ${moduloNome}: ${info.titulo}
                <span style="font-size: 0.9rem; background: rgba(255,255,255,0.2); padding: 4px 10px; border-radius: 20px;">${info.trilha}</span>
              </h2>
              <p style="margin-top: 10px; opacity: 0.9; line-height: 1.4; font-size: 0.9rem;">
                <strong>Competência Geral:</strong> ${info.competencia}
              </p>
            </div>
            <div style="padding: 1.5rem;">
              <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem;">
                ${disciplinas.map(d => `
                  <div class="discipline-card" style="padding: 1rem; border: 1px solid var(--secondary); border-radius: 8px;">
                    <h4 style="color: var(--primary); margin-bottom: 5px;">${d.nome}</h4>
                    <span class="badge" style="background: #e0f2fe; color: #0284c7; margin-bottom: 10px; display: inline-block;">${horasDefault[d.nome] || '40h'}</span>
                    <p style="font-size: 0.85rem; color: var(--text-muted); line-height: 1.5;">
                      <strong>Vivência:</strong> ${vivenciasDefault[d.nome] || 'Atividades práticas e teóricas da disciplina.'}
                    </p>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        `
      }).join('')
    }

    // Fallback static content
    return `
      <div style="background: white; padding: 2rem; border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); text-align: center;">
        <h3 style="color: var(--text-main);">Currículo em Construção</h3>
        <p style="color: var(--text-muted);">As disciplinas deste curso serão cadastradas pela secretaria.</p>
      </div>
    `
  }

  container.innerHTML = `
    <header style="margin-bottom: 2rem;">
      <h1 style="font-size: 2rem; color: var(--text-main);">Matriz Curricular & Ementa</h1>
      <p>Consulte as competências, vivências práticas e divisão das disciplinas dos cursos do Colégio Santa Mônica.</p>
    </header>

    ${cursos.map(curso => `
      <div style="margin-bottom: 3rem;">
        <div style="background: linear-gradient(135deg, var(--primary), var(--accent)); padding: 1.5rem; border-radius: var(--radius-lg); margin-bottom: 1.5rem;">
          <h2 style="color: white; margin: 0;">${curso.nome}</h2>
          <p style="color: rgba(255,255,255,0.9); margin: 0.5rem 0 0 0; font-size: 0.9rem;">${curso.descricao || ''}</p>
        </div>
        <div style="display: flex; flex-direction: column; gap: 2rem;">
          ${renderCurso(curso)}
        </div>
      </div>
    `).join('')}
  `

  return container
}
