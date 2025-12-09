// Constants
const DICE_FACES = {1:"⚀",2:"⚁",3:"⚂",4:"⚃",5:"⚄",6:"⚅"};
const SYMBOLS = ["🍒", "🍋", "🍇", "💎", "🍀", "🔔"];
const COINS = ["Kepala", "Ekor"];
const COLORS = ["Merah", "Hitam", "Hijau"];

// Global Variables (Tidak ada penyimpanan data, hanya untuk percobaan)
let playerEmail = "";
let playerCredit = 100;
let playerTotalPoints = 0;

// Utility Functions
function showPage(pageId) {
    document.querySelectorAll('.container > div').forEach(div => div.classList.add('hidden'));
    document.getElementById(pageId).classList.remove('hidden');
}

function updateStatus() {
    document.getElementById('status').textContent = `👤 Email: ${playerEmail} | 💰 Kredit: ${playerCredit} | ⭐ Total Poin: ${playerTotalPoints}`;
}

function signInWithGoogle() {
    // Simulasi sign-in Google (langsung ke menu dengan email dummy)
    playerEmail = "user@gmail.com"; // Dummy email untuk percobaan
    playerCredit = 100;
    playerTotalPoints = 0;
    showPage('menu-page');
    updateStatus();
}

function signInWithEmail() {
    showPage('account-page');
}

function createAccount() {
    playerEmail = document.getElementById('player-email').value.trim();
    if (!playerEmail) {
        document.getElementById('account-info').textContent = "❗Masukkan email yang valid.";
        return;
    }
    playerCredit = 100; // modal awal
    playerTotalPoints = 0;
    showPage('menu-page');
    updateStatus();
}

function followIG() {
    window.open('https://www.instagram.com/ajk_rafif_yasin/', '_blank');
    playerCredit += 50;
    playerTotalPoints += 50;
    updateStatus();
    alert("Terima kasih telah follow! +50 kredit telah ditambahkan (Beta).");
}

function logout() {
    playerEmail = "";
    playerCredit = 100;
    playerTotalPoints = 0;
    showPage('signin-page');
}

function backToMenu() {
    showPage('menu-page');
}

function openGame(game) {
    showPage(`${game}-page`);
}

// Dice Game
function animateDice(callback) {
    let start = Date.now();
    let interval = setInterval(() => {
        if (Date.now() - start > 700) {
            clearInterval(interval);
            callback();
            return;
        }
        document.getElementById('dice-display').textContent = DICE_FACES[Math.floor(Math.random() * 6) + 1];
    }, 80);
}

function startDice() {
    let rounds = parseInt(document.getElementById('rounds').value) || 5;
    rounds = Math.max(5, Math.min(rounds, 10));
    let cost = 3 * rounds;
    if (playerCredit < cost) {
        document.getElementById('dice-output').textContent = "❌ Kredit tidak cukup untuk bermain!\n";
        return;
    }
    playerCredit -= cost;
    updateStatus();
    let output = document.getElementById('dice-output');
    output.textContent = `🎲 Memulai ${rounds} ronde...\nBiaya: ${cost} kredit\n\n`;
    let totalScore = 0;
    let prevNumber = null;
    let streak = 1;
    let round = 0;

    function nextRound() {
        if (round >= rounds) {
            output.textContent += `\n🏁 Total skor sesi ini: ${totalScore}\n`;
            playerTotalPoints += totalScore;
            playerCredit += totalScore;
            updateStatus();
            document.getElementById('dice-display').textContent = "🎲";
            return;
        }
        round++;
        output.textContent += `🌀 Ronde ke-${round}\n`;
        animateDice(() => {
            let number = Math.floor(Math.random() * 6) + 1;
            document.getElementById('dice-display').textContent = DICE_FACES[number];
            output.textContent += `Lemparan: ${number}\n`;
            if (number === prevNumber) {
                streak++;
            } else {
                streak = 1;
            }
            if (streak === 2) {
                output.innerHTML += `<span class="bonus">🔥 Dapat angka ${number} dua kali berturut-turut!\n   ➕ Tambah ${number * 2} poin!\n</span>`;
                totalScore += number * 2;
                animateDice(() => {
                    let bonus = Math.floor(Math.random() * 6) + 1;
                    document.getElementById('dice-display').textContent = DICE_FACES[bonus];
                    output.innerHTML += `<span class="bonus">🎁 Bonus: ${bonus}\n</span>`;
                    totalScore += bonus;
                    prevNumber = number;
                    setTimeout(nextRound, 400);
                });
            } else if (streak > 2) {
                output.innerHTML += `<span class="bonus">🔥 ${streak} kali berturut-turut angka ${number}! Skor dikali ${streak}!\n</span>`;
                totalScore += number * streak;
                prevNumber = number;
                setTimeout(nextRound, 400);
            } else {
                output.innerHTML += `<span class="normal">   ➕ Tambah ${number} poin.\n</span>`;
                totalScore += number;
                prevNumber = number;
                setTimeout(nextRound, 400);
            }
        });
    }
    nextRound();
}

// Slot Game
function animateSlot(callback) {
    let start = Date.now();
    let interval = setInterval(() => {
        if (Date.now() - start > 1200) {
            clearInterval(interval);
            callback();
            return;
        }
        document.getElementById('slot1').textContent = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
        document.getElementById('slot2').textContent = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
        document.getElementById('slot3').textContent = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
    }, 100);
}

function spinSlot() {
    let cost = 20;
    if (playerCredit < cost) {
        document.getElementById('slot-output').textContent = "❌ Kredit tidak cukup untuk memutar slot!\n";
        return;
    }
    playerCredit -= cost;
    updateStatus();
    let output = document.getElementById('slot-output');
    output.textContent = `🎰 Memutar mesin slot (Biaya: ${cost})...\n\n`;
    animateSlot(() => {
        let results = [SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)], SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)], SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]];
        document.getElementById('slot1').textContent = results[0];
        document.getElementById('slot2').textContent = results[1];
        document.getElementById('slot3').textContent = results[2];
        let unique = new Set(results).size;
        let score;
        if (unique === 1) {
            score = 150;
            output.innerHTML += `<span class="bonus">💎 JACKPOT! ${results.join(' ')} → +${score} poin!\n</span>`;
        } else if (unique === 2) {
            score = 50;
            output.innerHTML += `<span class="bonus">✨ Dua simbol sama! ${results.join(' ')} → +${score} poin.\n</span>`;
        } else {
            score = 10;
            output.innerHTML += `<span class="normal">🙂 Tidak cocok semua. ${results.join(' ')} → +${score} poin.\n</span>`;
        }
        playerTotalPoints += score;
        playerCredit += score;
        updateStatus();
    });
}

// Coin Game
function flipCoin() {
    let choice = document.querySelector('input[name="coin-choice"]:checked').value;
    let bet = parseInt(document.getElementById('coin-bet').value) || 0;
    let output = document.getElementById('coin-output');
    output.textContent = "";
    if (bet <= 0) {
        output.textContent = "❗Masukkan jumlah taruhan yang valid.\n";
        return;
    }
    if (playerCredit < bet) {
        output.textContent = "❌ Kredit tidak cukup!\n";
        return;
    }
    playerCredit -= bet;
    updateStatus();
    output.textContent = "🪙 Melempar koin...\n";
    setTimeout(() => {
        let result = COINS[Math.floor(Math.random() * COINS.length)];
        output.textContent += `🎯 Hasil lemparan: ${result}\n`;
        if (result === choice) {
            let win = bet * 2;
            playerCredit += win;
            playerTotalPoints += win;
            output.innerHTML += `<span class="bonus">✅ Tebakan benar! +${win} poin!\n</span>`;
        } else {
            output.innerHTML += `<span class="normal">❌ Tebakan salah. Taruhan hilang ${bet} poin.\n</span>`;
        }
        updateStatus();
    }, 1000);
}

// Roulette Game
function animateRoulette(callback) {
    let start = Date.now();
    let interval = setInterval(() => {
        if (Date.now() - start > 2000) {
            clearInterval(interval);
            callback();
            return;
        }
        let num = Math.floor(Math.random() * 37);
        let color = num === 0 ? "Hijau" : num % 2 === 0 ? "Merah" : "Hitam";
        document.getElementById('roulette-display').textContent = `${num} (${color})`;
    }, 50);
}

function spinRoulette() {
    let colorChoice = document.querySelector('input[name="color-choice"]:checked').value;
    let numberGuess = document.getElementById('number-guess').value;
    let bet = parseInt(document.getElementById('roulette-bet').value) || 0;
    let output = document.getElementById('roulette-output');
    output.textContent = "";
    if (bet <= 0) {
        output.textContent = "❗Masukkan taruhan yang valid.\n";
        return;
    }
    if (playerCredit < bet) {
        output.textContent = "❌ Kredit tidak cukup!\n";
        return;
    }
    playerCredit -= bet;
    updateStatus();
    output.textContent = "🎯 Memutar roda roulette...\n";
    animateRoulette(() => {
        let resultNum = Math.floor(Math.random() * 37);
        let resultColor = resultNum === 0 ? "Hijau" : resultNum % 2 === 0 ? "Merah" : "Hitam";
        document.getElementById('roulette-display').textContent = `${resultNum} (${resultColor})`;
        output.textContent += `🎡 Hasil: ${resultNum} (${resultColor})\n`;
        let win = 0;
        if (numberGuess && parseInt(numberGuess) === resultNum) {
            win = bet * 35;
            output.innerHTML += `<span class="bonus">💰 Angka cocok! +${win} poin!\n</span>`;
        } else if (colorChoice === resultColor) {
            win = bet * 2;
            output.innerHTML += `<span class="bonus">💎 Warna cocok! +${win} poin!\n</span>`;
        } else {
            output.innerHTML += `<span class="normal">❌ Kalah! Hilang ${bet} poin.\n</span>`;
        }
        playerCredit += win;
        playerTotalPoints += win;
        updateStatus();
    });
}
