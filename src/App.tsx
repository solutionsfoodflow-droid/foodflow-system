import { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  Activity, 
  Target, 
  ShieldCheck, 
  Zap, 
  Repeat,
  Menu,
  X,
  TrendingUp,
  Cpu,
  BookOpen,
  Briefcase
} from 'lucide-react';
import './App.css';

// ==========================================
// CONFIGURATION & TEXT CONSTANTS
// Edite os textos, links e configurações aqui!
// ==========================================
const CONFIG = {
  // Links Principais
  urls: {
    acessarSistema: "/sistema", // Altere aqui para a rota final do seu sistema (ex: /login, #app)
    contato: "#contato",
  },
  
  // Header
  navItems: [
    { label: "Home", href: "#home" },
    { label: "Soluções", href: "#solucoes" },
    { label: "Sobre", href: "#sobre" },
    { label: "Contato", href: "#contato" },
  ],

  // Hero
  hero: {
    headline: "Transformando o Fluxo da Indústria de Alimentos e Bebidas.",
    subheadline: "Adaptabilidade, inovação e clareza para conectar estratégia à execução. Oferecemos confiança e resultados concretos para o mercado B2B.",
    primaryCta: "Acessar Sistema",
    secondaryCta: "Conhecer Soluções"
  },

  // Diferenciais
  diferenciais: [
    { icon: <Activity />, title: "Adaptabilidade", desc: "Processos que se ajustam à realidade dinâmica da sua indústria." },
    { icon: <Cpu />, title: "Inovação", desc: "Tecnologia de ponta simplificada para resultados reais." },
    { icon: <ShieldCheck />, title: "Confiança", desc: "Credibilidade técnica e segurança operacional." },
    { icon: <Repeat />, title: "Visão de Fluxo", desc: "Integração contínua entre estratégia, produção e distribuição." }
  ],

  // Soluções
  solucoes: [
    { icon: <TrendingUp />, title: "Performance", desc: "Otimização de processos para escalar sua capacidade produtiva." },
    { icon: <Zap />, title: "Innovation", desc: "Pesquisa e implementação de novos produtos no mercado." },
    { icon: <ShieldCheck />, title: "Regulatory", desc: "Adequação regulatória simplificada e garantida." },
    { icon: <Repeat />, title: "Upcycling", desc: "Aproveitamento inteligente de resíduos e economia circular." },
    { icon: <BookOpen />, title: "School", desc: "Treinamentos e capacitação para times de excelência." },
    { icon: <Briefcase />, title: "Consulting", desc: "Tecnologia, operação e visão de negócios alinhados." }
  ],

  // Sobre
  sobre: {
    title: "Onde o Movimento Acontece",
    content: "A FoodFlow conecta estratégia, processos limpos e tecnologia para entregar resultados sem atrito. Somos o parceiro B2B que impulsiona indústrias a se adaptarem rapidamente a novas demandas com clareza, transparência e alta performance."
  }
};

function App() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Efeito para navegação (Header) que muda ao rolar a página
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="app-container">
      {/* 1. HEADER / NAVBAR */}
      <header className={`header ${isScrolled ? 'header-scrolled' : ''}`}>
        <div className="container header-container">
          {/* Logo Fallback Textual */}
          <div className="logo">
            Food<span>Flow</span>
          </div>

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

      {/* MOBILE NAV OVERLAY */}
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
            <a href={CONFIG.urls.acessarSistema} className="btn btn-primary">
              {CONFIG.hero.primaryCta} <ArrowRight size={18} />
            </a>
            <a href="#solucoes" className="btn btn-outline">
              {CONFIG.hero.secondaryCta}
            </a>
          </div>
        </div>
      </section>

      {/* 3. DIFERENCIAIS */}
      <section className="section bg-white">
        <div className="container">
          <div className="grid grid-cols-4 differentials-grid">
            {CONFIG.diferenciais.map((item, index) => (
              <div key={index} className="card differential-card animate-fade-in" style={{animationDelay: `${index * 0.1}s`}}>
                <div className="icon-wrapper primary-icon">{item.icon}</div>
                <h3 className="differential-title">{item.title}</h3>
                <p className="differential-desc">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. SOLUÇÕES */}
      <section id="solucoes" className="section bg-gray-50">
        <div className="container">
          <h2 className="section-title text-gradient">Nossas Soluções</h2>
          <p className="section-subtitle">Módulos adaptáveis estruturados para a excelência em todas as etapas da indústria.</p>
          
          <div className="grid grid-cols-3">
            {CONFIG.solucoes.map((item, index) => (
              <div key={index} className="card solution-card hover-glow">
                <div className="icon-wrapper secondary-icon">{item.icon}</div>
                <h3 className="solution-title">{item.title}</h3>
                <p className="solution-desc">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. SOBRE / MOVIMENTO */}
      <section id="sobre" className="section bg-dark-mesh">
        <div className="container text-center about-container">
          <Target className="about-icon text-secondary" size={48} />
          <h2 className="section-title text-white">{CONFIG.sobre.title}</h2>
          <p className="about-content">{CONFIG.sobre.content}</p>
        </div>
      </section>

      {/* 6. CTA FINAL */}
      <section className="section cta-final bg-gradient text-white text-center">
        <div className="container">
          <h2 className="cta-headline">Pronto para acelerar os resultados da sua operação?</h2>
          <p className="cta-subheadline">Tenha o controle estratégico em tempo real na palma da sua mão.</p>
          <a href={CONFIG.urls.acessarSistema} className="btn btn-white btn-lg mt-8">
            {CONFIG.hero.primaryCta} <ArrowRight size={18} />
          </a>
        </div>
      </section>

      {/* 7. FOOTER */}
      <footer id="contato" className="footer">
        <div className="container footer-grid">
          <div className="footer-brand">
             {/* Logo Fallback Textual */}
            <div className="logo text-white">Food<span>Flow</span></div>
            <p>Conectando estratégia e processos.</p>
          </div>
          <div className="footer-links">
            <h4>Institucional</h4>
            <a href="#home">Home</a>
            <a href="#sobre">Nossa Visão</a>
            <a href="#solucoes">Soluções</a>
          </div>
          <div className="footer-links">
            <h4>Acesso</h4>
            <a href={CONFIG.urls.acessarSistema} className="footer-acessar">Área do Cliente</a>
            <a href="#contato">Falar com Consultor</a>
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
