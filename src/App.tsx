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
  ClipboardList,
  Layers,
  Settings
} from 'lucide-react';
import './App.css';

// ==========================================
// CONFIGURATION & TEXT CONSTANTS
// Edite os textos, links e configurações aqui!
// ==========================================
const CONFIG = {
  // Links e Assets Principais
  urls: {
    acessarSistema: "/sistema", // Mude para: /login, #app, ou https://ondeestiver
    logoPublicPath: "/imgs/Logotipos coloridos_07.png" // Ícone e logo na navbar
  },
  
  // Header Nav
  navItems: [
    { label: "Home", href: "#home" },
    { label: "Soluções", href: "#solucoes" },
    { label: "Diferenciais", href: "#diferenciais" },
    { label: "Sobre", href: "#sobre" },
  ],

  // 1. Hero
  hero: {
    headline: "Soluções que movem a indústria de Alimentos e Bebidas.",
    subheadline: "Tecnologia, conformidade, organização de processos e pessoas com inovação aplicada. Transformamos estratégia em resultados consolidados.",
    primaryCta: "Acessar Sistema",
    secondaryCta: "Falar com a FoodFlow"
  },

  // 2. Soluções Principais
  solucoes: {
    sectionTitle: "Soluções que Movem a Indústria",
    frentes: [
      { 
        icon: <ShieldCheck size={32} />, 
        title: "Gestão de Riscos Regulatórios", 
        desc: "Garantimos conformidade regulatória contínua por meio de organização documental, controle sanitário e análise de rotulagem. Oferecemos suporte técnico, visitas presenciais e responsabilidade técnica para prevenção de multas, interdições e não conformidades."
      },
      { 
        icon: <Users size={32} />, 
        title: "Gestão de Processos & Pessoas", 
        desc: "Combatemos a baixa produtividade, sobrecarga e alto custo operacional. Com nosso Método R.I.T.M.O, conectamos cultura, liderança e processos padronizados a indicadores de performance para sustentação duradoura."
      },
      { 
        icon: <Zap size={32} />, 
        title: "P&D / Desenvolvimento de Produtos", 
        desc: "Aplicamos o Método Flow de P&D para entregar desenvolvimento técnico de produtos com visão estruturada de projeto e entrega técnica consultiva garantida."
      }
    ]
  },

  // 3. Diferenciais
  diferenciais: [
    { icon: <Target />, title: "Visão 360º", desc: "Abordagem global unindo as esferas estratégica e operacional." },
    { icon: <Layers />, title: "Soluções Adaptáveis", desc: "Projetos construídos sob medida para o seu escopo industrial." },
    { icon: <Repeat />, title: "Integração Contínua", desc: "Alinhamento fluido entre técnica, gestão e operação." },
    { icon: <BarChart />, title: "Foco em Resultado Real", desc: "Metodologias práticas voltadas para a evolução dos indicadores oficiais." },
    { icon: <Settings />, title: "Acompanhamento Técnico", desc: "Atuação ponta-a-ponta, do diagnóstico à implementação validada." },
    { icon: <CheckCircle />, title: "Especialização no Setor", desc: "Expertise dedicada à Indústria de Alimentos e Bebidas." }
  ],

  // 4. Como a FoodFlow transforma
  transformacao: {
    title: "Como a FoodFlow Transforma",
    subtitle: "Não paramos no diagnóstico. Atuamos com a mão na massa na implementação, acompanhamento, controle e sustentação.",
    items: [
      "Documentação: Rastreabilidade irrestrita.",
      "Processos & Pessoas: Engajamento com método.",
      "Conformidade: Segurança frente às regulamentações.",
      "Performance: Indicadores para tomada de decisão."
    ]
  },

  // 5. Sobre / Posicionamento
  sobre: {
    title: "A Parceira da sua Indústria",
    content: "A FoodFlow Solutions entrega soluções sob medida que vão muito além da consultoria tradicional. Conectamos processos robustos e inovação aplicável, unindo confiança, estrutura e clareza para viabilizar um crescimento sustentável, técnico sem ser pesado, e essencialmente comercial."
  },

  // 6. CTA Final
  ctaFinal: {
    headline: "Assuma o controle estruturado da sua indústria",
    subheadline: "O método definitivo para destravar operações complexas de Alimentos e Bebidas.",
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
              style={{ maxHeight: '45px', width: 'auto' }}
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
            <a href="#sobre" className="btn btn-outline btn-lg">
              {CONFIG.hero.secondaryCta}
            </a>
          </div>
        </div>
      </section>

      {/* 3. SOLUÇÕES QUE MOVEM A INDÚSTRIA */}
      <section id="solucoes" className="section bg-white">
        <div className="container">
          <h2 className="section-title text-gradient-dark">{CONFIG.solucoes.sectionTitle}</h2>
          
          <div className="grid grid-cols-3" style={{ marginTop: '3rem' }}>
            {CONFIG.solucoes.frentes.map((item, index) => (
              <div key={index} className="card hover-glow" style={{ animationDelay: `${index * 0.15}s` }}>
                <div className="icon-wrapper primary-icon">{item.icon}</div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--color-dark)' }}>{item.title}</h3>
                <p style={{ color: 'var(--color-gray-dark)', fontSize: '0.95rem' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. SEÇÃO DE DIFERENCIAIS */}
      <section id="diferenciais" className="section bg-gray-50">
        <div className="container">
          <h2 className="section-title">O que Diferencia a FoodFlow</h2>
          <div className="grid grid-cols-3" style={{ marginTop: '3rem' }}>
            {CONFIG.diferenciais.map((item, index) => (
              <div key={index} className="card" style={{ border: 'none', background: 'transparent', padding: '1rem' }}>
                <div className="icon-wrapper secondary-icon" style={{ marginBottom: '1rem' }}>{item.icon}</div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>{item.title}</h3>
                <p style={{ color: 'var(--color-gray-dark)', fontSize: '0.9rem' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. COMO A FOODFLOW TRANSFORMA */}
      <section className="section bg-gradient text-white">
        <div className="container">
          <div className="grid grid-cols-2" style={{ alignItems: 'center' }}>
            <div>
              <h2 className="section-title" style={{ textAlign: 'left', color: 'white' }}>{CONFIG.transformacao.title}</h2>
              <p style={{ fontSize: '1.1rem', opacity: 0.9, marginBottom: '2rem' }}>
                {CONFIG.transformacao.subtitle}
              </p>
            </div>
            <div>
              <div className="grid grid-cols-2">
                {CONFIG.transformacao.items.map((item, index) => (
                  <div key={index} style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
                    <ClipboardList className="text-secondary" style={{ flexShrink: 0 }} />
                    <p style={{ fontWeight: 600 }}>{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. SOBRE / POSICIONAMENTO */}
      <section id="sobre" className="section bg-white">
        <div className="container text-center about-container">
          <Target className="about-icon text-primary" size={48} style={{ margin: '0 auto 1.5rem auto' }} />
          <h2 className="section-title">{CONFIG.sobre.title}</h2>
          <p className="about-content" style={{ color: 'var(--color-dark)' }}>{CONFIG.sobre.content}</p>
        </div>
      </section>

      {/* 7. CTA FINAL */}
      <section className="section cta-final bg-dark-mesh text-white text-center">
        <div className="container">
          <h2 className="cta-headline">{CONFIG.ctaFinal.headline}</h2>
          <p className="cta-subheadline">{CONFIG.ctaFinal.subheadline}</p>
          <div className="hero-buttons mt-8">
            <a href={CONFIG.urls.acessarSistema} className="btn btn-primary btn-lg">
              {CONFIG.ctaFinal.primaryCta} <ArrowRight size={18} />
            </a>
            <a href="#contato" className="btn btn-secondary btn-lg" style={{ borderColor: 'white', color: 'white' }}>
              {CONFIG.ctaFinal.secondaryCta}
            </a>
          </div>
        </div>
      </section>

      {/* 8. FOOTER */}
      <footer id="contato" className="footer" style={{ paddingBottom: '2rem' }}>
        <div className="container footer-grid">
          <div className="footer-brand">
            <img 
              src={CONFIG.urls.logoPublicPath} 
              alt="FoodFlow Solutions" 
              style={{ maxHeight: '40px', width: 'auto', marginBottom: '1rem', filter: 'brightness(0) invert(1)' }}
            />
            <p>Conectando estratégia e processos.</p>
          </div>
          <div className="footer-links">
            <h4>Institucional</h4>
            <a href="#home">Home</a>
            <a href="#solucoes">Soluções</a>
            <a href="#diferenciais">Diferenciais</a>
          </div>
          <div className="footer-links">
            <h4>Contato</h4>
            <span style={{ display: 'block', color: 'var(--color-gray-medium)', marginBottom: '0.5rem' }}>{CONFIG.contact.email}</span>
            <span style={{ display: 'block', color: 'var(--color-gray-medium)' }}>{CONFIG.contact.site}</span>
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
