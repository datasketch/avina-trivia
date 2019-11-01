export default class Trivia {
  constructor(config) {
    if (!config.el) {
      throw new Error('An element must be set. Use a css selector or an HTML element that already exist on the DOM.');
    }
    if (typeof config.el === 'string') {
      this.el = document.querySelector(config.el);
    }
    if (config.el instanceof Element) {
      this.el = config.el;
    }
    if (typeof config.questions === 'string') {
      this.questions = JSON.parse(config.questions);
    } else {
      this.questions = config.questions;
    }
    this.mode = config.mode;
    this.score = 0;
    this.step = 0;
    this.slots = {};
    this.answer = [];
    this.selected = null;
    this.history = [];
    this.session_id = Math.random().toString(36).substring(2, 15)
      + Math.random().toString(36).substring(2, 15);
    this.handleAnswerChange = this.handleAnswerChange.bind(this);
    this.handleNextButton = this.handleNextButton.bind(this);
  }

  init() {
    this.createSlots();
    this.play();
  }

  createSlots() {
    this.slots.progress = document.createElement('div');
    this.slots.questions = document.createElement('div');
    this.slots.score = document.createElement('div');
    this.slots.button = document.createElement('button');
    this.slots.progress.classList.add('trivia-progress');
    this.slots.questions.classList.add('trivia-questions');
    this.slots.score.classList.add('trivia-score');
    this.slots.button.classList.add('trivia-next');
    this.el.appendChild(this.slots.progress);
    this.el.appendChild(this.slots.questions);
    this.el.appendChild(this.slots.button);
    this.registerNextButton();
  }

  registerNextButton() {
    this.slots.button.textContent = 'Siguiente';
    this.slots.button.addEventListener('click', this.handleNextButton);
  }

  updateProgress() {
    this.slots.progress.textContent = `${this.step + 1} de ${this.questions.length}`;
  }

  isOver() {
    return this.step === this.questions.length;
  }

  play() {
    if (this.isOver()) {
      this.endGame();
      return;
    }
    this.slots.button.setAttribute('disabled', '');
    this.updateProgress();
    const question = this.renderQuestion();
    if (this.slots.questions.hasChildNodes()) {
      this.slots.questions.replaceChild(question, this.slots.questions.childNodes[0]);
    } else {
      this.slots.questions.appendChild(question);
    }
    this.enableGame();
  }

  enableGame() {
    const answers = this.el.querySelector('.trivia-answers');
    answers.addEventListener('change', this.handleAnswerChange);
  }

  handleAnswerChange(event) {
    const answer = parseInt(event.target.value, 10);
    if (this.selected) {
      this.selected.classList.remove('is-selected');
    }
    this.selected = event.target.parentNode;
    this.selected.classList.add('is-selected');
    if (this.answer.includes(answer)) {
      this.answer.splice(this.answer.indexOf(answer), 1);
    } else {
      this.answer.push(answer);
    }
    this.slots.button.removeAttribute('disabled');
  }

  handleNextButton() {
    const question = this.questions[this.step];
    let score;
    if (this.mode === 'perception') { // Based on scores
      if (question.mode === 'singular') {
        score = question.answer[this.answer[0]];
        this.history.push({
          session_id: this.session_id,
          question_id: question.id,
          question_type: question.type,
          answer_weight: score,
        });
      }
    } else {
      // Based on index
      const guessed = this.answer.filter((answer) => question.answer.includes(answer));
      score = guessed.length / question.answer.length;
    }
    if (this.step + 1 === (this.questions.length - 1)) {
      this.slots.button.textContent = 'Finalizar';
    }
    this.score += score;
    this.el.querySelector('.trivia-answers').removeEventListener('change', this.handleAnswerChange);
    this.step = this.step + 1;
    this.answer = [];
    this.play();
  }

  endGame() {
    const questions = this.questions.length;
    const score = this.mode === 'perception'
      ? this.score / questions
      : this.score;
    const TriviaEvent = new CustomEvent('ended', { detail: { score, questions, history: this.history } });
    this.el.dispatchEvent(TriviaEvent);
  }

  renderQuestion() {
    const question = this.questions[this.step];

    const triviaQuestion = document.createElement('div');
    const triviaQuestionText = document.createElement('p');
    const triviaAnswers = document.createElement('div');

    triviaQuestion.classList.add('trivia-question');
    triviaQuestionText.classList.add('trivia-question-text');
    triviaAnswers.classList.add('trivia-answers');
    triviaQuestionText.textContent = question.text;

    question.choices.forEach((choice, index) => {
      const triviaAnswer = document.createElement('label');
      const triviaAnswerInput = document.createElement('input');
      const triviaAnswerSpan = document.createElement('span');
      triviaAnswer.classList.add('trivia-answer');
      triviaAnswerSpan.textContent = choice;
      triviaAnswerInput.setAttribute('type', question.mode === 'singular' ? 'radio' : 'checkbox');
      triviaAnswerInput.setAttribute('name', 'question');
      triviaAnswerInput.setAttribute('value', index);
      triviaAnswer.appendChild(triviaAnswerInput);
      triviaAnswer.appendChild(triviaAnswerSpan);
      triviaAnswers.appendChild(triviaAnswer);
    });

    triviaQuestion.appendChild(triviaQuestionText);
    triviaQuestion.appendChild(triviaAnswers);

    return triviaQuestion;
  }
}
