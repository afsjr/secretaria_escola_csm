# Template de Referência: Tela de Login Premium B2B

Este documento serve como referência de especificação visual, classes utilitárias do Tailwind CSS e código React estruturado para o padrão de tela de Login Premium White-Label, validado e aprovado.

---

## 🎨 Especificações de Design (Design System)

* **Layout:** Dividido em duas colunas (split-screen) a partir de telas médias (`md:flex-row`). No mobile, recolhe de forma responsiva para uma coluna centralizada.
* **Coluna Esquerda (Branding / Institucional):** 
  * Fundo com gradiente clínico/corporativo sofisticado (`bg-gradient-to-br from-[#003366] via-[#004080] to-[#b22222]`).
  * Efeitos de profundidade com overlays translúcidos (`bg-white opacity-10 rounded-full blur-3xl`, `bg-black opacity-30 rounded-full blur-3xl`).
  * Caixa de logo translúcida com efeito *glassmorphism* (`backdrop-blur-md border-white/20 bg-white/10`).
* **Coluna Direita (Formulário):**
  * Fundo limpo e focado no contraste da marca (`bg-white` no tema claro, `bg-[#1a1a1a]` no tema escuro).
  * Inputs com foco suave, borda destacada e anel de brilho sutil baseado na cor secundária (`focus:border-[#003366] focus:ring-[#003366]/10`).
  * Botão de ação principal com sombra projetada baseada na cor de destaque (`shadow-[0_4px_14px_0_rgba(178,34,34,0.39)]` e transição de escala/deslocamento no hover).

---

## 💻 Código do Componente (React + Tailwind CSS)

```tsx
import React, { useState } from 'react';

// Se o seu projeto utilizar algum contexto de autenticação customizado
// import { useAuth } from '../contexts/AuthContext'; 

export const LoginTemplate: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      // Chamar a API ou método de login aqui
      // const { error: signInError } = await signIn(email, password);
      // if (signInError) throw new Error(signInError.message);
    } catch (err: any) {
      setError(err.message || 'Credenciais inválidas. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 font-sans text-slate-800 dark:text-slate-200">
      <div className="w-full max-w-5xl bg-white dark:bg-[#1a1a1a] rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row border border-slate-200 dark:border-[#333]">
        
        {/* Painel Esquerdo: Branding / White-Label */}
        <div className="md:w-5/12 bg-gradient-to-br from-[#003366] via-[#004080] to-[#b22222] p-10 lg:p-14 text-white flex flex-col justify-between relative overflow-hidden shrink-0 hidden md:flex">
          {/* Círculos com desfoque para profundidade visual */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-80 h-80 bg-black opacity-30 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/5 to-transparent opacity-50 blur-xl"></div>
          
          <div className="relative z-10">
            {/* Box da Logo (Glassmorphism) */}
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20 backdrop-blur-md mb-8 shadow-inner">
              <svg className="w-8 h-8 text-[#FFCC00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
              </svg>
            </div>
            
            <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight mb-4">
              NOME DO PRODUTO
            </h1>
            
            <p className="text-white/80 font-medium text-sm lg:text-base leading-relaxed max-w-sm">
              Escreva aqui a principal proposta de valor da plataforma ou sistema B2B.
            </p>
          </div>
          
          {/* Rodapé da Coluna Esquerda */}
          <div className="relative z-10 pt-16">
            <div className="flex items-center gap-3">
              <div className="h-px bg-white/20 flex-1"></div>
              <span className="text-[10px] font-black uppercase tracking-widest text-white/50">PRODUTO B2B / WHITE-LABEL</span>
              <div className="h-px bg-white/20 flex-1"></div>
            </div>
          </div>
        </div>

        {/* Painel Direito: Formulário */}
        <div className="md:w-7/12 p-8 md:p-12 lg:p-16 flex flex-col justify-center bg-white dark:bg-[#1a1a1a] relative z-10">
          
          {/* Cabeçalho Mobile (Exibido apenas em telas pequenas) */}
          <div className="md:hidden flex flex-col items-center mb-10 text-center">
             <div className="w-16 h-16 bg-slate-50 dark:bg-[#252525] rounded-2xl flex items-center justify-center mb-5 border border-slate-200 dark:border-[#333] shadow-sm">
              <svg className="w-8 h-8 text-[#b22222] dark:text-[#ff8888]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
              </svg>
            </div>
            <h1 className="text-2xl font-extrabold text-[#003366] dark:text-white tracking-tight">NOME DO PRODUTO</h1>
            <p className="text-sm font-semibold text-slate-500 mt-1">Slogan ou Descrição Curta</p>
          </div>

          <div className="max-w-md w-full mx-auto">
            <h2 className="text-2xl font-extrabold mb-2 hidden md:block text-slate-800 dark:text-white">Acessar Conta</h2>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-8 hidden md:block">
              Insira suas credenciais para entrar na plataforma.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Caixa de Erro */}
              {error && (
                <div className="bg-red-50 dark:bg-[#b22222]/10 border-2 border-red-200 dark:border-[#b22222]/30 text-red-600 dark:text-[#ff8888] p-4 rounded-xl text-sm font-bold text-center flex items-center gap-2 justify-center">
                  <i className="fas fa-exclamation-circle text-lg"></i>
                  {error}
                </div>
              )}

              {/* Input: E-mail */}
              <div className="space-y-1.5">
                <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  E-mail
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <i className="fas fa-envelope"></i>
                  </div>
                  <input
                    type="email"
                    id="email"
                    placeholder="seu.nome@empresa.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={submitting}
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-[#121212] border-2 border-slate-200 dark:border-[#333] rounded-xl focus:outline-none focus:border-[#003366] dark:focus:border-[#b22222] focus:ring-4 focus:ring-[#003366]/10 dark:focus:ring-[#b22222]/10 transition-all text-sm font-semibold placeholder:font-normal placeholder-slate-400 disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Input: Senha */}
              <div className="space-y-1.5">
                <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Senha
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <i className="fas fa-lock"></i>
                  </div>
                  <input
                    type="password"
                    id="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={submitting}
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-[#121212] border-2 border-slate-200 dark:border-[#333] rounded-xl focus:outline-none focus:border-[#003366] dark:focus:border-[#b22222] focus:ring-4 focus:ring-[#003366]/10 dark:focus:ring-[#b22222]/10 transition-all text-sm font-semibold placeholder:font-normal placeholder-slate-400 disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Botão de Submissão */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 px-4 bg-[#b22222] hover:bg-[#8b0000] text-white font-bold rounded-xl text-sm uppercase tracking-wider shadow-[0_4px_14px_0_rgba(178,34,34,0.39)] hover:shadow-[0_6px_20px_rgba(178,34,34,0.23)] hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
              >
                {submitting ? (
                  <>
                    <i className="fas fa-circle-notch fa-spin"></i> Autenticando...
                  </>
                ) : (
                  <>
                    Entrar na Plataforma <i className="fas fa-arrow-right ml-1"></i>
                  </>
                )}
              </button>
            </form>
            
            <p className="mt-8 text-center text-xs font-semibold text-slate-500 dark:text-slate-500">
              Ambiente protegido. <a href="#" className="text-[#003366] dark:text-slate-350 hover:underline font-bold">Contato do suporte institucional</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
```

---

## 🛠️ Guia de Adaptação / Customização para Outros Projetos

1. **Alterar Identidade Visual e Paleta de Cores:**
   - **Gradiente do Painel Esquerdo:** Substitua as classes `from-[#003366] via-[#004080] to-[#b22222]` pelo gradiente de cores corporativas do novo projeto.
   - **Cor dos Inputs e Foco:** Altere as classes `focus:border-[#003366]` e `focus:ring-[#003366]/10` para corresponder à cor principal da nova marca.
   - **Cor do Botão de Envio:** Substitua `bg-[#b22222] hover:bg-[#8b0000]` e a cor da sua sombra (`rgba(178,34,34,0.39)`) pelos códigos hexadecimais do novo tema.

2. **Fontes e Ícones:**
   - O layout utiliza a fonte padrão do sistema configurada no Tailwind (`font-sans`), mas funciona perfeitamente com fontes externas como **Inter** ou **Outfit**.
   - Os ícones usam as classes padrão do **FontAwesome** (`fas fa-envelope`, `fas fa-lock`, etc.). Caso utilize **Lucide Icons** ou **React Icons**, basta substituir os elementos correspondentes.
