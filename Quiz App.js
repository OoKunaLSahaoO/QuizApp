let questions = [];
let currentIdx = 0;
let score = 0;
let timer;
let timeLeft = 15;

const homeScreen = document.getElementById('home-screen');
const loadingScreen = document.getElementById('loading');
const quizContent = document.getElementById('quiz-content');
const resultScreen = document.getElementById('result-screen');
const optionsContainer = document.getElementById('options-container');

// START BUTTON CLICK
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

    // Shuffle answers
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
    clearInterval(timer);
    const allBtns = optionsContainer.querySelectorAll('.option-btn');
    allBtns.forEach(b => b.style.pointerEvents = 'none');

    if (selected === correct) {
        score++;
        btn.classList.add('correct');
        document.getElementById('score').innerText = score;
    } else {
        if(btn) btn.classList.add('wrong');
        // Find correct one and highlight it
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
    document.getElementById('final-score').innerText = score;
}