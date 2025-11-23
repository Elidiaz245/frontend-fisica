// ================================

// ================================
document.getElementById("btnCalcular").addEventListener("click", calcularFuerzasManual);

function calcularFuerzasManual() {
    let m = parseFloat(document.getElementById("masa").value) || null;
    let mu = parseFloat(document.getElementById("mu").value) || 0;
    let Fap = parseFloat(document.getElementById("fap").value) || null;
    let a = parseFloat(document.getElementById("acel").value) || null;

    calcularYMostrar(m, mu, Fap, a);
}

// ================================

// ================================
document.getElementById("btnResolver").addEventListener("click", async () => {
    let texto = document.getElementById("enunciado").value;
    if (!texto.trim()) return alert("Escribe un enunciado primero.");
      // LIMPIAR TEXTO: eliminar $$ o caracteres especiales no deseados
    texto = texto.replace(/\$\$/g, '');           // elimina $$ de LaTeX
    texto = texto.replace(/[^\x00-\x7F]/g, '');  // elimina caracteres Unicode extraños

    document.getElementById("resultados").innerHTML = "Resolviendo...";

    try {
      const response = await fetch("https://backend-fisica.onrender.com/resolverIA", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt: texto })
        });

        const data = await response.json();
       document.getElementById("resultados").innerHTML = `<div style="white-space: pre-wrap; word-break: break-word;">${data.respuesta}</div>`;

    } catch (error) {
        console.error(error);
        document.getElementById("resultados").innerHTML = "Error .";
    }
});

// ================================

// ================================
function calcularYMostrar(m, mu, Fap, a, problema="Manual") {
    const g = 9.8;
    let Fg = m !== null ? m * g : null;
    let N = Fg;
    let Ff = null;
    let Fnet = null;

    if ((Fap === null || Fap === 0) && (a === null || a === 0)) {
        Ff = mu * N;
        Fap = 0;
        Fnet = 0;
        a = 0;
    } else {
        if (Fap === null && m !== null && a !== null) Fap = m * a;
        if (a === null && m !== null && Fap !== null) a = Fap / m;
        Ff = mu * N;
        Fnet = (Fap !== null ? Fap : 0) - Ff;
        if (m !== null) a = Fnet / m;
    }

    let text = `
        Problema: ${problema}<br>
        Masa: ${m !== null ? m.toFixed(2) : "No encontrado"} kg<br>
        Fuerza de gravedad: ${Fg !== null ? Fg.toFixed(2) : "No encontrado"} N<br>
        Fuerza normal: ${N !== null ? N.toFixed(2) : "No encontrado"} N<br>
        Fuerza de fricción: ${Ff !== null ? Ff.toFixed(2) : "No calculada"} N<br>
        Fuerza aplicada / tensión: ${Fap !== null ? Fap.toFixed(2) : "No calculada"} N<br>
        Fuerza neta: ${Fnet !== null ? Fnet.toFixed(2) : "No calculada"} N<br>
        Aceleración: ${a !== null ? a.toFixed(2) : "No calculada"} m/s²
    `;
    document.getElementById("resultados").innerHTML = text;

    dibujarSimulador(Fap || 0, Ff || 0, Fg || 0, N || 0);
}

// ================================

// ================================
function dibujarSimulador(Fap, Ff, Fg, N) {
    let canvas = document.getElementById("canvas");
    let ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "black";
    ctx.fillRect(280, 140, 40, 40);

    let scale = 2;

    // Fuerza aplicada (derecha)
    ctx.beginPath();
    ctx.moveTo(300, 160);
    ctx.lineTo(300 + Fap * scale, 160);
    ctx.strokeStyle = "green";
    ctx.lineWidth = 3;
    ctx.stroke();

    // Fricción (izquierda)
    ctx.beginPath();
    ctx.moveTo(300, 170);
    ctx.lineTo(300 - Ff * scale, 170);
    ctx.strokeStyle = "red";
    ctx.lineWidth = 3;
    ctx.stroke();

    // Gravedad (abajo)
    ctx.beginPath();
    ctx.moveTo(300, 180);
    ctx.lineTo(300, 180 + Fg * 0.1);
    ctx.strokeStyle = "blue";
    ctx.lineWidth = 3;
    ctx.stroke();

    // Normal (arriba)
    ctx.beginPath();
    ctx.moveTo(300, 140);
    ctx.lineTo(300, 140 - N * 0.1);
    ctx.strokeStyle = "purple";
    ctx.lineWidth = 3;
    ctx.stroke();
}
// === GRÁFICA ESTÁTICA DE FUERZAS (SOLO VISUAL) ===

// --- FRICCIÓN ---
const canvasFf = document.getElementById("canvasFf");
const ctxFf = canvasFf.getContext("2d");

const sliderFf = document.getElementById("sliderFf");
const valorFfLabel = document.getElementById("valorFf");

let FfValue = parseFloat(sliderFf.value);

// Función para dibujar la caja y la flecha de fricción
function dibujarFriccion() {
    ctxFf.clearRect(0, 0, canvasFf.width, canvasFf.height);

    ctxFf.fillStyle = "gray";
    ctxFf.fillRect(250, 80, 100, 40);

    const scale = 10;
    ctxFf.beginPath();
    ctxFf.moveTo(250, 100);
    ctxFf.lineTo(250 - FfValue * scale, 100);
    ctxFf.strokeStyle = "red";
    ctxFf.lineWidth = 4;
    ctxFf.stroke();

    ctxFf.beginPath();
    ctxFf.moveTo(250 - FfValue * scale, 100);
    ctxFf.lineTo(250 - FfValue * scale + 5, 95);
    ctxFf.lineTo(250 - FfValue * scale + 5, 105);
    ctxFf.fillStyle = "red";
    ctxFf.fill();
}

sliderFf.addEventListener("input", () => {
    FfValue = parseFloat(sliderFf.value);
    valorFfLabel.textContent = FfValue;
    dibujarFriccion();
});

dibujarFriccion();

// --- TENSIÓN ---
const canvasT = document.getElementById("canvasT");
const ctxT = canvasT.getContext("2d");

const sliderT = document.getElementById("sliderT");
const valorTLabel = document.getElementById("valorT");

let TValue = parseFloat(sliderT.value);
const FgTension = 10; // Peso fijo del simulador de tensión

function dibujarTension() {
    ctxT.clearRect(0, 0, canvasT.width, canvasT.height);

    ctxT.fillStyle = "gray";
    ctxT.fillRect(90, 200, 20, 20);

    const scale = 10;

    // Flecha de Tensión
    ctxT.beginPath();
    ctxT.moveTo(100, 200);
    ctxT.lineTo(100, 200 - TValue * scale);
    ctxT.strokeStyle = "green";
    ctxT.lineWidth = 3;
    ctxT.stroke();

    ctxT.beginPath();
    ctxT.moveTo(100, 200 - TValue * scale);
    ctxT.lineTo(95, 200 - TValue * scale + 5);
    ctxT.lineTo(105, 200 - TValue * scale + 5);
    ctxT.fillStyle = "green";
    ctxT.fill();

    // Flecha de Peso
    ctxT.beginPath();
    ctxT.moveTo(100, 220);
    ctxT.lineTo(100, 220 + FgTension * scale);
    ctxT.strokeStyle = "blue";
    ctxT.lineWidth = 3;
    ctxT.stroke();

    ctxT.beginPath();
    ctxT.moveTo(100, 220 + FgTension * scale);
    ctxT.lineTo(95, 220 + FgTension * scale - 5);
    ctxT.lineTo(105, 220 + FgTension * scale - 5);
    ctxT.fillStyle = "blue";
    ctxT.fill();
}

sliderT.addEventListener("input", () => {
    TValue = parseFloat(sliderT.value);
    valorTLabel.textContent = TValue;
    dibujarTension();
});

dibujarTension();

// --- PESO ---
const canvasFg = document.getElementById("canvasFg");
const ctxFg = canvasFg.getContext("2d");

const sliderFg = document.getElementById("sliderFg");
const valorFgLabel = document.getElementById("valorFg");

let FgValue = parseFloat(sliderFg.value);

function dibujarPeso() {
    ctxFg.clearRect(0, 0, canvasFg.width, canvasFg.height);

    ctxFg.fillStyle = "gray";
    ctxFg.fillRect(90, 80, 20, 20);

    const scale = 10;
    ctxFg.beginPath();
    ctxFg.moveTo(100, 100);
    ctxFg.lineTo(100, 100 + FgValue * scale);
    ctxFg.strokeStyle = "blue";
    ctxFg.lineWidth = 3;
    ctxFg.stroke();

    ctxFg.beginPath();
    ctxFg.moveTo(100, 100 + FgValue * scale);
    ctxFg.lineTo(95, 100 + FgValue * scale - 5);
    ctxFg.lineTo(105, 100 + FgValue * scale - 5);
    ctxFg.fillStyle = "blue";
    ctxFg.fill();
}

sliderFg.addEventListener("input", () => {
    FgValue = parseFloat(sliderFg.value);
    valorFgLabel.textContent = FgValue;
    dibujarPeso();
});

dibujarPeso();

// --- FUERZA NORMAL ---
const canvasN = document.getElementById("canvasN");
const ctxN = canvasN.getContext("2d");

const sliderN = document.getElementById("sliderN");
const valorNLabel = document.getElementById("valorN");

let NValue = parseFloat(sliderN.value);
const FgNormal = 10; // peso fijo para el simulador de normal

function dibujarNormal() {
    ctxN.clearRect(0, 0, canvasN.width, canvasN.height);

    // Bloque sobre la superficie
    ctxN.fillStyle = "gray";
    ctxN.fillRect(90, 80, 20, 20);

    const scale = 10;

    // Flecha de Fuerza Normal (arriba)
    ctxN.beginPath();
    ctxN.moveTo(100, 100);
    ctxN.lineTo(100, 100 - NValue * scale);
    ctxN.strokeStyle = "purple";
    ctxN.lineWidth = 3;
    ctxN.stroke();

    ctxN.beginPath();
    ctxN.moveTo(100, 100 - NValue * scale);
    ctxN.lineTo(95, 100 - NValue * scale + 5);
    ctxN.lineTo(105, 100 - NValue * scale + 5);
    ctxN.fillStyle = "purple";
    ctxN.fill();

    // Flecha de Peso (abajo)
    ctxN.beginPath();
    ctxN.moveTo(100, 100 + 20);
    ctxN.lineTo(100, 100 + 20 + FgNormal * scale);
    ctxN.strokeStyle = "blue";
    ctxN.lineWidth = 3;
    ctxN.stroke();

    ctxN.beginPath();
    ctxN.moveTo(100, 100 + 20 + FgNormal * scale);
    ctxN.lineTo(95, 100 + 20 + FgNormal * scale - 5);
    ctxN.lineTo(105, 100 + 20 + FgNormal * scale - 5);
    ctxN.fillStyle = "blue";
    ctxN.fill();
}

// Actualizar cuando cambia el slider
sliderN.addEventListener("input", () => {
    NValue = parseFloat(sliderN.value);
    valorNLabel.textContent = NValue;
    dibujarNormal();
});

// Dibujo inicial
dibujarNormal();
