export async function MatrizView() {
  const container = document.createElement('div')
  container.className = 'matriz-view animate-in'

  container.innerHTML = `
    <header style="margin-bottom: 2rem;">
      <h1 style="font-size: 2rem; color: var(--text-main);">Matriz Curricular & Ementa</h1>
      <p>Consulte as competências, vivências práticas e divisão das disciplinas do curso Técnico em Enfermagem.</p>
    </header>

    <div style="display: flex; flex-direction: column; gap: 2rem;">
      <!-- Módulo I -->
      <div style="background: white; border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); overflow: hidden;">
        <div style="background: var(--primary); padding: 1.5rem; color: white;">
          <h2 style="margin: 0; font-size: 1.5rem; display: flex; align-items: center; justify-content: space-between;">
            Módulo I: Fundamentos Biológicos e Científicos
            <span style="font-size: 0.9rem; background: rgba(255,255,255,0.2); padding: 4px 10px; border-radius: 20px;">Trilha 1</span>
          </h2>
          <p style="margin-top: 10px; opacity: 0.9; line-height: 1.4; font-size: 0.9rem;">
            <strong>Competência Geral:</strong> Compreender a estrutura e o funcionamento do corpo humano, os princípios éticos e de comunicação da profissão, e os fundamentos de biossegurança e higiene.
          </p>
        </div>
        <div style="padding: 1.5rem;">
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem;">
            
            <div class="discipline-card" style="padding: 1rem; border: 1px solid var(--secondary); border-radius: 8px;">
              <h4 style="color: var(--primary); margin-bottom: 5px;">Anatomia e Fisiologia Humana</h4>
              <span class="badge" style="background: #e0f2fe; color: #0284c7; margin-bottom: 10px; display: inline-block;">100h</span>
              <p style="font-size: 0.85rem; color: var(--text-muted); line-height: 1.5;"><strong>Vivência:</strong> Aulas práticas com bonecos anatômicos, identificação tátil de veias, músculos para injeção e sistemas do corpo humano.</p>
            </div>
            
            <div class="discipline-card" style="padding: 1rem; border: 1px solid var(--secondary); border-radius: 8px;">
              <h4 style="color: var(--primary); margin-bottom: 5px;">Psicologia Aplicada</h4>
              <span class="badge" style="background: #e0f2fe; color: #0284c7; margin-bottom: 10px; display: inline-block;">60h</span>
              <p style="font-size: 0.85rem; color: var(--text-muted); line-height: 1.5;"><strong>Vivência:</strong> Dinâmicas sobre relações interpessoais paciente-família, identificação de fases do luto e escuta qualificada.</p>
            </div>

            <div class="discipline-card" style="padding: 1rem; border: 1px solid var(--secondary); border-radius: 8px;">
              <h4 style="color: var(--primary); margin-bottom: 5px;">Nutrição e Dietética</h4>
              <span class="badge" style="background: #e0f2fe; color: #0284c7; margin-bottom: 10px; display: inline-block;">60h</span>
              <p style="font-size: 0.85rem; color: var(--text-muted); line-height: 1.5;"><strong>Vivência:</strong> Estudo de dietas hospitalares, manuseio laboratorial de sondas enterais e parenterais.</p>
            </div>

            <div class="discipline-card" style="padding: 1rem; border: 1px solid var(--secondary); border-radius: 8px;">
              <h4 style="color: var(--primary); margin-bottom: 5px;">Microbiologia e Parasitologia</h4>
              <span class="badge" style="background: #e0f2fe; color: #0284c7; margin-bottom: 10px; display: inline-block;">50h</span>
              <p style="font-size: 0.85rem; color: var(--text-muted); line-height: 1.5;"><strong>Vivência:</strong> Visita a laboratórios/microscopia. Discussão das Infecções Relacionadas à Assistência à Saúde (IRAS).</p>
            </div>

            <div class="discipline-card" style="padding: 1rem; border: 1px solid var(--secondary); border-radius: 8px;">
              <h4 style="color: var(--primary); margin-bottom: 5px;">Higiene e Profilaxia</h4>
              <span class="badge" style="background: #e0f2fe; color: #0284c7; margin-bottom: 10px; display: inline-block;">50h</span>
              <p style="font-size: 0.85rem; color: var(--text-muted); line-height: 1.5;"><strong>Vivência:</strong> Treinamento de lavagem técnica das mãos, paramentação de EPIs, desinfecção e esterilização.</p>
            </div>

            <div class="discipline-card" style="padding: 1rem; border: 1px solid var(--secondary); border-radius: 8px;">
              <h4 style="color: var(--primary); margin-bottom: 5px;">Ética Profissional</h4>
              <span class="badge" style="background: #e0f2fe; color: #0284c7; margin-bottom: 10px; display: inline-block;">30h</span>
              <p style="font-size: 0.85rem; color: var(--text-muted); line-height: 1.5;"><strong>Vivência:</strong> Júri simulado com dilemas éticos (Baseados no COFEN) e direitos legais.</p>
            </div>

            <div class="discipline-card" style="padding: 1rem; border: 1px solid var(--secondary); border-radius: 8px;">
              <h4 style="color: var(--primary); margin-bottom: 5px;">Português Instrumental</h4>
              <span class="badge" style="background: #e0f2fe; color: #0284c7; margin-bottom: 10px; display: inline-block;">30h</span>
              <p style="font-size: 0.85rem; color: var(--text-muted); line-height: 1.5;"><strong>Vivência:</strong> Simulação intensiva do formato de preenchimentos de Prontuários (Anotação de Enfermagem).</p>
            </div>

            <div class="discipline-card" style="padding: 1rem; border: 1px solid var(--secondary); border-radius: 8px;">
              <h4 style="color: var(--primary); margin-bottom: 5px;">Matemática Instrumental</h4>
              <span class="badge" style="background: #e0f2fe; color: #0284c7; margin-bottom: 10px; display: inline-block;">30h</span>
              <p style="font-size: 0.85rem; color: var(--text-muted); line-height: 1.5;"><strong>Vivência:</strong> Cálculo de gotejamento de soro e diluição exata de medicamentos.</p>
            </div>
            
          </div>
        </div>
      </div>

      <!-- Módulo II -->
      <div style="background: white; border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); overflow: hidden;">
        <div style="background: var(--accent); padding: 1.5rem; color: white;">
          <h2 style="margin: 0; font-size: 1.5rem; display: flex; align-items: center; justify-content: space-between;">
            Módulo II: Princípios do Cuidar e Clínicas
            <span style="font-size: 0.9rem; background: rgba(255,255,255,0.2); padding: 4px 10px; border-radius: 20px;">Trilha 2</span>
          </h2>
          <p style="margin-top: 10px; opacity: 0.9; line-height: 1.4; font-size: 0.9rem;">
            <strong>Competência Geral:</strong> Prestar assistência de enfermagem vitalícia a pacientes clínicos e instrumentar procedimentos em pacientes cirúrgicos, dominando a administração técnica e segura de fármacos.
          </p>
        </div>
        <div style="padding: 1.5rem;">
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem;">
            
            <div class="discipline-card" style="padding: 1rem; border: 1px solid var(--secondary); border-radius: 8px;">
              <h4 style="color: var(--primary); margin-bottom: 5px;">Introdução à Enfermagem</h4>
              <span class="badge" style="background: #e0f2fe; color: #0284c7; margin-bottom: 10px; display: inline-block;">140h (70h Estágio)</span>
              <p style="font-size: 0.85rem; color: var(--text-muted); line-height: 1.5;"><strong>Vivência:</strong> Sinais Vitais (PA, FC, FR, Temp), higiene/banho no leito, curativos asseptizados simples, oxigenoterapia.</p>
            </div>
            
            <div class="discipline-card" style="padding: 1rem; border: 1px solid var(--secondary); border-radius: 8px;">
              <h4 style="color: var(--primary); margin-bottom: 5px;">Enfermagem Cirúrgica</h4>
              <span class="badge" style="background: #e0f2fe; color: #0284c7; margin-bottom: 10px; display: inline-block;">110h (70h Estágio)</span>
              <p style="font-size: 0.85rem; color: var(--text-muted); line-height: 1.5;"><strong>Vivência:</strong> Atuação no Centro Cirúrgico, empacotamento na CME e recepção de paciente na Sala de Recuperação (RPA).</p>
            </div>

            <div class="discipline-card" style="padding: 1rem; border: 1px solid var(--secondary); border-radius: 8px;">
              <h4 style="color: var(--primary); margin-bottom: 5px;">Enfermagem Médica</h4>
              <span class="badge" style="background: #e0f2fe; color: #0284c7; margin-bottom: 10px; display: inline-block;">120h (60h Estágio)</span>
              <p style="font-size: 0.85rem; color: var(--text-muted); line-height: 1.5;"><strong>Vivência:</strong> Acompanhamento contínuo em alas médicas; pacientes com diabetes/hipertensão e controle severo de glicemia.</p>
            </div>

            <div class="discipline-card" style="padding: 1rem; border: 1px solid var(--secondary); border-radius: 8px;">
              <h4 style="color: var(--primary); margin-bottom: 5px;">Farmacologia Prática</h4>
              <span class="badge" style="background: #e0f2fe; color: #0284c7; margin-bottom: 10px; display: inline-block;">40h</span>
              <p style="font-size: 0.85rem; color: var(--text-muted); line-height: 1.5;"><strong>Vivência:</strong> Preparo e simulação das vias Intramuscular, Endovenosa, Subcutânea e Intradérmica sem bolhas de ar.</p>
            </div>

             <div class="discipline-card" style="padding: 1rem; border: 1px solid var(--secondary); border-radius: 8px;">
              <h4 style="color: var(--primary); margin-bottom: 5px;">Gerência Hospitalar</h4>
              <span class="badge" style="background: #e0f2fe; color: #0284c7; margin-bottom: 10px; display: inline-block;">30h</span>
              <p style="font-size: 0.85rem; color: var(--text-muted); line-height: 1.5;"><strong>Vivência:</strong> Escalas de serviço, dimensionamento de equipes, passagem de plantão clara entre turnos.</p>
            </div>

          </div>
        </div>
      </div>

       <!-- Módulo III -->
      <div style="background: white; border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); overflow: hidden;">
        <div style="background: #10b981; padding: 1.5rem; color: white;">
          <h2 style="margin: 0; font-size: 1.5rem; display: flex; align-items: center; justify-content: space-between;">
            Módulo III: Urgências e Saúde Pública
            <span style="font-size: 0.9rem; background: rgba(255,255,255,0.2); padding: 4px 10px; border-radius: 20px;">Trilha de Formatura</span>
          </h2>
          <p style="margin-top: 10px; opacity: 0.9; line-height: 1.4; font-size: 0.9rem;">
            <strong>Competência Geral:</strong> Liderar campanhas preventivas (SUS), atuar sob grande pressão em ambiente de trauma (UPAs), e promover saúde mental humanizada na comunidade.
          </p>
        </div>
        <div style="padding: 1.5rem;">
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem;">
             <div class="discipline-card" style="padding: 1rem; border: 1px solid var(--secondary); border-radius: 8px;">
              <h4 style="color: var(--primary); margin-bottom: 5px;">Enfermagem Materno Infantil</h4>
              <span class="badge" style="background: #e0f2fe; color: #0284c7; margin-bottom: 10px; display: inline-block;">130h (80h Estágio)</span>
              <p style="font-size: 0.85rem; color: var(--text-muted); line-height: 1.5;"><strong>Vivência:</strong> Triagem pré-natal, mensuração uterina, escuta cardíaca (Sonar). Estágio com primeiro banho de RN e auxílio à amamentação.</p>
            </div>
            
            <div class="discipline-card" style="padding: 1rem; border: 1px solid var(--secondary); border-radius: 8px;">
              <h4 style="color: var(--primary); margin-bottom: 5px;">Pronto Socorro / Trauma</h4>
              <span class="badge" style="background: #e0f2fe; color: #0284c7; margin-bottom: 10px; display: inline-block;">60h (60h Estágio)</span>
              <p style="font-size: 0.85rem; color: var(--text-muted); line-height: 1.5;"><strong>Vivência:</strong> Classificação Manchester de Risco, execução de Parada Cardiorrespiratória (RCP com DEA), controle de hemorragia e choque.</p>
            </div>

             <div class="discipline-card" style="padding: 1rem; border: 1px solid var(--secondary); border-radius: 8px;">
              <h4 style="color: var(--primary); margin-bottom: 5px;">Saúde Pública (SUS)</h4>
              <span class="badge" style="background: #e0f2fe; color: #0284c7; margin-bottom: 10px; display: inline-block;">100h (40h Estágio)</span>
              <p style="font-size: 0.85rem; color: var(--text-muted); line-height: 1.5;"><strong>Vivência:</strong> Imersão na sala de vacina, leitura absoluta do Cartão de Vacinas Nacional e visitas da Estratégia de Saúde da Família (ESF).</p>
            </div>

             <div class="discipline-card" style="padding: 1rem; border: 1px solid var(--secondary); border-radius: 8px;">
              <h4 style="color: var(--primary); margin-bottom: 5px;">Neuro Psiquiatria Analítica</h4>
              <span class="badge" style="background: #e0f2fe; color: #0284c7; margin-bottom: 10px; display: inline-block;">60h (40h Estágio)</span>
              <p style="font-size: 0.85rem; color: var(--text-muted); line-height: 1.5;"><strong>Vivência:</strong> Acompanhamento ambulatorial no CAPS, protocolos de contenção humanizada quando requerida no surto.</p>
            </div>

          </div>
        </div>
      </div>
    
    </div>
  `
  return container
}
