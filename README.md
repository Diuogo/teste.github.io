# NiceDrop Landing Page

## Documentacao Principal

- Consulte `DOCUMENTACAO_TECNICA_COMPLETA_NICEDROP.md` para a documentacao tecnica completa do site (arquitetura, fluxos, dados, seguranca, operacao e roadmap).

Documentacao detalhada do site NiceDrop (landing page)

## Visao geral
NiceDrop e uma landing page para um conceito de startup que constroi uma rede autonoma de entrega por drones. O visual e cinematografico, moderno e limpo, inspirado por sites de tecnologia premium.

## Estrutura do projeto

- index.html: Estrutura semantica do conteudo e seccoes.
- style.css: Identidade visual, tipografia, layout, animacoes e responsivo.
- script.js: Animacoes de reveal no scroll e parallax.
- sky.png: Fundo principal do site.
- nicedrop.png: Marca usada no hero e no footer.
- BebasNeue-Regular.ttf: Fonte principal para titulos.

## Como executar

1. Abra o arquivo index.html no navegador.
2. Opcional: use uma extensao de servidor local (ex: Live Server) para melhor experiencia.

## Conteudo e seccoes

1. Hero
   - Titulo: NICEDROP
   - Subtitulo: Autonomous Drone Delivery Network
   - Texto descritivo e CTAs
   - UI flutuante com indicadores (rota, nodes, painel de rede)

2. The Problem
   - Dor do mercado: entregas urbanas lentas e caras
   - Cartoes com pontos de friccao

3. The Solution
   - Apresenta a rede autonoma
   - Lista de features (VTOL, AI routing, etc)
   - Cartoes empilhados com destaque

4. How It Works
   - 5 passos da operacao (pedido, preparo, pickup, voo, entrega)
   - Grid de cards numerados

5. Who It Is For
   - Segmentos alvo: cafes, farmacias, restaurantes, minimarkets

6. Technology
   - VTOL, AI routing, navegacao autonoma, smart logistics, tracking

7. Future Vision
   - Evolucao da rede e integracao em smart cities

8. Business Model
   - Assinatura mensal + taxa por entrega

9. Footer
   - Marca NiceDrop + tagline

## Tipografia

- Titulos: Bebas Neue (BebasNeue-Regular.ttf)
- Texto de apoio: Space Grotesk (Google Fonts)

## Paleta e estilo

- Fundo principal: sky.png com overlays animados
- Cores base: preto suave e branco
- Acentos: azul suave para glow
- Cards: brancos com sombra leve e borda sutil

## Layout

- Grid principal no hero (texto + visual)
- Seccoes em split layout (texto / cards)
- Fluxo visual com transicoes suaves entre seccoes

## Animacoes e interacoes

- Reveal no scroll: elementos entram com fade e slide
- Parallax: elementos do hero e fundo se movem com scroll
- Hover micro-interactions: lift, glow e transicoes suaves
- Underline animado em links do menu

## Detalhes tecnicos

### index.html
- Estrutura semantica com main, section e footer
- Classes utilitarias para animacoes e layout
- Identificadores para navegacao interna

### style.css
- Variaveis CSS em :root
- Sistema de sombras leves e glows
- Animacoes: spin, pulse, skyShift, glowDrift
- Responsivo para tablet e mobile

### script.js
- IntersectionObserver para reveal
- Parallax com requestAnimationFrame
- Ajuste de background position via CSS variable

## Responsividade

- Navegacao reflow em telas menores
- Hero vira coluna unica
- Cards do hero empilham em mobile
- Seccoes usam grid adaptativo

## Customizacao rapida

- Trocar fundo: substitua sky.png
- Atualizar logo: substitua nicedrop.png
- Ajustar cores: edite as variaveis em :root
- Ajustar velocidade de parallax: edite data-parallax no HTML

## Checklist de qualidade

- Sem frameworks
- HTML/CSS/JS puro
- Assets locais
- Performance leve
- Animacoes suaves

## Licenca

Conteudo de demo para projeto NiceDrop.
