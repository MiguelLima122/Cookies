document.addEventListener('DOMContentLoaded', () => {
    // Elementos do DOM
    const body = document.body;
    const mainButton = document.getElementById('main-button');
    const scoreDisplay = document.getElementById('score');
    const gameContainer = document.getElementById('game-container');

    // Elementos da loja
    const upgradeClickBtn = document.getElementById('upgrade-click');
    const upgradeClickCostDisplay = document.getElementById('upgrade-click-cost');
    const pointsPerClickDisplay = document.getElementById('points-per-click');
    
    // Elementos da melhoria de design unificada
    const designUpgradeWrapper = document.getElementById('design-upgrade-wrapper');
    const designUpgradeBtn = document.getElementById('upgrade-design');
    const designUpgradeName = document.getElementById('upgrade-design-name');
    const designUpgradeCost = document.getElementById('upgrade-design-cost');
    const designUpgradeDescription = document.getElementById('upgrade-design-description');

    // Elementos das melhorias de mecânica
    const passiveUpgradeBtn = document.getElementById('upgrade-passive');
    const passiveCostDisplay = document.getElementById('passive-cost');
    const ppsDisplay = document.getElementById('pps-display');
    const critUpgradeBtn = document.getElementById('upgrade-crit');
    const critCostDisplay = document.getElementById('crit-cost');
    const critChanceDisplay = document.getElementById('crit-chance-display');
    const discountUpgradeBtn = document.getElementById('upgrade-discount');
    const discountCostDisplay = document.getElementById('discount-cost');

    // Elemento do botão de teste
    const testButton = document.getElementById('test-button');

    // Elementos do Painel Lateral
    const sidePanel = document.getElementById('side-panel');
    const openPanelBtn = document.getElementById('open-panel-btn');
    const closePanelBtn = document.getElementById('close-panel-btn');
    const prestigeBtn = document.getElementById('prestige-btn');
    const achievementsList = document.getElementById('achievements-list');

    // Variáveis de estatísticas e conquistas
    let totalClicks = 0;

    // Elemento do canvas para o efeito Matrix
    const matrixCanvas = document.getElementById('matrix-canvas');

    // Variáveis do jogo
    let score = 0;
    let pointsPerClick = 1;
    let upgradeClickCost = 10;

    // Variáveis das novas mecânicas
    let pointsPerSecond = 0;
    let passiveCost = 50;
    let critChance = 0;
    let critMultiplier = 10;
    let critCost = 250;
    let discountMultiplier = 1.0; // 1.0 = 0% de desconto
    let discountCost = 1000;

    // Sistema de Conquistas
    const achievements = {
        click100: { name: "Iniciante nos Cliques", description: "Clique 100 vezes.", unlocked: false, condition: () => totalClicks >= 100 },
        click1000: { name: "Mestre dos Cliques", description: "Clique 1000 vezes.", unlocked: false, condition: () => totalClicks >= 1000 },
        score10k: { name: "Pequeno Milionário", description: "Alcance 10.000 pontos.", unlocked: false, condition: () => score >= 10000 },
        passive100: { name: "Gerente de Filial", description: "Alcance 100 pontos por segundo.", unlocked: false, condition: () => pointsPerSecond >= 100 },
        allThemes: { name: "Mestre do Design", description: "Desbloqueie todos os temas.", unlocked: false, condition: () => currentDesignLevel >= designUpgrades.length },
    };

    // Estrutura para as melhorias de design
    const designUpgrades = [
        { name: 'Tema Doce', cost: 25, description: 'Cores pastéis e um visual adocicado.', class: 'design-level-1' },
        { name: 'Tema Steampunk', cost: 150, description: 'Engrenagens, bronze e um toque industrial.', class: 'design-level-2' },
        { name: 'Tema Glitch', cost: 700, description: 'Efeitos de falha digital e um visual hacker.', class: 'design-level-3' },
        { name: 'Tema Oceano', cost: 3000, description: 'Mergulhe em um visual aquático e relaxante.', class: 'design-level-4' },
        { name: 'Estilo HQ', cost: 10000, description: 'Transforme tudo em uma história em quadrinhos.', class: 'design-level-5' },
        { name: 'Visual Retrô', cost: 30000, description: 'Uma viagem de volta aos anos 80.', class: 'design-level-6' },
        { name: 'Tema Natureza', cost: 75000, description: 'Tons verdes e orgânicos para relaxar.', class: 'design-level-7' },
        { name: 'Viagem Espacial', cost: 200000, description: 'Explore o cosmos com um tema de galáxia.', class: 'design-level-8' },
        { name: 'Ouro Imperial', cost: 500000, description: 'Luxo e ostentação com preto e dourado.', class: 'design-level-9' },
        { name: 'Aparência Divina', cost: 1500000, description: 'O auge do design, um visual etéreo.', class: 'design-level-10' }
    ];
    let currentDesignLevel = 0;

    // Função para inicializar o estado da loja
    function initializeStore() {
        updateDesignUpgradeButton();
        // Atualiza os custos na tela
        passiveCostDisplay.textContent = passiveCost;
        critCostDisplay.textContent = critCost;
        discountCostDisplay.textContent = discountCost;
        renderAchievements();
    }

    // Função para atualizar a pontuação na tela
    function updateScore() {
        scoreDisplay.textContent = score;
    }

    // Função para gerar uma cor hexadecimal aleatória
    function getRandomColor() {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    // Função para criar a animação de pontos
    function showFloatingPoints(event, amount, isCrit = false) {
        const floatingText = document.createElement('div');
        floatingText.textContent = `+${amount}`;
        floatingText.classList.add('floating-text');

        if (isCrit) {
            floatingText.classList.add('crit-text');
        }
        if (document.body.classList.contains('sparkly-points-active')) {
            floatingText.classList.add('sparkly-points');
        }

        // Posiciona o texto perto do clique do mouse
        const rect = gameContainer.getBoundingClientRect();
        floatingText.style.left = `${event.clientX - rect.left}px`;
        floatingText.style.top = `${event.clientY - rect.top}px`;

        gameContainer.appendChild(floatingText);

        // Remove o elemento após a animação
        setTimeout(() => {
            floatingText.remove();
        }, 1000); // 1000ms = 1s (duração da animação)
    }

    // Evento de clique no botão principal
    mainButton.addEventListener('click', (event) => {
        totalClicks++;
        let pointsGained = pointsPerClick;
        let isCritical = false;

        // Verifica se foi um clique crítico
        if (Math.random() < critChance) {
            pointsGained = pointsPerClick * critMultiplier;
            isCritical = true;
        }

        score += pointsGained;
        updateScore();
        mainButton.style.backgroundColor = getRandomColor();
        showFloatingPoints(event, pointsGained, isCritical);
        checkAchievements();
    });

    // Evento de clique no botão de teste
    testButton.addEventListener('click', () => {
        score += 1000000;
        updateScore();
    });

    // Evento de clique na melhoria de click
    upgradeClickBtn.addEventListener('click', () => {
        const currentCost = Math.ceil(upgradeClickCost * discountMultiplier);
        if (score >= currentCost) {
            // Deduz o custo
            score -= currentCost;
            
            // Aumenta o poder do click
            pointsPerClick += Math.max(1, Math.floor(pointsPerClick * 0.2)); // Aumenta em 20% (mínimo 1)
            
            // Aumenta o custo da próxima melhoria
            upgradeClickCost = Math.floor(upgradeClickCost * 1.3);

            // Atualiza a tela
            updateScore();
            pointsPerClickDisplay.textContent = pointsPerClick;
            upgradeClickCostDisplay.textContent = Math.ceil(upgradeClickCost * discountMultiplier);
        } else {
            alert('Pontos insuficientes!');
        }
    });

    // Função para atualizar o botão de melhoria de design
    function updateDesignUpgradeButton() {
        if (currentDesignLevel < designUpgrades.length) {
            const upgrade = designUpgrades[currentDesignLevel];
            designUpgradeName.textContent = upgrade.name;
            designUpgradeCost.textContent = Math.ceil(upgrade.cost * discountMultiplier);
            designUpgradeDescription.textContent = upgrade.description;
        } else {
            // Todas as melhorias foram compradas
            designUpgradeBtn.textContent = "✨ OBRIGADO POR JOGAR! ✨";
            designUpgradeBtn.disabled = true;
            designUpgradeDescription.textContent = "Você alcançou o fim da jornada visual. Continue clicando!";
        }
    }

    // Evento de clique no botão de melhoria de design unificado
    designUpgradeBtn.addEventListener('click', () => {
        if (currentDesignLevel >= designUpgrades.length) return; // Segurança extra

        const currentUpgrade = designUpgrades[currentDesignLevel];
        const currentCost = Math.ceil(currentUpgrade.cost * discountMultiplier);

        if (score >= currentCost) {
            score -= currentCost;
            updateScore();
            body.classList.add(currentUpgrade.class);

            // Gerencia as animações de fundo
            stopCurrentAnimation();
            if (currentUpgrade.class === 'design-level-1') {
                startCandyAnimation();
            } else if (currentUpgrade.class === 'design-level-2') {
                startSteampunkAnimation();
            } else if (currentUpgrade.class === 'design-level-3') {
                startMatrixAnimation();
            } else if (currentUpgrade.class === 'design-level-4') {
                startOceanAnimation();
            } else if (currentUpgrade.class === 'design-level-5') {
                startHqAnimation();
            } else if (currentUpgrade.class === 'design-level-7') {
                startNatureAnimation();
            }
            currentDesignLevel++;
            updateDesignUpgradeButton();
        } else {
            alert('Pontos insuficientes!');
        }
    });

    // --- Eventos para melhorias de mecânica ---

    passiveUpgradeBtn.addEventListener('click', () => {
        const currentCost = Math.ceil(passiveCost * discountMultiplier);
        if (score >= currentCost) {
            score -= currentCost;
            pointsPerSecond += Math.max(1, Math.floor(pointsPerSecond * 0.5) + 1); // Aumenta em 50% + 1 (mínimo 1)
            passiveCost = Math.floor(passiveCost * 1.2); // Aumenta o custo para o próximo
            checkAchievements();
            updateScore();
            ppsDisplay.textContent = pointsPerSecond;
            passiveCostDisplay.textContent = Math.ceil(passiveCost * discountMultiplier);
        } else {
            alert('Pontos insuficientes!');
        }
    });

    critUpgradeBtn.addEventListener('click', () => {
        const currentCost = Math.ceil(critCost * discountMultiplier);
        if (score >= currentCost) {
            score -= currentCost;
            critChance += 0.01; // Aumenta a chance em 1%
            critCost = Math.floor(critCost * 1.8); // Aumenta o custo para o próximo
            updateScore();

            critChanceDisplay.textContent = (critChance * 100).toFixed(0);
            critCostDisplay.textContent = Math.ceil(critCost * discountMultiplier);

            if (critChance >= 0.50) { // Limite de 50% de chance
                critUpgradeBtn.disabled = true;
                critUpgradeBtn.textContent = "Chance de Crítico no Máximo!";
            }
        } else {
            alert('Pontos insuficientes!');
        }
    });

    discountUpgradeBtn.addEventListener('click', () => {
        const currentCost = Math.ceil(discountCost * discountMultiplier);
        if (score >= currentCost) {
            score -= currentCost;
            discountMultiplier -= 0.1; // Reduz o multiplicador em 10%
            discountCost = Math.floor(discountCost * 2); // Aumenta o custo da próxima
            updateScore();
            
            if (discountMultiplier < 0.5) { // Limite de 50% de desconto
                discountUpgradeBtn.disabled = true;
                discountUpgradeBtn.textContent = "Desconto Máximo Atingido!";
            } else {
                discountCostDisplay.textContent = Math.ceil(discountCost * discountMultiplier);
            }
            // Atualiza o custo de todas as outras melhorias na tela
            updateDesignUpgradeButton();
            passiveCostDisplay.textContent = Math.ceil(passiveCost * discountMultiplier);
            upgradeClickCostDisplay.textContent = Math.ceil(upgradeClickCost * discountMultiplier);
        } else {
            alert('Pontos insuficientes!');
        }
    });

    // --- Lógica do Painel Lateral e Conquistas ---
    openPanelBtn.addEventListener('click', () => sidePanel.classList.add('open'));
    closePanelBtn.addEventListener('click', () => sidePanel.classList.remove('open'));

    function checkAchievements() {
        let newAchievementUnlocked = false;
        for (const key in achievements) {
            const achievement = achievements[key];
            if (!achievement.unlocked && achievement.condition()) {
                achievement.unlocked = true;
                newAchievementUnlocked = true;
                // Adicionar uma notificação visual seria um próximo passo legal!
            }
        }
        if (newAchievementUnlocked) {
            renderAchievements();
        }
    }

    function renderAchievements() {
        achievementsList.innerHTML = '';
        for (const key in achievements) {
            const achievement = achievements[key];
            const li = document.createElement('li');
            li.textContent = `${achievement.name}: ${achievement.description}`;
            if (achievement.unlocked) {
                li.classList.add('unlocked');
            }
            achievementsList.appendChild(li);
        }
    }

    // --- Lógica para a animação Matrix ---
    let activeAnimationInterval = null;

    function stopCurrentAnimation() {
        if (activeAnimationInterval) {
            clearInterval(activeAnimationInterval);
            activeAnimationInterval = null;
            const ctx = matrixCanvas.getContext('2d');
            ctx.clearRect(0, 0, matrixCanvas.width, matrixCanvas.height);
        }
    }
    function startMatrixAnimation() {
        const ctx = matrixCanvas.getContext('2d');
        matrixCanvas.width = window.innerWidth;
        matrixCanvas.height = window.innerHeight;

        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789@#$%^&*()*&^%+-/~{[|`]}';
        const fontSize = 16;
        const columns = matrixCanvas.width / fontSize;

        const drops = [];
        for (let x = 0; x < columns; x++) {
            drops[x] = 1;
        }

        function drawMatrix() {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            ctx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);

            ctx.fillStyle = '#0F0'; // Cor verde
            ctx.font = `${fontSize}px arial`;

            for (let i = 0; i < drops.length; i++) {
                const text = letters.charAt(Math.floor(Math.random() * letters.length));
                ctx.fillText(text, i * fontSize, drops[i] * fontSize);

                if (drops[i] * fontSize > matrixCanvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i]++;
            }
        }

        activeAnimationInterval = setInterval(drawMatrix, 33);

        window.addEventListener('resize', () => {
            matrixCanvas.width = window.innerWidth;
            matrixCanvas.height = window.innerHeight;
        });
    }
    
    function startCandyAnimation() {
        const ctx = matrixCanvas.getContext('2d');
        matrixCanvas.width = window.innerWidth;
        matrixCanvas.height = window.innerHeight;

        const candies = ['🍬', '🍭', '🍫', '🍩', '🍪', '🍰', '🍦'];
        const fontSize = 24;
        const columns = matrixCanvas.width / (fontSize * 1.5);

        const drops = [];
        for (let x = 0; x < columns; x++) {
            drops[x] = Math.random() * -matrixCanvas.height; // Começam em posições aleatórias fora da tela
        }

        function drawCandies() {
            ctx.clearRect(0, 0, matrixCanvas.width, matrixCanvas.height); // Limpa a tela para não sobrepor

            ctx.font = `${fontSize}px serif`;

            for (let i = 0; i < drops.length; i++) {
                const text = candies[Math.floor(Math.random() * candies.length)];
                ctx.fillText(text, i * fontSize * 1.5, drops[i]);

                if (drops[i] > matrixCanvas.height) {
                    drops[i] = Math.random() * -100; // Reseta para cima da tela
                }
                drops[i] += 5; // Velocidade da queda
            }
        }

        activeAnimationInterval = setInterval(drawCandies, 50);

        window.addEventListener('resize', () => {
            matrixCanvas.width = window.innerWidth;
            matrixCanvas.height = window.innerHeight;
        });
    }

    function startSteampunkAnimation() {
        const ctx = matrixCanvas.getContext('2d');
        matrixCanvas.width = window.innerWidth;
        matrixCanvas.height = window.innerHeight;

        const gears = [];
        const gearColors = ['#c5a059', '#a88850', '#8b6e41', '#603813'];

        // Função para desenhar uma engrenagem
        function drawGear(x, y, teeth, innerRadius, outerRadius, angle, color) {
            ctx.beginPath();
            for (let i = 0; i < teeth * 2; i++) {
                const radius = (i % 2 === 0) ? outerRadius : innerRadius;
                const a = angle + (Math.PI / teeth) * i;
                ctx.lineTo(x + radius * Math.cos(a), y + radius * Math.sin(a));
            }
            ctx.closePath();
            ctx.fillStyle = color;
            ctx.fill();
        }

        // Cria as engrenagens
        for (let i = 0; i < 15; i++) {
            gears.push({
                x: Math.random() * matrixCanvas.width,
                y: Math.random() * matrixCanvas.height,
                teeth: Math.floor(Math.random() * 8) + 5,
                innerRadius: Math.random() * 30 + 20,
                outerRadius: Math.random() * 40 + 40,
                angle: Math.random() * Math.PI * 2,
                speed: (Math.random() - 0.5) * 0.02,
                color: gearColors[Math.floor(Math.random() * gearColors.length)]
            });
        }

        function animateGears() {
            ctx.clearRect(0, 0, matrixCanvas.width, matrixCanvas.height);
            ctx.globalAlpha = 0.3; // Deixa as engrenagens semitransparentes

            for (let i = 0; i < gears.length; i++) {
                const gear = gears[i];
                gear.angle += gear.speed;
                drawGear(gear.x, gear.y, gear.teeth, gear.innerRadius, gear.outerRadius, gear.angle, gear.color);
            }
            ctx.globalAlpha = 1.0;
        }

        activeAnimationInterval = setInterval(animateGears, 50);
        window.addEventListener('resize', () => {
            matrixCanvas.width = window.innerWidth;
            matrixCanvas.height = window.innerHeight;
        });
    }

    function startOceanAnimation() {
        const ctx = matrixCanvas.getContext('2d');
        matrixCanvas.width = window.innerWidth;
        matrixCanvas.height = window.innerHeight;

        const fishEmojis = ['🐠', '🐟', '🐡', '🦐', '🦑'];
        const fishes = [];

        // Cria os peixes
        for (let i = 0; i < 20; i++) {
            fishes.push({
                x: Math.random() * matrixCanvas.width,
                y: Math.random() * matrixCanvas.height,
                size: Math.random() * 20 + 15,
                speed: Math.random() * 2 + 0.5,
                emoji: fishEmojis[Math.floor(Math.random() * fishEmojis.length)],
                direction: Math.random() > 0.5 ? 1 : -1 // 1 para direita, -1 para esquerda
            });
        }

        function animateOcean() {
            // Desenha o fundo de água
            ctx.fillStyle = '#0072ff';
            ctx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);

            for (let i = 0; i < fishes.length; i++) {
                const fish = fishes[i];
                ctx.font = `${fish.size}px serif`;

                // Inverte o emoji se estiver nadando para a esquerda
                if (fish.direction === -1) {
                    ctx.save();
                    ctx.translate(fish.x, fish.y);
                    ctx.scale(-1, 1);
                    ctx.fillText(fish.emoji, 0, 0);
                    ctx.restore();
                } else {
                    ctx.fillText(fish.emoji, fish.x, fish.y);
                }

                fish.x += fish.speed * fish.direction;

                // Reseta o peixe se ele sair da tela
                if (fish.x > matrixCanvas.width + fish.size) fish.x = -fish.size;
                if (fish.x < -fish.size) fish.x = matrixCanvas.width + fish.size;
            }
        }

        activeAnimationInterval = setInterval(animateOcean, 50);
        window.addEventListener('resize', () => {
            matrixCanvas.width = window.innerWidth;
            matrixCanvas.height = window.innerHeight;
        });
    }

    function startHqAnimation() {
        const ctx = matrixCanvas.getContext('2d');
        matrixCanvas.width = window.innerWidth;
        matrixCanvas.height = window.innerHeight;

        const fighters = [
            { emoji: '🦸', y: matrixCanvas.height * 0.2, x: -50, speed: 3, size: 40 },
            { emoji: '🦹', y: matrixCanvas.height * 0.2, x: matrixCanvas.width + 50, speed: -3, size: 40 },
            { emoji: '💨', y: matrixCanvas.height * 0.7, x: -50, speed: 5, size: 30 },
        ];
        const impacts = ['💥', 'POW!', 'BAM!', '👊'];

        function animateHq() {
            ctx.clearRect(0, 0, matrixCanvas.width, matrixCanvas.height);

            // Desenha e move os lutadores
            fighters.forEach(fighter => {
                ctx.font = `${fighter.size}px serif`;
                ctx.fillText(fighter.emoji, fighter.x, fighter.y);
                fighter.x += fighter.speed;

                if (fighter.speed > 0 && fighter.x > matrixCanvas.width + 50) {
                    fighter.x = -50;
                } else if (fighter.speed < 0 && fighter.x < -50) {
                    fighter.x = matrixCanvas.width + 50;
                }
            });

            // Desenha um impacto aleatório
            if (Math.random() > 0.95) { // Chance de 5% a cada quadro
                const impact = impacts[Math.floor(Math.random() * impacts.length)];
                const x = Math.random() * (matrixCanvas.width - 100) + 50;
                const y = Math.random() * (matrixCanvas.height - 50) + 25;
                const size = Math.random() * 20 + 30;
                
                ctx.font = `bold ${size}px 'Press Start 2P'`;
                ctx.fillStyle = '#f44336';
                ctx.strokeStyle = '#000';
                ctx.lineWidth = 3;
                
                ctx.strokeText(impact, x, y);
                ctx.fillText(impact, x, y);
            }
        }

        activeAnimationInterval = setInterval(animateHq, 50);

        window.addEventListener('resize', () => {
            matrixCanvas.width = window.innerWidth;
            matrixCanvas.height = window.innerHeight;
            fighters[0].y = matrixCanvas.height * 0.2;
            fighters[1].y = matrixCanvas.height * 0.2;
            fighters[2].y = matrixCanvas.height * 0.7;
        });
    }

    function startNatureAnimation() {
        const ctx = matrixCanvas.getContext('2d');
        matrixCanvas.width = window.innerWidth;
        matrixCanvas.height = window.innerHeight;

        const birds = [];
        for (let i = 0; i < 10; i++) {
            birds.push({
                x: Math.random() * matrixCanvas.width,
                y: Math.random() * (matrixCanvas.height * 0.5),
                size: Math.random() * 5 + 5,
                speed: Math.random() * 1 + 0.5,
            });
        }

        function drawBird(x, y, size) {
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x - size, y + size);
            ctx.moveTo(x, y);
            ctx.lineTo(x + size, y + size);
            ctx.strokeStyle = '#f0f0f0';
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        function animateNature() {
            ctx.clearRect(0, 0, matrixCanvas.width, matrixCanvas.height);

            // Desenha o gradiente do céu (pôr do sol)
            const skyGradient = ctx.createLinearGradient(0, 0, 0, matrixCanvas.height);
            skyGradient.addColorStop(0, '#2c3e50');
            skyGradient.addColorStop(0.6, '#fd746c');
            skyGradient.addColorStop(1, '#ffb88c');
            ctx.fillStyle = skyGradient;
            ctx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);

            // Desenha camadas de montanhas
            const mountainColors = ['#34495e', '#2c3e50', '#233140'];
            mountainColors.forEach((color, index) => {
                ctx.beginPath();
                ctx.moveTo(-100, matrixCanvas.height);
                for (let i = 0; i < matrixCanvas.width + 200; i += 150) {
                    ctx.lineTo(i, matrixCanvas.height - 100 - (index * 50) - Math.sin(i * 0.01 + index) * 40);
                }
                ctx.lineTo(matrixCanvas.width + 100, matrixCanvas.height);
                ctx.fillStyle = color;
                ctx.fill();
            });

            // Desenha e move os pássaros
            birds.forEach(bird => {
                drawBird(bird.x, bird.y, bird.size);
                bird.x += bird.speed;

                if (bird.x > matrixCanvas.width + bird.size) {
                    bird.x = -bird.size;
                    bird.y = Math.random() * (matrixCanvas.height * 0.5);
                }
            });
        }

        activeAnimationInterval = setInterval(animateNature, 50);

        window.addEventListener('resize', () => {
            matrixCanvas.width = window.innerWidth;
            matrixCanvas.height = window.innerHeight;
        });
    }

    // Loop principal para a renda passiva
    setInterval(() => {
        score += pointsPerSecond;
        checkAchievements();
        updateScore();
    }, 1000);

    // Inicializa a loja ao carregar a página
    initializeStore();
});