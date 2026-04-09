# 🎲 Game Night — Marcador de Pontos

Aplicação web para marcar pontos em noites de jogos de tabuleiro entre amigos.  
Sem dependências, sem build step — abre diretamente no browser.

---

## Módulos disponíveis

### ♛ King
Marcador completo para o jogo King, com:
- **6 categorias de penalização** (pontos negativos): Sem vazar, Copas, Damas, Homens, Porco, Dobro
- **Festas** (pontos positivos): número de festas configurável por ronda
- **8 rondas** por partida
- **Totais automáticos**: Total 1 (penalizações) + Total 2 (festas) = Soma Total por ronda
- **Classificação geral** acumulada entre todas as rondas

---

## Como usar

### Opção 1 — Abrir localmente
```bash
git clone https://github.com/SEU-USER/game-night.git
cd game-night
# Abre index.html no browser (duplo clique ou arrasta para o browser)
open index.html
```

### Opção 2 — GitHub Pages
1. Faz fork ou upload deste repositório
2. Vai a **Settings → Pages**
3. Em *Source*, escolhe `main` branch, pasta `/root`
4. Acede ao link gerado (ex: `https://SEU-USER.github.io/game-night`)

---

## Estrutura do projeto

```
game-night/
├── index.html          # Estrutura HTML principal
├── css/
│   ├── base.css        # Layout, tipografia, componentes partilhados
│   └── king.css        # Estilos específicos do módulo King
├── js/
│   ├── state.js        # Estado global, cálculos e persistência (localStorage)
│   ├── ui.js           # Utilitários de UI (toast, modal, confetti, tabs)
│   └── app.js          # Ponto de entrada — inicialização e event listeners
└── modules/
    └── king.js         # Lógica de rendering e interação do módulo King
```

---

## Adicionar um novo módulo

1. Cria `modules/NOME.js` com as funções de rendering e lógica do jogo
2. Cria `css/NOME.css` com os estilos específicos (opcional)
3. Adiciona o `<link>` ao CSS e o `<script>` ao `index.html`
4. Adiciona um `<section id="mod-NOME" class="module">` ao `index.html`
5. Adiciona um `<button class="tab-btn" data-module="NOME">` ao topbar
6. Inicializa o módulo em `js/app.js`

---

## Funcionalidades

- ✅ Sem frameworks nem dependências externas
- ✅ Persistência automática em `localStorage` (os pontos ficam guardados ao fechar o browser)
- ✅ Totais calculados em tempo real
- ✅ Jogadores configuráveis (nome + cor)
- ✅ Design responsivo — funciona em mobile e desktop
- ✅ Modo escuro por defeito

---

## Tecnologias

- HTML5 semântico
- CSS3 com variáveis CSS (custom properties)
- JavaScript vanilla (ES6+)
- Google Fonts: [Playfair Display](https://fonts.google.com/specimen/Playfair+Display) + [DM Sans](https://fonts.google.com/specimen/DM+Sans)

---

## Licença

MIT — usa e modifica à vontade.
