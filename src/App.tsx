import { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  Target, 
  ShieldCheck, 
  Zap, 
  Repeat,
  Menu,
  X,
  Users,
  CheckCircle,
  BarChart,
  Layers,
  Settings,
  AlertCircle
} from 'lucide-react';
import './App.css';

// ==========================================
// CONFIGURATION & TEXT CONSTANTS
// Edite os textos, links e configurações aqui!
// ==========================================
const CONFIG = {
  urls: {
    acessarSistema: "/sistema", // Mude aqui a rota (ex: /login, #app)
    logoPublicPath: "/imgs/Logotipos coloridos_07.png", // Ícone e logo na navbar
    favicon: "/imgs/Logotipos coloridos_07.png"
  },
  
  navItems: [
    { label: "Home", href: "#home" },
    { label: "Soluções", href: "#solucoes" },
    { label: "Diferenciais", href: "#diferenciais" },
    { label: "Sustentação", href: "#transformacao" },
    { label: "Sobre", href: "#sobre" },
  ],

  hero: {
    headline: "Soluções que movem a indústria de alimentos e bebidas",
    subheadline: "A FoodFlow Solutions conecta conformidade, processos, pessoas e inovação aplicada para transformar a operação industrial com mais clareza, segurança e resultado.",
    primaryCta: "Acessar Sistema",
    secondaryCta: "Conhecer Soluções"
  },

  solucoes: {
    sectionTitle: "As Engrenagens da sua Operação",
    frentes: [
      { 
        icon: <ShieldCheck size={36} />, 
        title: "Gestão de Riscos Regulatórios", 
        desc: "Assessoria técnica especializada para garantir a conformidade regulatória contínua da sua operação. Atuamos com suporte dedicado perante órgãos fiscalizadores para uma produção 100% segura.",
        benefits: [
          "Prevenção de multas, interdições e não conformidades",
          "Organização rigorosa de documentação técnica e planilhas",
          "Análise técnica de rotulagem e controle sanitário contínuo",
          "Suporte técnico constante com visitas presenciais"
        ]
      },
      { 
        icon: <Users size={36} />, 
        title: "Gestão de Processos & Pessoas", 
        desc: "Uma resposta direta contra a baixa produtividade, altos custos operacionais, sobrecarga de equipe e falta de indicadores. Implementamos o Método R.I.T.M.O. (Reorganização Industrial por Talentos, Mapeamento e Otimização) para virar a chave da sua indústria em 6 meses.",
        benefits: [
          "Método R.I.T.M.O: diagnóstico ponta-a-ponta e metas SMART",
          "Padronização de processos por função com aplicação PDCA",
          "Capacitação de líderes para melhor engajamento tático",
          "Gestão por indicadores visuais (KPIs) orientados a resultados"
        ]
      },
      { 
        icon: <Zap size={36} />, 
        title: "P&D / Desenvolvimento de Produtos", 
        desc: "Soluções técnicas estruturadas para acelerar a idealização, teste e materialização de novos produtos ou melhoria dos atuais. Mais do que consultoria, entregamos execução direcionada.",
        benefits: [
          "Método FLOW de P&D: visão estruturada de todo o ciclo do projeto",
          "Adequação mercadológica focada na indústria alimentícia",
          "Entrega técnica consultiva acompanhada por especialistas",
          "Desenvolvimento e refinamento alinhados a regulamentações ativas"
        ]
      }
    ]
  },

  diferenciais: {
    sectionTitle: "Os Nossos Diferenciais",
    items: [
      { icon: <Target />, title: "Visão 360º", desc: "Compreensão completa do ecossistema e cruzamento de dados de toda a planta." },
      { icon: <Settings />, title: "Especialização Focada", desc: "Expertise dedicada exclusivamente à indústria de alimentos e bebidas." },
      { icon: <Layers />, title: "Modelos Adaptáveis", desc: "Projetos construídos sob medida com flexibilidade operacional." },
      { icon: <Repeat />, title: "Integração Contínua", desc: "Uma malha fluida que unifica a parte técnica, gestão e a linha de operação." },
      { icon: <CheckCircle />, title: "Implementação Real", desc: "Acompanhamento que sai do papel, orientado e testado a resultados." },
      { icon: <BarChart />, title: "Clareza Visual", desc: "Sistemas e métodos que tornam o complexo em rotinas perfeitamente legíveis." }
    ]
  },

  transformacao: {
    title: "Como a FoodFlow Transforma",
    subtitle: "Nós não paramos no diagnóstico. Conectamos estratégia empresarial, execução tática e rotina operacional entregando:",
    blocks: [
      { title: "Documentação & Processos", desc: "Processo limpo, rastreável e unificado." },
      { title: "Pessoas & Cultura", desc: "Engajamento, treinamento e gestão de metas aplicáveis." },
      { title: "Organização & Técnica", desc: "Estrutura e metodologias (SWOT, Ishikawa, 5W2H) rodando na prática." },
      { title: "Acompanhamento de Resultados", desc: "Indicadores em tempo real para tomada de decisão sólida e segura." }
    ]
  },

  sobre: {
    title: "O Seu Parceiro Estratégico",
    content: "A FoodFlow Solutions existe para transformar a complexidade da indústria alimentícia em fluidez e crescimento. Somos parceiros estratégicos oferecendo solidez confiável aliada à inovação contínua. Para a sua indústria, um parceiro com confiança técnica, para o mercado, produtos e processos de altíssima exigência entregues sob medida."
  },

  ctaFinal: {
    headline: "Pronto para estruturar sua operação com mais clareza, conformidade e resultado?",
    primaryCta: "Acessar Sistema",
    secondaryCta: "Falar com a FoodFlow"
  },

  contact: {
    email: "contato@foodflowsolutions.com",
    site: "foodflowsolutions.com"
  }
};

function App() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="app-container">
      {/* 1. HEADER / NAVBAR */}
      <header className={`header ${isScrolled ? 'header-scrolled' : ''}`}>
        <div className="container header-container">
          <a href="#home" className="logo-link">
            <img 
              src={CONFIG.urls.logoPublicPath} 
              alt="FoodFlow Solutions" 
              className="logo-image" 
              style={{ maxHeight: '42px', width: 'auto' }}
            />
          </a>

          <nav className="desktop-nav">
            {CONFIG.navItems.map((item, index) => (
              <a key={index} href={item.href} className="nav-link">
                {item.label}
              </a>
            ))}
          </nav>

          <div className="header-actions">
            <a href={CONFIG.urls.acessarSistema} className="btn btn-primary btn-acessar animate-pulse-soft">
              {CONFIG.hero.primaryCta}
            </a>
            <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE NAV */}
      {mobileMenuOpen && (
        <div className="mobile-nav">
          {CONFIG.navItems.map((item, index) => (
            <a key={index} href={item.href} onClick={() => setMobileMenuOpen(false)}>
              {item.label}
            </a>
          ))}
          <a href={CONFIG.urls.acessarSistema} className="btn btn-primary" onClick={() => setMobileMenuOpen(false)}>
            {CONFIG.hero.primaryCta}
          </a>
        </div>
      )}

      {/* 2. HERO PRINCIPAL */}
      <section id="home" className="hero bg-mesh">
        <div className="container hero-content text-center animate-fade-in">
          <h1 className="hero-headline text-gradient-dark">{CONFIG.hero.headline}</h1>
          <p className="hero-subheadline">{CONFIG.hero.subheadline}</p>
          <div className="hero-buttons">
            <a href={CONFIG.urls.acessarSistema} className="btn btn-primary btn-lg">
              {CONFIG.hero.primaryCta} <ArrowRight size={18} />
            </a>
            <a href="#solucoes" className="btn btn-outline btn-lg">
              {CONFIG.hero.secondaryCta}
            </a>
          </div>
        </div>
      </section>

      {/* 3. SOLUÇÕES EXTENSAS */}
      <section id="solucoes" className="section bg-gradient text-white">
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <h2 className="section-title text-white">{CONFIG.solucoes.sectionTitle}</h2>
          <p className="section-subtitle" style={{ color: 'rgba(255,255,255,0.9)' }}>
            Eixos estratégicos sustentados por métodos aplicáveis.
          </p>

          <div className="solution-rich-grid mt-8">
            {CONFIG.solucoes.frentes.map((item, index) => (
              <div key={index} className="card rich-card" style={{ background: 'var(--color-white)', color: 'var(--color-dark)' }}>
                <div className="rich-card-header">
                  <div className="icon-wrapper primary-icon" style={{ margin: 0 }}>{item.icon}</div>
                  <h3 className="rich-card-title">{item.title}</h3>
                </div>
                <p className="rich-card-desc">{item.desc}</p>
                <div className="rich-card-bullets">
                  {item.benefits.map((bullet, idx) => (
                    <div key={idx} className="bullet-row">
                      <CheckCircle size={18} className="text-secondary bullet-icon" />
                      <span>{bullet}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. DIFERENCIAIS */}
      <section id="diferenciais" className="section bg-gray-50">
        <div className="container">
          <h2 className="section-title text-gradient-dark">{CONFIG.diferenciais.sectionTitle}</h2>
          <div className="grid grid-cols-3" style={{ marginTop: '3rem' }}>
            {CONFIG.diferenciais.items.map((item, index) => (
              <div key={index} className="card hover-glow" style={{ padding: '2rem' }}>
                <div className="icon-wrapper secondary-icon" style={{ marginBottom: '1rem' }}>{item.icon}</div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', color: 'var(--color-dark)' }}>{item.title}</h3>
                <p style={{ color: 'var(--color-gray-dark)', fontSize: '0.95rem' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. COMO A FOODFLOW TRANSFORMA */}
      <section id="transformacao" className="section bg-white">
        <div className="container">
          <div className="transform-layout">
            <div className="transform-text">
              <h2 className="section-title" style={{ textAlign: 'left' }}>{CONFIG.transformacao.title}</h2>
              <p style={{ fontSize: '1.15rem', color: 'var(--color-gray-medium)', marginBottom: '2.5rem', maxWidth: '500px' }}>
                {CONFIG.transformacao.subtitle}
              </p>
            </div>
            <div className="transform-grid">
              {CONFIG.transformacao.blocks.map((block, index) => (
                <div key={index} className="transform-block">
                  <div className="transform-icon">
                    <AlertCircle size={28} className="text-primary" />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.1rem', color: 'var(--color-dark)', marginBottom: '0.25rem' }}>{block.title}</h4>
                    <p style={{ fontSize: '0.9rem', color: 'var(--color-gray-medium)' }}>{block.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 6. SOBRE / POSICIONAMENTO */}
      <section id="sobre" className="section bg-dark-mesh text-white">
        <div className="container text-center about-container">
          <Target className="about-icon text-secondary" size={48} style={{ margin: '0 auto 1.5rem auto' }} />
          <h2 className="section-title text-white">{CONFIG.sobre.title}</h2>
          <p className="about-content">{CONFIG.sobre.content}</p>
        </div>
      </section>

      {/* 7. CTA FINAL */}
      <section className="section cta-final bg-gray-50 text-center">
        <div className="container" style={{ maxWidth: '800px' }}>
          <h2 className="cta-headline text-gradient-dark" style={{ marginBottom: '2rem' }}>{CONFIG.ctaFinal.headline}</h2>
          <div className="hero-buttons">
            <a href={CONFIG.urls.acessarSistema} className="btn btn-primary btn-lg">
              {CONFIG.ctaFinal.primaryCta} <ArrowRight size={18} />
            </a>
            <a href="#contato" className="btn btn-outline btn-lg">
              {CONFIG.ctaFinal.secondaryCta}
            </a>
          </div>
        </div>
      </section>

      {/* 8. FOOTER */}
      <footer id="contato" className="footer">
        <div className="container footer-grid">
          <div className="footer-brand">
            <img 
              src={CONFIG.urls.logoPublicPath} 
              alt="FoodFlow Solutions" 
              style={{ maxHeight: '45px', width: 'auto', marginBottom: '1rem', filter: 'brightness(0) invert(1)' }}
            />
            <p style={{ maxWidth: '250px' }}>Conectando estratégia, conformidade e processos.</p>
          </div>
          <div className="footer-links">
            <h4>Institucional</h4>
            <a href="#home">Home</a>
            <a href="#solucoes">Soluções</a>
            <a href="#diferenciais">Diferenciais</a>
            <a href="#sobre">Nesse Movimento</a>
          </div>
          <div className="footer-links">
            <h4>Contato e Rotinas</h4>
            <span style={{ display: 'block', color: 'var(--color-gray-medium)', marginBottom: '0.5rem' }}>{CONFIG.contact.email}</span>
            <span style={{ display: 'block', color: 'var(--color-gray-medium)', marginBottom: '1.5rem' }}>{CONFIG.contact.site}</span>
            <a href={CONFIG.urls.acessarSistema} className="footer-acessar">Área do Sistema</a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} FoodFlow Solutions. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
