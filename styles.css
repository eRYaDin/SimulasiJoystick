const WIDTH = 350;
const HEIGHT = 350;
const RADIUS = 120;
const KNOB_SIZE = 25;
const MAX_OUTPUT = 1600;
const HALL_NOISE = 100;  // Increased for more difference
const TMR_NOISE = 10;    // Lower for smoother
const DEADZONE = 50;     // For analog

let hallData = [];
let tmrData = [];
let analogData = [];

// Function to calculate average noise
function calculateAvgNoise(data, target) {
    if (data.length === 0) return 0;
    const deviations = data.map(val => Math.abs(val - target));
    return Math.round(deviations.reduce((a, b) => a + b, 0) / deviations.length);
}

// Function to calculate accuracy (inverse of noise, scaled)
function calculateAccuracy(avgNoise) {
    return Math.max(0, Math.round(100 - (avgNoise / 16)));  // Scale to 0-100
}

// Function to create joystick
function createJoystick(canvasId, labelId, onMove, type) {
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext('2d');
    const centerX = WIDTH / 2;
    const centerY = HEIGHT / 2;
    let knobX = centerX;
    let knobY = centerY;
    let isDragging = false;
    let driftX = 0;
    let driftY = 0;

    function drawOuterCircle() {
        ctx.beginPath();
        ctx.arc(centerX, centerY, RADIUS, 0, 2 * Math.PI);
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    function drawKnob() {
        ctx.beginPath();
        ctx.arc(knobX, knobY, KNOB_SIZE, 0, 2 * Math.PI);
        ctx.fillStyle = 'red';
        ctx.fill();
    }

    function redraw() {
        ctx.clearRect(0, 0, WIDTH, HEIGHT);
        drawOuterCircle();
        drawKnob();
    }

    redraw();

    // Drift for Hall
    if (type === 'hall') {
        setInterval(() => {
            if (!isDragging) {
                driftX += (Math.random() - 0.5) * 10;
                driftY += (Math.random() - 0.5) * 10;
                driftX = Math.max(-RADIUS, Math.min(RADIUS, driftX));
                driftY = Math.max(-RADIUS, Math.min(RADIUS, driftY));
                knobX = centerX + driftX;
                knobY = centerY + driftY;
                redraw();
                const normX = Math.round((driftX / RADIUS) * MAX_OUTPUT);
                const normY = Math.round((driftY / RADIUS) * MAX_OUTPUT);
                const hallX = normX + Math.floor(Math.random() * (HALL_NOISE * 2 + 1)) - HALL_NOISE;
                document.getElementById(labelId).textContent = `Hall: X=${hallX}  Y=${normY}`;
                hallData.push(hallX);
                if (hallData.length > 100) hallData.shift();
                const avgNoise = calculateAvgNoise(hallData, normX);
                const accuracy = calculateAccuracy(avgNoise);
                document.getElementById('stats-hall').textContent = `Avg Noise: ${avgNoise} | Accuracy: ${accuracy}%`;
                updateGraph1([hallX]);
            }
        }, 500);  // Drift every 500ms
    }

    canvas.addEventListener('mousedown', (e) => {
        isDragging = true;
        moveKnob(e);
    });

    canvas.addEventListener('mousemove', (e) => {
        if (isDragging) {
            moveKnob(e);
        }
    });

    canvas.addEventListener('mouseup', () => {
        isDragging = false;
        smoothCenter();
    });

    // Touch events for mobile
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        isDragging = true;
        moveKnob(e.touches[0]);
    });

    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        if (isDragging) {
            moveKnob(e.touches[0]);
        }
    });

    canvas.addEventListener('touchend', () => {
        isDragging = false;
        smoothCenter();
    });

    function moveKnob(e) {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        let dx = mouseX - centerX;
        let dy = mouseY - centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > RADIUS) {
            const scale = RADIUS / dist;
            dx *= scale;
            dy *= scale;
        }

        knobX = centerX + dx;
        knobY = centerY + dy;

        redraw();

        let normX = Math.round((dx / RADIUS) * MAX_OUTPUT);
        let normY = Math.round((dy / RADIUS) * MAX_OUTPUT);

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

// Function to create graph with zoom
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
            elements: {
                point: {
                    radius: 0  // No points on the line
                }
            },
            scales: {
                x: {
                    type: 'linear',
                    position: 'bottom'
                },
                y: {
                    min: -1600,
                    max: 1600
                }
            },
            plugins: {
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
            }
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

// Hall Joystick (1) - High noise + drift
const updateGraph1 = createGraph('graph-canvas1', [{
    label: 'Hall X',
    data: [],
    borderColor: 'blue',
    fill: false
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

// TMR Joystick (2) - Low noise + jitter
const updateGraph2 = createGraph('graph-canvas2', [{
    label: 'TMR X',
    data: [],
    borderColor: 'green',
    fill: false
}]);
createJoystick('joystick-canvas2', 'label-tmr', (normX, normY, type) => {
    const jitter = Math.sin(Date.now() / 100) * 5;  // Small jitter
    const tmrX = normX + Math.floor(Math.random() * (TMR_NOISE * 2 + 1)) - TMR_NOISE + jitter;
    document.getElementById('label-tmr').textContent = `TMR: X=${Math.round(tmrX)}  Y=${normY}`;
    tmrData.push(tmrX);
    if (tmrData.length > 100) tmrData.shift();
    const avgNoise = calculateAvgNoise(tmrData, normX);
    const accuracy = calculateAccuracy(avgNoise);
    document.getElementById('stats-tmr').textContent = `Avg Noise: ${avgNoise} | Accuracy: ${accuracy}%`;
    updateGraph2([tmrX]);
}, 'tmr');

// Analog Joystick (3) - No noise + deadzone
const updateGraph3 = createGraph('graph-canvas3', [{
    label: 'Analog X',
    data: [],
    borderColor: 'orange',
    fill: false
}]);
createJoystick('joystick-canvas3', 'label-analog', (normX, normY, type) => {
    document.getElementById('label-analog').textContent = `Analog: X=${normX}  Y=${normY}`;
    analogData.push(normX);
    if (analogData.length > 100) analogData.shift();
    const avgNoise = calculateAvgNoise(analogData, normX);
    const accuracy = calculateAccuracy(avgNoise);
    document.getElementById('stats-analog').textContent = `Avg Noise: ${avgNoise} | Accuracy: ${accuracy}%`;
    updateGraph3([normX]);
}, 'analog');

// Comparison Joystick (4) - Controls all graphs
const updateGraph4 = createGraph('graph-canvas4', [
    { label: 'Hall X', data: [], borderColor: 'blue', fill: false },
    { label: 'TMR X', data: [], borderColor: 'green', fill: false },
    { label: 'Analog X', data: [], borderColor: 'orange', fill: false }
]);
createJoystick('joystick-canvas4', null, (normX, normY, type) => {
    const hallX = normX + Math.floor(Math.random() * (HALL_NOISE * 2 + 1)) - HALL_NOISE;
    const jitter = Math.sin(Date.now() / 100) * 5;
    const tmrX = normX + Math.floor(Math.random() * (TMR_NOISE * 2 + 1)) - TMR_NOISE + jitter;
    let analogX = normX;
    if (Math.abs(analogX) < DEADZONE) analogX = 0;

    document.getElementById('label-comp-hall').textContent = `Hall: X=${hallX}  Y=${normY}`;
    document.getElementById('label-comp-tmr').textContent = `TMR: X=${Math.round(tmrX)}  Y=${normY}`;
    document.getElementById('label-comp-analog').textContent = `Analog: X=${analogX}  Y=${normY}`;

    hallData.push(hallX);
    tmrData.push(tmrX);
    analogData.push(analogX);
    [hallData, tmrData, analogData].forEach(arr => { if (arr.length > 100) arr.shift(); });

    const hallAvg = calculateAvgNoise(hallData, normX);
    const tmrAvg = calculateAvgNoise(tmrData, normX);
    const analogAvg = calculateAvgNoise(analogData, normX);
    document.getElementById('stats-comp').textContent = `Hall Noise: ${hallAvg} | TMR Noise: ${tmrAvg} | Analog Noise: ${analogAvg}`;

    updateGraph4([hallX, tmrX, analogX]);
    updateGraph1([hallX]);
    updateGraph2([tmrX]);
    updateGraph3([analogX]);
}, 'comp');
