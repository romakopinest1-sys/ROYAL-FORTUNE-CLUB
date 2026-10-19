let currentBalance = 1000;
let currentBet = 50;
let isSpinning = false;
let jackpotVal = 14285940;

let realBet = 100;
let isRealSpinning = false;
let autoSpinInterval = null;

let currentUser = null;

const slotSymbols = ['💎', '7️⃣', '👑', '🔔', '🍋', '🍒', '🔥', '🎰'];
const itemHeight = 60;

document.addEventListener('DOMContentLoaded', () => {
  updateBalanceUI();
  initJackpotCounter();
  initCustomCursor();
  initMobileDrawer();
  initReelStrips3x3();
  initLiveTournamentTimer();
  rlInit();
  bjRender();
});

function initReelStrips3x3() {
  for (let i = 1; i <= 3; i++) {
    const strip = document.getElementById(`strip${i}`);
    if (strip) {
      let html = '';
      for (let j = 0; j < 3; j++) {
        html += `<div class="reel-symbol">${getRandomSymbol()}</div>`;
      }
      strip.innerHTML = html;
      strip.style.transform = 'translateY(0px)';
    }
  }
}

function updateBalanceUI() {
  const formatted = currentBalance.toLocaleString('uk-UA') + ' ₴';
  
  const headerElem = document.getElementById('userBalanceHeader');
  const slotElem = document.getElementById('userBalanceSlot');
  const realElem = document.getElementById('realGameBalance');
  const profileElem = document.getElementById('profileBalanceDisplay');

  if (headerElem) headerElem.textContent = formatted;
  if (slotElem) slotElem.textContent = formatted;
  if (realElem) realElem.textContent = formatted;
  if (profileElem) profileElem.textContent = formatted;
}

function openProfileModal() {
  document.getElementById('profileModal').classList.add('open');
  updateAuthUIState();
}

function closeProfileModal() {
  document.getElementById('profileModal').classList.remove('open');
}

function switchAuthTab(tab) {
  const loginPanel = document.getElementById('loginPanel');
  const registerPanel = document.getElementById('registerPanel');
  const buttons = document.querySelectorAll('.auth-tab-btn');

  buttons.forEach(b => b.classList.remove('active'));

  if (tab === 'login') {
    loginPanel.style.display = 'block';
    registerPanel.style.display = 'none';
    buttons[0].classList.add('active');
  } else {
    loginPanel.style.display = 'none';
    registerPanel.style.display = 'block';
    buttons[1].classList.add('active');
  }
}

function performLogin() {
  const user = document.getElementById('loginUser').value.trim();
  if (!user) { alert('Введіть логін або email!'); return; }
  
  currentUser = { name: user, email: user.includes('@') ? user : `${user}@royalfortune.com` };
  updateAuthUIState();
  if (typeof confetti === 'function') confetti({ particleCount: 50 });
}

function performRegister() {
  const user = document.getElementById('regUser').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  if (!user || !email) { alert('Заповніть всі поля реєстрації!'); return; }

  currentUser = { name: user, email: email };
  updateAuthUIState();
  if (typeof confetti === 'function') confetti({ particleCount: 80 });
}

function performLogout() {
  currentUser = null;
  updateAuthUIState();
}

function updateAuthUIState() {
  const authContainer = document.getElementById('authContainer');
  const cabinetContainer = document.getElementById('userCabinetContainer');
  const profileLabel = document.getElementById('headerProfileLabel');

  if (currentUser) {
    authContainer.style.display = 'none';
    cabinetContainer.style.display = 'block';
    document.getElementById('cabinetUsername').textContent = currentUser.name;
    document.getElementById('cabinetEmail').textContent = currentUser.email;
    if (profileLabel) profileLabel.textContent = currentUser.name;
  } else {
    authContainer.style.display = 'block';
    cabinetContainer.style.display = 'none';
    if (profileLabel) profileLabel.textContent = 'Акаунт';
  }
}

function setBet(amount) {
  currentBet = amount;
  updateBetUI();

  document.querySelectorAll('.btn-quick-bet').forEach(btn => {
    btn.classList.remove('active');
    if (parseInt(btn.textContent) === amount) {
      btn.classList.add('active');
    }
  });
}

function changeBet(delta) {
  let newBet = currentBet + delta;
  if (newBet < 10) newBet = 10;
  if (newBet > 10000) newBet = 10000;
  setBet(newBet);
}

function setMaxBet() {
  setBet(Math.min(currentBalance, 5000) || 1000);
}

function updateBetUI() {
  const formatted = currentBet + ' ₴';
  document.getElementById('currentBetDisplay').textContent = formatted;
  document.getElementById('betBoxValue').textContent = formatted;
}

function spinSlot() {
  if (isSpinning) return;

  const msgElem = document.getElementById('slotMsg');
  const spinBtn = document.getElementById('spinBtn');

  if (currentBalance < currentBet) {
    msgElem.className = 'slot-msg error-text';
    msgElem.innerHTML = `Недостатньо коштів! <a href="javascript:void(0)" onclick="openDepositModal()" style="color:#ffd700; text-decoration:underline;">Поповнити</a>`;
    return;
  }

  currentBalance -= currentBet;
  updateBalanceUI();

  isSpinning = true;
  spinBtn.disabled = true;
  msgElem.className = 'slot-msg';
  msgElem.textContent = 'Барабани 3x3 крутяться... Хай щастить!';

  const durations = [1800, 2200, 2600];
  let completed = 0;

  for (let i = 1; i <= 3; i++) {
    const strip = document.getElementById(`strip${i}`);
    const spinCount = 15 + i * 5;
    let sequence = [];

    for (let j = 0; j < spinCount; j++) {
      sequence.push(getRandomSymbol());
    }

    strip.style.transition = 'none';
    strip.style.transform = 'translateY(0px)';
    
    let html = '';
    sequence.forEach(sym => {
      html += `<div class="reel-symbol">${sym}</div>`;
    });
    strip.innerHTML = html;

    const targetY = -(sequence.length - 3) * itemHeight;

    setTimeout(() => {
      strip.style.transition = `transform ${durations[i - 1]}ms cubic-bezier(0.15, 0.85, 0.35, 1.05)`;
      strip.style.transform = `translateY(${targetY}px)`;
    }, 50);

    setTimeout(() => {
      completed++;
      if (completed === 3) {
        const winAmt = Math.random() > 0.4 ? currentBet * 3 : 0;
        if (winAmt > 0) {
          currentBalance += winAmt;
          updateBalanceUI();
          msgElem.className = 'slot-msg win-text';
          msgElem.textContent = `ВИГРАШ У 3x3! +${winAmt.toLocaleString('uk-UA')} ₴`;
          if (typeof confetti === 'function') confetti({ particleCount: 80 });
        } else {
          msgElem.className = 'slot-msg';
          msgElem.textContent = 'Спробуйте ще раз!';
        }
        isSpinning = false;
        spinBtn.disabled = false;
      }
    }, durations[i - 1] + 100);
  }
}

function getRandomSymbol() {
  return slotSymbols[Math.floor(Math.random() * slotSymbols.length)];
}

function toggleFooterSubmenu(id) {
  const panel = document.getElementById(id);
  if (panel) panel.classList.toggle('open');
}

function playGameModal(title, mode) {
  const modal = document.getElementById('gameModal');
  document.getElementById('modalGameTitle').textContent = title;

  document.getElementById('slotGameContainer').style.display = mode === 'slot' ? 'flex' : 'none';
  document.getElementById('cardGameContainer').style.display = mode === 'cards' ? 'flex' : 'none';
  document.getElementById('rouletteGameContainer').style.display = mode === 'roulette' ? 'flex' : 'none';

  if (mode === 'cards') bjOpen();
  if (mode === 'roulette') rlOpen();
  document.getElementById('realGameWinAmt').textContent = '0 ₴';

  modal.classList.add('open');
}

function closeGameModal() {
  document.getElementById('gameModal').classList.remove('open');
  if (autoSpinInterval) {
    clearInterval(autoSpinInterval);
    autoSpinInterval = null;
  }
}

/* ===================== BLACKJACK ===================== */
const BJ_SUITS = [
  { s: '♠', c: 'black' }, { s: '♥', c: 'red' },
  { s: '♦', c: 'red' }, { s: '♣', c: 'black' }
];
const BJ_RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

let bj = {
  deck: [], player: [], dealer: [],
  bet: 100, stake: 0,
  active: false, hideDealer: true, busy: false,
  renderedP: 0, renderedD: 0
};

function bjBuildDeck() {
  const deck = [];
  BJ_SUITS.forEach(su => BJ_RANKS.forEach(r => deck.push({ r, s: su.s, c: su.c })));
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  bj.deck = deck;
}

function bjDraw() {
  if (bj.deck.length === 0) bjBuildDeck();
  return bj.deck.pop();
}

function bjValue(hand) {
  let total = 0, aces = 0;
  hand.forEach(c => {
    if (c.r === 'A') { aces++; total += 11; }
    else if (['10', 'J', 'Q', 'K'].includes(c.r)) total += 10;
    else total += parseInt(c.r);
  });
  while (total > 21 && aces > 0) { total -= 10; aces--; }
  return total;
}

function bjCardHTML(card, isNew) {
  const cls = `pcard ${card.c}${isNew ? ' deal' : ''}`;
  return `<div class="${cls}">
    <span class="pc-corner">${card.r}<br>${card.s}</span>
    <span class="pc-mid">${card.s}</span>
    <span class="pc-corner pc-bottom">${card.r}<br>${card.s}</span>
  </div>`;
}

function bjRender() {
  const dRow = document.getElementById('dealerCardsRow');
  const pRow = document.getElementById('playerCardsRow');
  if (!dRow || !pRow) return;

  let dHtml = '';
  bj.dealer.forEach((c, i) => {
    const isNew = i >= bj.renderedD;
    if (i === 1 && bj.hideDealer) dHtml += `<div class="pcard back${isNew ? ' deal' : ''}"></div>`;
    else dHtml += bjCardHTML(c, isNew);
  });
  let pHtml = '';
  bj.player.forEach((c, i) => { pHtml += bjCardHTML(c, i >= bj.renderedP); });

  dRow.innerHTML = dHtml;
  pRow.innerHTML = pHtml;
  bj.renderedD = bj.dealer.length;
  bj.renderedP = bj.player.length;

  const dScore = document.getElementById('bjDealerScore');
  const pScore = document.getElementById('bjPlayerScore');
  if (dScore) dScore.textContent = bj.dealer.length ? (bj.hideDealer ? `(${bjValue([bj.dealer[0]])} + ?)` : `(${bjValue(bj.dealer)})`) : '';
  if (pScore) pScore.textContent = bj.player.length ? `(${bjValue(bj.player)})` : '';

  document.getElementById('bjDeckCount').textContent = bj.deck.length;
  document.getElementById('bjDeck').style.opacity = bj.deck.length < 5 ? 0.4 : 1;
  document.getElementById('bjBetDisplay').textContent = bj.bet.toLocaleString('uk-UA') + ' ₴';

  const canAct = bj.active && !bj.busy;
  document.getElementById('bjDealBtn').disabled = bj.active || bj.busy;
  document.getElementById('bjHitBtn').disabled = !canAct;
  document.getElementById('bjStandBtn').disabled = !canAct;
  document.getElementById('bjDoubleBtn').disabled = !(canAct && bj.player.length === 2 && currentBalance >= bj.bet);
}

function bjStatus(text, color) {
  const el = document.getElementById('cardGameStatus');
  el.textContent = text;
  el.style.color = color || '#ffd700';
}

function bjOpen() {
  if (!bj.active) {
    if (bj.deck.length < 15) bjBuildDeck();
    bjRender();
  }
}

function bjSetBet(amount) {
  if (bj.active || bj.busy) return;
  bj.bet = amount;
  document.querySelectorAll('#bjChips .casino-chip').forEach(b => {
    const v = b.textContent.trim() === '1K' ? 1000 : b.textContent.trim() === '5K' ? 5000 : parseInt(b.textContent);
    b.classList.toggle('selected', v === amount);
  });
  bjRender();   
}

function bjDeal() {
  if (bj.active || bj.busy) return;
  if (currentBalance < bj.bet) {
    bjStatus('Недостатньо коштів! Поповніть баланс або зменште ставку.', '#ff4d4d');
    return;
  }
  if (bj.deck.length < 15) bjBuildDeck();

  currentBalance -= bj.bet;
  bj.stake = bj.bet;
  updateBalanceUI();
  document.getElementById('realGameWinAmt').textContent = '0 ₴';

  bj.player = []; bj.dealer = [];
  bj.renderedP = 0; bj.renderedD = 0;
  bj.hideDealer = true; bj.active = true; bj.busy = true;
  bjStatus('Роздаємо карти...');
  bjRender();

  const seq = [
    () => bj.player.push(bjDraw()),
    () => bj.dealer.push(bjDraw()),
    () => bj.player.push(bjDraw()),
    () => bj.dealer.push(bjDraw())
  ];
  seq.forEach((step, i) => {
    setTimeout(() => {
      step();
      bjRender();
      if (i === seq.length - 1) {
        bj.busy = false;
        const pv = bjValue(bj.player), dv = bjValue(bj.dealer);
        if (pv === 21 || dv === 21) {
          bjFinish(pv === 21 && dv === 21 ? 'push' : pv === 21 ? 'blackjack' : 'lose', dv === 21 && pv !== 21);
        } else {
          bjStatus('Ваш хід: взяти ще, стоп чи подвоїти?');
          bjRender();
        }
      }
    }, 350 * (i + 1));
  });
}

function bjHit() {
  if (!bj.active || bj.busy) return;
  bj.player.push(bjDraw());
  bjRender();
  const pv = bjValue(bj.player);
  if (pv > 21) bjFinish('lose', false, 'Перебір!');
  else if (pv === 21) bjStand();
}

function bjDouble() {
  if (!bj.active || bj.busy || bj.player.length !== 2 || currentBalance < bj.bet) return;
  currentBalance -= bj.bet;
  bj.stake += bj.bet;
  updateBalanceUI();
  bj.player.push(bjDraw());
  bjRender();
  if (bjValue(bj.player) > 21) bjFinish('lose', false, 'Перебір!');
  else bjStand();
}

function bjStand() {
  if (!bj.active || bj.busy) return;
  bj.busy = true;
  bj.hideDealer = false;
  bjStatus('Хід дилера...');
  bjRender();

  const dealerStep = () => {
    if (bjValue(bj.dealer) < 17) {
      bj.dealer.push(bjDraw());
      bjRender();
      setTimeout(dealerStep, 700);
    } else {
      const pv = bjValue(bj.player), dv = bjValue(bj.dealer);
      if (dv > 21) bjFinish('win', false, 'Дилер перебрав!');
      else if (pv > dv) bjFinish('win');
      else if (pv < dv) bjFinish('lose');
      else bjFinish('push');
    }
  };
  setTimeout(dealerStep, 700);
}

function bjFinish(result, dealerBJ, customMsg) {
  bj.hideDealer = false;
  bj.active = false;
  bj.busy = false;

  let payout = 0;
  if (result === 'blackjack') payout = Math.floor(bj.stake * 2.5);
  else if (result === 'win') payout = bj.stake * 2;
  else if (result === 'push') payout = bj.stake;

  if (payout > 0) {
    currentBalance += payout;
    updateBalanceUI();
  }

  if (result === 'blackjack') {
    bjStatus(`BLACKJACK! +${payout.toLocaleString('uk-UA')} ₴`, '#00ff88');
    if (typeof confetti === 'function') confetti({ particleCount: 100 });
  } else if (result === 'win') {
    bjStatus(`${customMsg ? customMsg + ' ' : ''}ВИГРАШ! +${payout.toLocaleString('uk-UA')} ₴`, '#00ff88');
    if (typeof confetti === 'function') confetti({ particleCount: 60 });
  } else if (result === 'push') {
    bjStatus('Нічия. Ставку повернено.', '#ffd700');
  } else {
    bjStatus(`${customMsg || (dealerBJ ? 'У дилера Blackjack!' : 'Дилер виграв.')} Спробуйте ще раз!`, '#ff4d4d');
  }

  document.getElementById('realGameWinAmt').textContent = payout > 0 ? `+${payout.toLocaleString('uk-UA')} ₴` : '0 ₴';
  bjRender();
}

/* ===================== РУЛЕТКА ===================== */
const RL_ORDER = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26];
const RL_REDS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
const RL_SPIN_MS = 5000;

let rl = {
  chip: 100, bets: {}, stack: [], lastBets: null,
  spinning: false, wheelRot: 0, ballRot: 0, history: []
};

function rlColor(n) {
  if (n === 0) return 'green';
  return RL_REDS.includes(n) ? 'red' : 'black';
}

function rlColorName(n) {
  return n === 0 ? 'ЗЕЛЕНЕ' : RL_REDS.includes(n) ? 'ЧЕРВОНЕ' : 'ЧОРНЕ';
}

function rlBuildBoard() {
  const board = document.getElementById('rlBoard');
  if (!board || board.dataset.built) return;

  let html = `<div class="rl-cell green rl-zero" data-key="n0" onclick="rlPlaceBet('n0')" style="grid-row:1 / span 3; grid-column:1;">0<span class="rl-badge"></span></div>`;

  for (let k = 0; k < 12; k++) {
    for (let r = 0; r < 3; r++) {
      const n = 3 * k + (3 - r);
      html += `<div class="rl-cell ${rlColor(n)}" data-key="n${n}" onclick="rlPlaceBet('n${n}')" style="grid-row:${r + 1}; grid-column:${k + 2};">${n}<span class="rl-badge"></span></div>`;
    }
  }

  ['c3', 'c2', 'c1'].forEach((key, r) => {
    html += `<div class="rl-cell outside" data-key="${key}" onclick="rlPlaceBet('${key}')" style="grid-row:${r + 1}; grid-column:14;">2:1<span class="rl-badge"></span></div>`;
  });

  [['d1', '1-ша дюжина (1–12)'], ['d2', '2-га дюжина (13–24)'], ['d3', '3-тя дюжина (25–36)']].forEach(([key, label], i) => {
    html += `<div class="rl-cell outside" data-key="${key}" onclick="rlPlaceBet('${key}')" style="grid-row:4; grid-column:${2 + i * 4} / span 4;">${label}<span class="rl-badge"></span></div>`;
  });

  [['low', '1–18'], ['even', 'ПАРНЕ'], ['red', 'ЧЕРВОНЕ'], ['black', 'ЧОРНЕ'], ['odd', 'НЕПАРНЕ'], ['high', '19–36']].forEach(([key, label], i) => {
    const extra = key === 'red' ? ' red' : key === 'black' ? ' black' : '';
    html += `<div class="rl-cell outside${extra}" data-key="${key}" onclick="rlPlaceBet('${key}')" style="grid-row:5; grid-column:${2 + i * 2} / span 2;">${label}<span class="rl-badge"></span></div>`;
  });

  board.innerHTML = html;
  board.dataset.built = '1';
}

function rlBuildWheel() {
  const wheel = document.getElementById('rlWheel');
  if (!wheel || wheel.dataset.built) return;

  const total = RL_ORDER.length, step = 360 / total, cx = 100, cy = 100;
  const pt = (r, a) => {
    const rad = a * Math.PI / 180;
    return [cx + r * Math.sin(rad), cy - r * Math.cos(rad)];
  };

  let svg = '<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">';
  svg += '<circle cx="100" cy="100" r="99" fill="#2a1d05" stroke="#ffd700" stroke-width="2"/>';

  RL_ORDER.forEach((num, i) => {
    const a0 = i * step, a1 = (i + 1) * step, mid = (a0 + a1) / 2;
    const [x0, y0] = pt(92, a0), [x1, y1] = pt(92, a1);
    const [x2, y2] = pt(60, a1), [x3, y3] = pt(60, a0);
    const fill = num === 0 ? '#00a85a' : RL_REDS.includes(num) ? '#d32f2f' : '#15151f';
    svg += `<path d="M ${x0.toFixed(2)} ${y0.toFixed(2)} A 92 92 0 0 1 ${x1.toFixed(2)} ${y1.toFixed(2)} L ${x2.toFixed(2)} ${y2.toFixed(2)} A 60 60 0 0 0 ${x3.toFixed(2)} ${y3.toFixed(2)} Z" fill="${fill}" stroke="#ffd700" stroke-width="0.6"/>`;
    const [tx, ty] = pt(77, mid);
    svg += `<text x="${tx.toFixed(2)}" y="${ty.toFixed(2)}" fill="#fff" font-size="8.5" font-weight="700" text-anchor="middle" dominant-baseline="central" transform="rotate(${mid.toFixed(2)} ${tx.toFixed(2)} ${ty.toFixed(2)})">${num}</text>`;
  });

  svg += '<circle cx="100" cy="100" r="58" fill="#1a1208" stroke="#ffd700" stroke-width="1.5"/>';
  svg += '<circle cx="100" cy="100" r="40" fill="#0d0d14" stroke="#ffaa00" stroke-width="1"/>';
  svg += '</svg>';

  wheel.innerHTML = svg;
  wheel.dataset.built = '1';
}

function rlInit() {
  rlBuildBoard();
  rlBuildWheel();
  rlRenderBets();
  rlRenderHistory();
}

function rlOpen() {
  rlInit();
}

function rlSetChip(v) {
  rl.chip = v;
  document.querySelectorAll('#rlChips .casino-chip').forEach(b => {
    const t = b.textContent.trim();
    const val = t === '1K' ? 1000 : parseInt(t);
    b.classList.toggle('selected', val === v);
  });
}

function rlStatus(text, cls) {
  const el = document.getElementById('rlResult');
  el.textContent = text;
  el.className = 'rl-result' + (cls ? ' ' + cls : '');
}

function rlTotal() {
  return Object.values(rl.bets).reduce((a, b) => a + b, 0);
}

function rlFormatChip(v) {
  if (v >= 1000) return (v / 1000).toFixed(v % 1000 === 0 ? 0 : 1) + 'K';
  return String(v);
}

function rlRenderBets() {
  document.querySelectorAll('#rlBoard [data-key]').forEach(cell => {
    const amt = rl.bets[cell.dataset.key] || 0;
    const badge = cell.querySelector('.rl-badge');
    if (!badge) return;
    badge.textContent = amt ? rlFormatChip(amt) : '';
    badge.style.display = amt ? 'flex' : 'none';
    cell.classList.toggle('has-bet', amt > 0);
  });
  const t = document.getElementById('rlTotalBet');
  if (t) t.textContent = rlTotal().toLocaleString('uk-UA') + ' ₴';
}

function rlPlaceBet(key) {
  if (rl.spinning) return;
  if (currentBalance < rl.chip) {
    rlStatus('Недостатньо коштів!', 'lose');
    return;
  }
  currentBalance -= rl.chip;
  updateBalanceUI();
  rl.bets[key] = (rl.bets[key] || 0) + rl.chip;
  rl.stack.push({ key, amt: rl.chip });
  rlRenderBets();
  rlStatus('Ставки приймаються...');
}

function rlUndo() {
  if (rl.spinning || rl.stack.length === 0) return;
  const last = rl.stack.pop();
  rl.bets[last.key] -= last.amt;
  if (rl.bets[last.key] <= 0) delete rl.bets[last.key];
  currentBalance += last.amt;
  updateBalanceUI();
  rlRenderBets();
}

function rlClear() {
  if (rl.spinning) return;
  currentBalance += rlTotal();
  updateBalanceUI();
  rl.bets = {}; rl.stack = [];
  rlRenderBets();
}

function rlRebet() {
  if (rl.spinning || !rl.lastBets) return;
  rlClear();
  const need = Object.values(rl.lastBets).reduce((a, b) => a + b, 0);
  if (currentBalance < need) {
    rlStatus('Недостатньо коштів для повтору ставок', 'lose');
    return;
  }
  currentBalance -= need;
  updateBalanceUI();
  rl.bets = { ...rl.lastBets };
  rl.stack = Object.entries(rl.bets).map(([key, amt]) => ({ key, amt }));
  rlRenderBets();
}

function rlWins(key, n) {
  if (key[0] === 'n') return n === parseInt(key.slice(1));
  if (n === 0) return false;
  switch (key) {
    case 'red': return RL_REDS.includes(n);
    case 'black': return !RL_REDS.includes(n);
    case 'even': return n % 2 === 0;
    case 'odd': return n % 2 === 1;
    case 'low': return n <= 18;
    case 'high': return n >= 19;
    case 'd1': return n <= 12;
    case 'd2': return n >= 13 && n <= 24;
    case 'd3': return n >= 25;
    case 'c1': return n % 3 === 1;
    case 'c2': return n % 3 === 2;
    case 'c3': return n % 3 === 0;
  }
  return false;
}

function rlProfit(key) {
  if (key[0] === 'n') return 35;
  if (['d1', 'd2', 'd3', 'c1', 'c2', 'c3'].includes(key)) return 2;
  return 1;
}

function rlSpin() {
  if (rl.spinning) return;
  const total = rlTotal();
  if (total === 0) {
    rlStatus('Спочатку зробіть ставку — натисніть на число або поле', 'lose');
    return;
  }

  rl.spinning = true;
  document.getElementById('rlSpinBtn').disabled = true;
  document.getElementById('realGameWinAmt').textContent = '0 ₴';
  document.getElementById('rlWheelCenter').textContent = '...';
  rlStatus('Кульку запущено... Ставок більше немає!');

  const n = Math.floor(Math.random() * 37);
  const step = 360 / RL_ORDER.length;
  const center = (RL_ORDER.indexOf(n) + 0.5) * step;
  const delta = ((-center - rl.wheelRot) % 360 + 360) % 360;
  rl.wheelRot += 360 * 5 + delta;
  rl.ballRot -= 360 * 7;

  const wheel = document.getElementById('rlWheel');
  const orbit = document.getElementById('rlBallOrbit');
  wheel.style.transition = `transform ${RL_SPIN_MS}ms cubic-bezier(0.15, 0.6, 0.1, 1)`;
  orbit.style.transition = `transform ${RL_SPIN_MS}ms cubic-bezier(0.2, 0.7, 0.1, 1)`;
  wheel.style.transform = `rotate(${rl.wheelRot}deg)`;
  orbit.style.transform = `rotate(${rl.ballRot}deg)`;

  setTimeout(() => {
    let payout = 0;
    Object.entries(rl.bets).forEach(([key, amt]) => {
      if (rlWins(key, n)) payout += amt * (rlProfit(key) + 1);
    });

    if (payout > 0) {
      currentBalance += payout;
      updateBalanceUI();
    }

    const color = rlColor(n);
    const center = document.getElementById('rlWheelCenter');
    center.textContent = n;
    center.className = 'rl-wheel-center ' + color;

    if (payout > 0) {
      const net = payout - total;
      rlStatus(`Випало ${n} ${rlColorName(n)}. Виграш +${payout.toLocaleString('uk-UA')} ₴${net > 0 ? '' : ' (повернення)'}`, 'win');
      document.getElementById('realGameWinAmt').textContent = `+${payout.toLocaleString('uk-UA')} ₴`;
      if (payout > total && typeof confetti === 'function') confetti({ particleCount: 90 });
    } else {
      rlStatus(`Випало ${n} ${rlColorName(n)}. Не пощастило.`, 'lose');
    }

    rl.history.unshift(n);
    if (rl.history.length > 12) rl.history.pop();
    rlRenderHistory();

    rl.lastBets = { ...rl.bets };
    rl.bets = {}; rl.stack = [];
    rlRenderBets();

    rl.spinning = false;
    document.getElementById('rlSpinBtn').disabled = false;
  }, RL_SPIN_MS + 100);
}

function rlRenderHistory() {
  const el = document.getElementById('rlHistory');
  if (!el) return;
  el.innerHTML = rl.history.length
    ? rl.history.map(n => `<span class="rl-hist ${rlColor(n)}">${n}</span>`).join('')
    : '<span class="rl-hist-empty">—</span>';
}

function adjustRealBet(delta) {
  realBet += delta;
  if (realBet < 50) realBet = 50;
  if (realBet > 10000) realBet = 10000;
  document.getElementById('realBetDisplay').textContent = realBet + ' ₴';
}

function spinRealSlot() {
  if (isRealSpinning) return;
  if (currentBalance < realBet) { alert('Недостатньо коштів!'); return; }

  currentBalance -= realBet;
  updateBalanceUI();
  isRealSpinning = true;

  let counter = 0;
  const interval = setInterval(() => {
    for (let i = 1; i <= 15; i++) {
      const symElem = document.getElementById(`rs${i}`);
      if (symElem) symElem.textContent = getRandomSymbol();
    }
    counter++;

    if (counter > 10) {
      clearInterval(interval);
      isRealSpinning = false;
      const isWin = Math.random() > 0.45;
      if (isWin) {
        const winAmt = realBet * 3;
        currentBalance += winAmt;
        updateBalanceUI();
        document.getElementById('realGameWinAmt').textContent = `+${winAmt} ₴`;
      } else {
        document.getElementById('realGameWinAmt').textContent = '0 ₴';
      }
    }
  }, 70);
}

function toggleAutoSpin() {
  const btn = document.getElementById('btnAutoSpin');
  if (autoSpinInterval) {
    clearInterval(autoSpinInterval);
    autoSpinInterval = null;
    btn.style.background = '#252538';
  } else {
    btn.style.background = '#00f2fe';
    btn.style.color = '#000';
    spinRealSlot();
    autoSpinInterval = setInterval(() => {
      if (!isRealSpinning) spinRealSlot();
    }, 2000);
  }
}

let isWheelSpinning = false;

document.addEventListener('DOMContentLoaded', () => {
  checkWheelCooldown();
  setInterval(checkWheelCooldown, 1000);
});

function checkWheelCooldown() {
  const wheelCooldownEnd = localStorage.getItem('royalWheelCooldown') || 0;
  const now = Date.now();
  const btn = document.getElementById('spinWheelBtn');
  const msg = document.getElementById('wheelMsg');

  if (!btn || !msg) return;

  if (now < wheelCooldownEnd) {
    const timeLeft = wheelCooldownEnd - now;
    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

    btn.disabled = true;
    btn.style.opacity = '0.5';
    btn.style.cursor = 'not-allowed';
    msg.textContent = `Колесо доступне через: ${hours}г ${minutes}хв ${seconds}с`;
  } else {
    btn.disabled = false;
    btn.style.opacity = '1';
    btn.style.cursor = 'pointer';
    if (msg.textContent.includes('доступне через')) {
      msg.textContent = 'Натисніть кнопку, щоб випробувати удачу!';
    }
  }
}

function spinFortuneWheel() {
  const now = Date.now();
  const wheelCooldownEnd = localStorage.getItem('royalWheelCooldown') || 0;
  const msg = document.getElementById('wheelMsg');
  const winTitle = document.getElementById('wheelWinTitle');

  if (now < wheelCooldownEnd) return;
  if (isWheelSpinning) return;

  const disc = document.getElementById('wheelDisc');
  isWheelSpinning = true;
  
  const randomDeg = Math.floor(Math.random() * 360) + 1440;
  disc.style.transform = `rotate(${randomDeg}deg)`;
  msg.textContent = 'Колесо обертається...';
  if (winTitle) winTitle.textContent = '';

  setTimeout(() => {
    isWheelSpinning = false;

    const prizes = [
      { type: 'money', text: '500 ₴ на баланс!', value: 500 },
      { type: 'fs', text: '10 фріспінів (FS)!', value: 10 },
      { type: 'money', text: '1,000 ₴ на баланс!', value: 1000 },
      { type: 'fs', text: '50 фріспінів (FS)!', value: 50 },
      { type: 'money', text: '2,500 ₴ на баланс!', value: 2500 },
      { type: 'privilege', text: 'VIP статус та Кешбек 20%!', value: 'vip' },
      { type: 'money', text: '5,000 ₴ на баланс!', value: 5000 },
      { type: 'privilege', text: 'Бонус: Подвійний шанс завтра!', value: 'bonus' }
    ];

    const wonPrize = prizes[Math.floor(Math.random() * prizes.length)];

    if (wonPrize.type === 'money') {
      currentBalance += wonPrize.value;
      updateBalanceUI();
    } else if (wonPrize.type === 'privilege' && wonPrize.value === 'vip') {
      const vipElem = document.getElementById('cabinetVipStatus');
      if (vipElem) vipElem.innerHTML = `<i class="fa-solid fa-gem"></i> ROYAL VIP Status (Виграно в колесі)`;
    }

    msg.textContent = `ВІТАЄМО! Ваш виграш: ${wonPrize.text}`;
    if (winTitle) winTitle.textContent = `🎉 Виграно: ${wonPrize.text}`;
    if (typeof confetti === 'function') confetti({ particleCount: 120 });

    const nextSpinTime = Date.now() + 24 * 60 * 60 * 1000;
    localStorage.setItem('royalWheelCooldown', nextSpinTime);
    
    checkWheelCooldown();
  }, 4000);
}

function initLiveTournamentTimer() {
  let secondsLeft = 2 * 86400 + 14 * 3600 + 35 * 60 + 10;
  const timerElem = document.getElementById('tournamentLiveTimer');

  setInterval(() => {
    secondsLeft--;
    if (secondsLeft < 0) secondsLeft = 0;

    const days = Math.floor(secondsLeft / 86400);
    const hours = Math.floor((secondsLeft % 86400) / 3600);
    const mins = Math.floor((secondsLeft % 3600) / 60);
    const secs = secondsLeft % 60;

    if (timerElem) {
      timerElem.textContent = `${days}d ${hours}h ${mins}m ${secs}s`;
    }
  }, 1000);
}

function toggleFaq(item) { item.classList.toggle('open'); }
function openDepositModal() { document.getElementById('depositModal').classList.add('open'); }
function closeDepositModal() { document.getElementById('depositModal').classList.remove('open'); }

function setDepositPreset(amt) {
  document.getElementById('depositInputAmount').value = amt;
}

function selectPayMethod(el) {
  document.querySelectorAll('.pay-card').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
}

function processDeposit() {
  const val = parseInt(document.getElementById('depositInputAmount').value);
  if (isNaN(val) || val < 50) { alert('Мінімальна сума — 50 ₴'); return; }
  currentBalance += val;
  updateBalanceUI();
  closeDepositModal();
  if (typeof confetti === 'function') confetti({ particleCount: 120 });
}

function selectCategory(cat, btn) {
  document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  document.querySelectorAll('.game-card').forEach(card => {
    const cardCat = card.getAttribute('data-category');
    card.style.display = (cat === 'all' || cardCat.includes(cat)) ? 'block' : 'none';
  });
}

function filterGames() {
  const query = document.getElementById('gameSearch').value.toLowerCase();
  document.querySelectorAll('.game-card').forEach(card => {
    const name = card.getAttribute('data-name').toLowerCase();
    card.style.display = name.includes(query) ? 'block' : 'none';
  });
}

function initJackpotCounter() {
  setInterval(() => {
    jackpotVal += Math.floor(Math.random() * 15) + 1;
    const elem = document.getElementById('jackpotCounter');
    if (elem) elem.textContent = jackpotVal.toLocaleString('uk-UA') + ' ₴';
  }, 2500);
}

function initMobileDrawer() {
  const toggleBtn = document.getElementById('menuToggle');
  const closeBtn = document.getElementById('drawerClose');
  const drawer = document.getElementById('mobileDrawer');
  if (toggleBtn) toggleBtn.addEventListener('click', () => drawer.classList.add('open'));
  if (closeBtn) closeBtn.addEventListener('click', () => drawer.classList.remove('open'));
}

function initCustomCursor() {
  const dot = document.getElementById('cursorDot');
  const trail = document.getElementById('cursorTrail');
  if (!dot || !trail) return;

  window.addEventListener('mousemove', (e) => {
    dot.style.left = e.clientX + 'px';
    dot.style.top = e.clientY + 'px';
    trail.animate({ left: e.clientX + 'px', top: e.clientY + 'px' }, { duration: 250, fill: 'forwards' });
  });
}

