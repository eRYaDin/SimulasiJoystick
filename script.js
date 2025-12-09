// Konstanta dan variabel global
const WIDTH = 350;
const HEIGHT = 350;
const RADIUS = 120;
const KNOB_SIZE = 25;
const MAX_OUTPUT = 1600;
const HALL_NOISE = 50;
const TMR_NOISE = 10;
const DEADZONE = 100;
const ANALOG_NOISE = 50;

let hallData = [];
let tmrData = [];
let analogData = [];

// Mini game variables
let carX = 400;
let carY = 300;
let carSpeed = 5;
let coins = [];
let score = 0;
let gameRunning = false;
const gameCanvas = document.getElementById('game-canvas');
const gameCtx = gameCanvas.getContext('2d');

// Mini joystick variables
const miniWIDTH = 150;
const miniHEIGHT = 150;
const miniRADIUS = 50;
const miniKNOB_SIZE = 15;
const miniMAX_OUTPUT = 1600;

// Fungsi utilitas
function calculateAvgNoise(data, target) {
    if (data.length === 0) return 0;
    const deviations = data.map(val => Math.abs(val - target));
    return Math.round(deviations.reduce((a, b) => a + b, 0) / deviations.length);
}

function calculateAccuracy(avgNoise) {
    return Math.max(0, Math.round(100 - (avgNoise / 16)));
}

// Fungsi untuk membuat joystick (dioptimalkan dengan parameter isMini)
function createJoystick(canvasId, labelId, onMove, type, isMini = false) {
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext('2d');
    const centerX = (isMini ? miniWIDTH : WIDTH) / 2;
    const centerY = (isMini ? miniHEIGHT : HEIGHT) / 2;
    let knobX = centerX;
    let knobY = centerY;
    let isDragging = false;
    const radius = isMini ? miniRADIUS : RADIUS;
    const knobSize = isMini ? miniKNOB_SIZE : KNOB_SIZE;
    const maxOutput = isMini ? miniMAX_OUTPUT : MAX_OUTPUT;

    function drawOuterCircle() {
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    function drawKnob() {
        ctx.beginPath();
        ctx.arc(knobX, knobY, knobSize, 0, 2 * Math.PI);
        ctx.fillStyle = 'red';
        ctx.fill();
    }

    function redraw() {
        ctx.clearRect(0, 0, isMini ? miniWIDTH : WIDTH, isMini ? miniHEIGHT : HEIGHT);
        drawOuterCircle();
        drawKnob();
    }

    redraw();

    // Event listeners (dioptimalkan dengan fungsi handler)
    const handleStart = (e) => {
        isDragging = true;
        moveKnob(e.touches ? e.touches[0] : e);
    };
    const handleMove = (e) => {
        if (isDragging) {
            e.preventDefault();
            moveKnob(e.touches ? e.touches[0] : e);
        }
    };
    const handleEnd = () => {
        isDragging = false;
        smoothCenter();
    };

    canvas.addEventListener('mousedown', handleStart);
    canvas.addEventListener('mousemove', handleMove);
    canvas.addEventListener('mouseup', handleEnd);
    canvas.addEventListener('touchstart', handleStart);
    canvas.addEventListener('touchmove', handleMove);
    canvas.addEventListener('touchend', handleEnd);

    function moveKnob(e) {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        let dx = mouseX - centerX;
        let dy = mouseY - centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > radius) {
            const scale = radius / dist;
            dx *= scale;
            dy *= scale;
        }

        knobX = centerX + dx;
        knobY = centerY + dy;

        redraw();

        let normX = Math.round((dx / radius) * maxOutput);
        let normY = Math.round((dy / radius) * maxOutput);

        // Apply deadzone for analog
        if (type === 'analog' && Math.abs(normX) < DEADZONE) normX = 0;
        if (type === 'analog' && Math.abs(normY) < DEADZONE) normY = 0;

        onMove(normX, normY, type);
    }

    function smoothCenter() {
        if (isDragging) return;

        const dx = centerX - knobX;
        const dy = centerY - knobY;

        if (Math.abs(dx) < 1 && Math.abs(dy) < 1) {
            knobX = centerX;
            knobY = centerY;
            redraw();
            return;
        }

        knobX += dx * 0.2;
        knobY += dy * 0.2;

        redraw();
        setTimeout(smoothCenter, 10);
    }
}

// Fungsi untuk membuat graph (tetap sama, sudah efisien)
function createGraph(canvasId, datasets) {
    const graphCanvas = document.getElementById(canvasId);
    const chart = new Chart(graphCanvas, {
        type: 'line',
        data: {
            labels: [],
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            elements: {
                point: {
                    radius: 0
                },
                line: {
                    borderWidth: 2
                }
            },
            scales: {
                x: {
                    type: 'linear',
                    position: 'bottom',
                    grid: {
                        display: true,
                        color: 'rgba(0,0,0,0.1)'
                    }
                },
                y: {
                    min: -1600,
                    max: 1600,
                    grid: {
                        display: true,
                        color: 'rgba(0,0,0,0.1)'
                    }
                }
            },
            plugins: {
                tooltip: {
                    enabled: true,
                    mode: 'index',
                    intersect: false
                },
                zoom: {
                    zoom: {
                        wheel: {
                            enabled: true,
                        },
                        pinch: {
                            enabled: true
                        },
                        mode: 'xy',
                    },
                    pan: {
                        enabled: true,
                        mode: 'xy',
                    },
                }
            },
            backgroundColor: 'white'
        }
    });

    let timeStep = 0;
    const maxDataPoints = 200;

    return function updateGraph(values) {
        timeStep++;
        chart.data.labels.push(timeStep);
        datasets.forEach((dataset, index) => {
            dataset.data.push(values[index]);
        });

        if (chart.data.labels.length > maxDataPoints) {
            chart.data.labels.shift();
            datasets.forEach(dataset => dataset.data.shift());
        }

        chart.update();
    };
}

// Inisialisasi joystick utama dan graph
const updateGraph1 = createGraph('graph-canvas1', [{
    label: 'Hall X',
    data: [],
    borderColor: 'blue',
    fill: false,
    borderWidth: 2
}]);
createJoystick('joystick-canvas1', 'label-hall', (normX, normY, type) => {
    const hallX = normX + Math.floor(Math.random() * (HALL_NOISE * 2 + 1)) - HALL_NOISE;
    document.getElementById('label-hall').textContent = `Hall: X=${hallX}  Y=${normY}`;
    hallData.push(hallX);
    if (hallData.length > 100) hallData.shift();
    const avgNoise = calculateAvgNoise(hallData, normX);
    const accuracy = calculateAccuracy(avgNoise);
    document.getElementById('stats-hall').textContent = `Avg Noise: ${avgNoise} | Accuracy: ${accuracy}%`;
    updateGraph1([hallX]);
}, 'hall');

const updateGraph2 = createGraph('graph-canvas2', [{
    label: 'TMR X',
    data: [],
    borderColor: 'green',
    fill: false,
    borderWidth: 2
}]);
createJoystick('joystick-canvas2', 'label-tmr', (normX, normY, type) => {
    const jitter = Math.sin(Date.now() / 100) * 5;
    const tmrX = normX + Math.floor(Math.random() * (TMR_NOISE * 2 + 1)) - TMR_NOISE + jitter;
    document.getElementById('label-tmr').textContent = `TMR: X=${Math.round(tmrX)}  Y=${normY}`;
    tmrData.push(tmrX);
    if (tmrData.length > 100) tmrData.shift();
    const avgNoise = calculateAvgNoise(tmrData, normX);
    const accuracy = calculateAccuracy(avgNoise);
    document.getElementById('stats-tmr').textContent = `Avg Noise: ${avgNoise} | Accuracy: ${accuracy}%`;
    updateGraph2([tmrX]);
}, 'tmr');

const updateGraph3 = createGraph('graph-canvas3', [{
    label: 'Analog X',
    data: [],
    borderColor: 'orange',
    fill: false,
    borderWidth: 2
}]);
createJoystick('joystick-canvas3', 'label-analog', (normX, normY, type) => {
    const analogX = normX + Math.floor(Math.random() * (ANALOG_NOISE * 2 + 1)) - ANALOG_NOISE;
    document.getElementById('label-analog').textContent = `Analog: X=${analogX}  Y=${normY}`;
    analogData.push(analogX);
    if (analogData.length > 100) analogData.shift();
    const avgNoise = calculateAvgNoise(analogData, normX);
    const accuracy = calculateAccuracy(avgNoise);
    document.getElementById('stats-analog').textContent = `Avg Noise: ${avgNoise} | Accuracy: ${accuracy}%`;
    updateGraph3([analogX]);
}, 'analog');

const updateGraph4 = createGraph('graph-canvas4', [
    { label: 'Hall X', data: [], borderColor: 'blue', fill: false, borderWidth: 2 },
    { label: 'TMR X', data: [], borderColor: 'green', fill: false, borderWidth: 2 },
    { label: 'Analog X', data: [], borderColor: 'orange', fill: false, borderWidth: 2 }
]);
createJoystick('joystick-canvas4', 'label-comp-hall', (normX, normY, type) => {
    const hallX = normX + Math.floor(Math.random() * (HALL_NOISE * 2 + 1)) - HALL_NOISE;
    document.getElementById('label-comp-hall').textContent = `Hall: X=${hallX}  Y=${normY}`;
    hallData.push(hallX);
    if (hallData.length > 100) hallData.shift();
    const hallAvgNoise = calculateAvgNoise(hallData, normX);

    const jitter = Math.sin(Date.now() / 100) * 5;
    const tmrX = normX + Math.floor(Math.random() * (TMR_NOISE * 2 + 1)) - TMR_NOISE + jitter;
    document.getElementById('label-comp-tmr').textContent = `TMR: X=${Math.round(tmrX)}  Y=${normY}`;
    tmrData.push(tmrX);
    if (tmrData.length > 100) tmrData.shift();
    const tmrAvgNoise = calculateAvgNoise(tmrData, normX);

    let analogNormX = normX;
    if (Math.abs(analogNormX) < DEADZONE) analogNormX = 0;
    const analogX = analogNormX + Math.floor(Math.random() * (ANALOG_NOISE * 2 + 1)) - ANALOG_NOISE;
    document.getElementById('label-comp-analog').textContent = `Analog: X=${analogX}  Y=${normY}`;
    analogData.push(analogX);
    if (analogData.length > 100) analogData.shift();
    const analogAvgNoise = calculateAvgNoise(analogData, analogNormX);

    document.getElementById('stats-comp').textContent = `Hall Noise: ${hallAvgNoise} | TMR Noise: ${tmrAvgNoise} | Analog Noise: ${analogAvgNoise}`;
    updateGraph4([hallX, tmrX, analogX]);

    if (gameRunning) {
        carX += (normX / MAX_OUTPUT) * carSpeed;
        carY += (normY / MAX_OUTPUT) * carSpeed;
        carX = Math.max(20, Math.min(780, carX));
        carY = Math.max(20, Math.min(580, carY));
    }
}, 'comparison');

// Inisialisasi mini joysticks untuk mini game
createJoystick('mini-joystick1', null, (normX, normY, type) => {
    if (gameRunning) {
        carX += (normX / miniMAX_OUTPUT) * carSpeed;
        carY += (normY / miniMAX_OUTPUT) * carSpeed;
        carX = Math.max(20, Math.min(780, carX));
        carY = Math.max(20, Math.min(580, carY));
    }
}, 'hall', true);

createJoystick('mini-joystick2', null, (normX, normY, type) => {
    if (gameRunning) {
        carX += (normX / miniMAX_OUTPUT) * carSpeed;
        carY += (normY / miniMAX_OUTPUT) * carSpeed;
        carX = Math.max(20, Math.min(780, carX));
        carY = Math.max(20, Math.min(580, carY));
    }
}, 'tmr', true);

createJoystick('mini-joystick3', null, (normX, normY, type) => {
    if (gameRunning) {
        let analogNormX = normX;
        let analogNormY = normY;
        if (Math.abs(analogNormX) < DEADZONE) analogNormX = 0;
        if (Math.abs(analogNormY) < DEADZONE) analogNormY = 0;
        carX += (analogNormX / miniMAX_OUTPUT) * carSpeed;
        carY += (analogNormY / miniMAX_OUTPUT) * carSpeed;
        carX = Math.max(20, Math.min(780, carX));
        carY = Math.max(20, Math.min(580, carY));
    }
}, 'analog', true);

createJoystick('mini-joystick4', null, (normX, normY, type) => {
    if (gameRunning) {
        carX += (normX / miniMAX_OUTPUT) * carSpeed;
        carY += (normY / miniMAX_OUTPUT) * carSpeed;
        carX = Math.max(20, Math.min(780, carX));
        carY = Math.max(20, Math.min(580, carY));
    }
}, 'comparison', true);

// Menu navigation
document.getElementById('desktop-mode-start').addEventListener('click', () => {
    document.getElementById('start-menu').style.display = 'none';
    document.getElementById('main-menu').style.display = 'block';
});

document.getElementById('mobile-mode-start').addEventListener('click', () => {
    document.getElementById('start-menu').style.display = 'none';
    document.getElementById('main-menu').style.display = 'block';
    document.body.classList.add('mobile-mode');
});

document.getElementById('mini-game-btn').addEventListener('click', () => {
    document.getElementById('main-menu').style.display = 'none';
    document.getElementById('mini-game').style.display = 'block';
    startMiniGame();
});

document.getElementById('back-to-main').addEventListener('click', () => {
    document.getElementById('mini-game').style.display = 'none';
    document.getElementById('main-menu').style.display = 'block';
    stopMiniGame();
});

// Mini game functions
function startMiniGame() {
    gameRunning = true;
    score = 0;
    carX = 400;
    carY = 300;
    coins = [];
    spawnCoins();
    gameLoop();
}

function stopMiniGame() {
    gameRunning = false;
}

function spawnCoins() {
    for (let i = 0; i < 5; i++) {
        coins.push({
            x: Math.random() * 760 + 20,
            y: Math.random() * 560 + 20,
            radius: 10
        });
    }
}

function gameLoop() {
    if (!gameRunning) return;

    gameCtx.clearRect(0, 0, 800, 600);

    // Draw car
    gameCtx.fillStyle = 'blue';
    gameCtx.fillRect(carX - 15, carY - 15, 30, 30);

    // Draw coins and check collision
    gameCtx.fillStyle = 'gold';
    coins.forEach((coin, index) => {
        gameCtx.beginPath();
        gameCtx.arc(coin.x, coin.y, coin.radius, 0, 2 * Math.PI);
        gameCtx.fill();

        const dx = carX - coin.x;
        const dy = carY - coin.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 15 + coin.radius) {
            coins.splice(index, 1);
            score += 10;
            coins.push({
                x: Math.random() * 760 + 20,
                y: Math.random() * 560 + 20,
                radius: 10
            });
        }
    });

    document.getElementById('game-stats').textContent = `Score: ${score} | Koin: ${coins.length}`;

    requestAnimationFrame(gameLoop);
}
