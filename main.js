let allQuestions = []
let testQuestions = []
let userAnswers = []
let showImmediately = false
let timerEnabled = false
let timerInterval
let startTime

fetch('inf04.json') // baza pytań !legalnie zabrana z https://www.praktycznyegzamin.pl/inf04/teoria/wszystko/
	.then(res => res.json())
	.then(data => {
		allQuestions = data
	})
	.catch(err => console.error('Nie udało się wczytać pytań', err))

const questionCountInput = document.getElementById('questionCount')
const questionCountLabel = document.getElementById('questionCountLabel')
questionCountInput.addEventListener('input', () => (questionCountLabel.textContent = questionCountInput.value))

document.getElementById('finishBtn').style.display = 'none'

document.getElementById('startBtn').addEventListener('click', () => {
	if (!allQuestions.length) return alert('Pytania jeszcze się ładują.')
	showImmediately = document.getElementById('showImmediately').checked
	timerEnabled = document.getElementById('enableTimer').checked

	const count = Math.min(questionCountInput.value, allQuestions.length)
	testQuestions = shuffleArray([...allQuestions]).slice(0, count)
	userAnswers = Array(count).fill(null)

	document.getElementById('setup').style.display = 'none'
	document.getElementById('results').style.display = 'none'
	renderQuestions()

	if (timerEnabled) startTimer()
})

function renderQuestions() {
	const container = document.getElementById('questions')
	container.innerHTML = ''

	testQuestions.forEach((q, idx) => {
		const div = document.createElement('div')
		div.className = 'question'

		let html = `<strong>${idx + 1}.</strong> ${q.question}<div class="answers"></div>`
		if (q.image) html += `<img src="${q.image}" alt="Ładowanie obrazu...">`
		div.innerHTML = html

		container.appendChild(div)

		const answersDiv = div.querySelector('.answers')
		if (!answersDiv) return

		const shuffled = shuffleArray([...q.answers])
		shuffled.forEach(a => {
			const btn = document.createElement('button')
			btn.textContent = a
			btn.addEventListener('click', () => selectAnswer(idx, a, btn, q))
			answersDiv.appendChild(btn)
		})
	})

	document.getElementById('finishBtn').style.display = 'block'
	document.getElementById('finishBtn').style.margin = '20px auto'
}
function selectAnswer(qIdx, aValue, btn, question) {
	if (showImmediately && userAnswers[qIdx] !== null) return

	if (!showImmediately) {
		const buttons = document.getElementById('questions').children[qIdx].querySelectorAll('button')
		buttons.forEach(b => b.classList.remove('selected'))
		btn.classList.add('selected')
		userAnswers[qIdx] = aValue
	} else {
		userAnswers[qIdx] = aValue
		const buttons = document.getElementById('questions').children[qIdx].querySelectorAll('button')
		buttons.forEach(b => {
			b.disabled = true
			const correctAnswer = question.answers[question.correct]
			if (b.textContent === correctAnswer) b.classList.add('correct')
			if (b.textContent === aValue && b.textContent !== correctAnswer) b.classList.add('wrong')
		})
	}
}

document.getElementById('finishBtn').addEventListener('click', () => {
	if (timerEnabled) stopTimer()
	colorAllAnswers()
	showTestResults()
	document.getElementById('finishBtn').style.display = 'none'
	document.getElementById('results').scrollIntoView({ behavior: 'smooth' })
})

function colorAllAnswers() {
	testQuestions.forEach((q, i) => {
		const buttons = document.getElementById('questions').children[i].querySelectorAll('button')
		const correctAnswer = q.answers[q.correct]
		buttons.forEach(b => {
			b.disabled = true
			if (b.textContent === correctAnswer) b.classList.add('correct')
			else if (b.textContent === userAnswers[i] && b.textContent !== correctAnswer) b.classList.add('wrong')
			else if (userAnswers[i] === null) b.classList.add(b.textContent === correctAnswer ? 'correct' : 'wrong')
		})
	})
}

function showTestResults() {
	const correctCount = testQuestions.reduce((acc, q, i) => acc + (userAnswers[i] === q.answers[q.correct] ? 1 : 0), 0)
	const summaryEl = document.getElementById('summary')
	const percent = ((correctCount / testQuestions.length) * 100).toFixed(1)
	summaryEl.textContent = `${correctCount}/${testQuestions.length} (${percent}%)`
	summaryEl.style.color = percent >= 50 ? '#28a745' : '#dc3545'
	document.getElementById('results').style.display = 'block'

	if (timerEnabled) {
		const totalTime = (Date.now() - startTime) / 1000
		document.getElementById('timeInfo').textContent = `Czas rozwiązania: ${formatTime(
			totalTime
		)}, średni czas na pytanie: ${(totalTime / testQuestions.length).toFixed(1)} s`
		document.getElementById('timer').textContent = formatTime(totalTime)
	} else document.getElementById('timeInfo').textContent = ''
}

document.getElementById('retryBtn').addEventListener('click', () => {
	location.reload()
	window.scrollTo(0, 0)
})
document.getElementById('wrongTestBtn').addEventListener('click', () => {
	const wrongQs = testQuestions.filter((q, i) => userAnswers[i] !== q.answers[q.correct])
	if (!wrongQs.length) return alert('Nie ma co poprawiać cwaniaczku')
	testQuestions = wrongQs
	userAnswers = Array(wrongQs.length).fill(null)
	document.getElementById('results').style.display = 'none'
	renderQuestions()
	window.scrollTo(0, 0)
	if (timerEnabled) startTimer()
})

function startTimer() {
	startTime = Date.now()
	const timerEl = document.getElementById('timer')
	timerEl.style.display = 'block'
	timerInterval = setInterval(() => {
		const t = (Date.now() - startTime) / 1000
		timerEl.textContent = formatTime(t)
	}, 50)
}

function stopTimer() {
	clearInterval(timerInterval)
}

function formatTime(seconds) {
	const m = Math.floor(seconds / 60)
		.toString()
		.padStart(2, '0')
	const s = Math.floor(seconds % 60)
		.toString()
		.padStart(2, '0')
	const ms = Math.floor((seconds % 1) * 1000)
		.toString()
		.padStart(3, '0')
	return `${m}:${s}.${ms}`
}

function shuffleArray(array) {
	return array.sort(() => Math.random() - 0.5)
}
