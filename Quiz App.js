let questions = [];
let currentIdx = 0;
let score = 0;
let timer;
let timeLeft = 15;
let totalTimeSpent = 0;

const homeScreen = document.getElementById('home-screen');
const loadingScreen = document.getElementById('loading');
const quizContent = document.getElementById('quiz-content');
const resultScreen = document.getElementById('result-screen');
const optionsContainer = document.getElementById('options-container');

// --- START QUIZ ---
document.getElementById('start-btn').addEventListener('click', async () => {
    const category = document.getElementById('category-select').value;
    const difficulty = document.getElementById('difficulty-select').value;
    const amount = document.getElementById('amount-select').value;

    homeScreen.classList.add('hidden');
    loadingScreen.classList.remove('hidden');

    let url = `https://opentdb.com/api.php?amount=${amount}&type=multiple`;
    if (category !== 'any') url += `&category=${category}`;
    if (difficulty !== 'any') url += `&difficulty=${difficulty}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        questions = data.results;
        
        if(questions.length === 0) throw new Error("No questions found");
        
        currentIdx = 0;
        score = 0;
        totalTimeSpent = 0;
        
        loadingScreen.classList.add('hidden');
        quizContent.classList.remove('hidden');
        showQuestion();
    } catch (err) {
        alert("Error: " + err.message);
        location.reload();
    }
});

function showQuestion() {
    clearInterval(timer);
    optionsContainer.innerHTML = '';
    
    const q = questions[currentIdx];
    document.getElementById('category-tag').innerText = q.category;
    document.getElementById('question').innerHTML = q.question;
    document.getElementById('progress').innerText = `${currentIdx + 1}/${questions.length}`;

    const answers = [...q.incorrect_answers, q.correct_answer].sort(() => Math.random() - 0.5);

    answers.forEach(ans => {
        const btn = document.createElement('div');
        btn.innerHTML = ans;
        btn.classList.add('option-btn');
        btn.onclick = () => handleAnswer(ans, q.correct_answer, btn);
        optionsContainer.appendChild(btn);
    });

    startTimer();
}

function handleAnswer(selected, correct, btn) {
    totalTimeSpent += (15 - timeLeft);
    clearInterval(timer);
    
    const allBtns = optionsContainer.querySelectorAll('.option-btn');
    allBtns.forEach(b => b.style.pointerEvents = 'none');

    if (selected === correct) {
        score++;
        btn.classList.add('correct');
        document.getElementById('score').innerText = score;
    } else {
        if(btn) btn.classList.add('wrong');
        Array.from(allBtns).find(b => b.innerHTML === correct).classList.add('correct');
    }

    setTimeout(() => {
        currentIdx++;
        if (currentIdx < questions.length) {
            showQuestion();
        } else {
            showResults();
        }
    }, 1500);
}

function startTimer() {
    timeLeft = 15;
    document.getElementById('timer').innerText = `${timeLeft}s`;
    timer = setInterval(() => {
        timeLeft--;
        document.getElementById('timer').innerText = `${timeLeft}s`;
        if(timeLeft <= 0) {
            handleAnswer("", questions[currentIdx].correct_answer, null);
        }
    }, 1000);
}

function showResults() {
    quizContent.classList.add('hidden');
    resultScreen.classList.remove('hidden');
    
    const avgTime = (totalTimeSpent / questions.length).toFixed(1);
    
    resultScreen.innerHTML = `
        <div class="text-5xl mb-4">🏆</div>
        <h2 class="text-3xl font-bold mb-2 text-[#432818]">Quiz Complete!</h2>
        
        <div class="stats-box text-left space-y-2 mt-4 font-bold">
            <div class="flex justify-between">
                <span class="opacity-70">Accuracy:</span>
                <span>${score} / ${questions.length}</span>
            </div>
            <div class="flex justify-between">
                <span class="opacity-70">Average Speed:</span>
                <span class="text-indigo-900">${avgTime}s</span>
            </div>
        </div>

        <div class="text-6xl font-black text-[#7f5539] mb-8">${score}</div>
        <button onclick="location.reload()" class="w-full border-2 border-[#432818]/30 py-3 rounded-xl hover:bg-white hover:text-indigo-900 transition font-bold text-[#432818]">Try Another Topic</button>
    `;
    
    saveToHistory(score, document.getElementById('category-tag').innerText);
}

// --- HISTORY LOGIC ---
function saveToHistory(finalScore, category) {
    const history = JSON.parse(localStorage.getItem('quizHistory')) || [];
    history.unshift({ score: finalScore, category: category, date: new Date().toLocaleDateString() });
    localStorage.setItem('quizHistory', JSON.stringify(history.slice(0, 10)));
}

document.getElementById('score-link').addEventListener('click', (e) => {
    e.preventDefault();
    const history = JSON.parse(localStorage.getItem('quizHistory')) || [];
    const list = document.getElementById('score-history-list');
    list.innerHTML = history.length ? history.map(item => `
        <div class="score-item">
            <div class="text-left">
                <div class="text-[10px] uppercase opacity-50">${item.date}</div>
                <div class="text-sm font-bold">${item.category}</div>
            </div>
            <div class="text-xl font-bold text-[#7f5539]">${item.score}</div>
        </div>`).join('') : '<p class="opacity-50">No history yet.</p>';
    document.getElementById('score-modal').classList.remove('hidden');
});

document.getElementById('close-modal').addEventListener('click', () => {
    document.getElementById('score-modal').classList.add('hidden');
});

document.getElementById('clear-scores').addEventListener('click', () => {
    localStorage.removeItem('quizHistory');
    document.getElementById('score-history-list').innerHTML = '<p class="opacity-50">History cleared.</p>';
});

// --- BOOKMARK LOGIC ---
document.getElementById('bookmark-this').addEventListener('click', () => {
    const currentQ = questions[currentIdx];
    const bkmks = JSON.parse(localStorage.getItem('quizBookmarks')) || [];
    if (!bkmks.some(b => b.question === currentQ.question)) {
        bkmks.push({ category: currentQ.category, question: currentQ.question, answer: currentQ.correct_answer });
        localStorage.setItem('quizBookmarks', JSON.stringify(bkmks));
        alert("Saved to Bookmarks! 🔖");
    }
});

document.getElementById('bookmark-link').addEventListener('click', (e) => {
    e.preventDefault();
    const bkmks = JSON.parse(localStorage.getItem('quizBookmarks')) || [];
    const list = document.getElementById('bookmark-list');
    list.innerHTML = bkmks.length ? bkmks.map(item => `
        <div class="bookmark-item">
            <small>${item.category}</small>
            <p class="font-bold mb-1">${item.question}</p>
            <p class="text-xs text-green-800 font-bold">Answer: ${item.answer}</p>
        </div>`).join('') : '<p class="text-center opacity-50">No bookmarks yet.</p>';
    document.getElementById('bookmark-modal').classList.remove('hidden');
});

document.getElementById('close-bookmark-modal').addEventListener('click', () => {
    document.getElementById('bookmark-modal').classList.add('hidden');
});

document.getElementById('clear-bookmarks').addEventListener('click', () => {
    localStorage.removeItem('quizBookmarks');
    document.getElementById('bookmark-list').innerHTML = '<p class="text-center opacity-50">Bookmarks cleared.</p>';
});