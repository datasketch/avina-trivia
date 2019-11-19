import '../css/style.css';
import * as d3 from 'd3';
import Papa from 'papaparse';
import { TweenLite } from 'gsap/TweenMax';
import Trivia from './Trivia';
import renderGaugeChart from './gauge';

const apiUrl = 'https://o3q3l9elhd.execute-api.us-east-1.amazonaws.com/beta';
const s3Params = {
  bucket: 'avina-trivia-verdad',
  key: 'data/db.csv',
};

const start = document.getElementById('start');
const welcome = document.getElementById('welcome');
const triviaEl = document.getElementById('trivia');
const loader = document.getElementById('loader');
const results = document.querySelector('.trivia-results');
const myScore = document.getElementById('my-score');
const elseScore = document.getElementById('else-score');

const questions = [
  {
    id: 1,
    text: 'Su pareja la/lo ha invitado a cenar y llega con un costoso anillo de regalo. Resulta que a usted no le gusta, quizá le parece tan feo que no se sienta capaz de llegar a usarlo nunca. ¿Qué dice usted?',
    choices: [
      'Divino, me encanta.',
      'Amor, debes haber gastado una fortuna. ¡Gracias! (y evade el tema del anillo)',
      'Gracias, pero la verdad no me gusta. ¿Podríamos tratar de cambiarlo?',
      'Qué detalle tan lindo. Eres muy detallista. Sin embargo el diseño no es que me enloquezca, ¿podríamos tratar de cambiarlo?',
    ],
    answer: [0, 25, 75, 100],
    mode: 'singular',
    type: 'weight_scale',
  },
  {
    id: 2,
    text: '¿Alguna vez ha hecho trampa en algún exámen?',
    choices: ['Sí', 'No'],
    answer: [0, 100],
    mode: 'singular',
    type: 'weight_scale',
  },
  {
    id: 3,
    text: '¿Dijo o ha dicho alguna mentira a sus profesores?',
    choices: ['Sí', 'No'],
    answer: [0, 100],
    mode: 'singular',
    type: 'weight_scale',
  },
  {
    id: 4,
    text: '¿Alguna vez mintió a sus padres para poder salir, no hacer las tareas, no ir al colegio, etc?',
    choices: ['Sí', 'No'],
    answer: [0, 100],
    mode: 'singular',
    type: 'weight_scale',
  },
  {
    id: 5,
    text: '¿Le ha mentido a sus amigos/as acerca de sus posesiones, sus experiencias o su historia personal?',
    choices: ['Sí', 'No'],
    answer: [0, 100],
    mode: 'singular',
    type: 'weight_scale',
  },
  {
    id: 6,
    text: '¿Ha mentido acerca de sus experiencias, de su historia personal, de sus posesiones o conocimientos a alguien que le interesaba sentimentalmente?',
    choices: ['Sí', 'No'],
    answer: [0, 100],
    mode: 'singular',
    type: 'weight_scale',
  },
  {
    id: 7,
    text: '¿Ha mentido acerca de alguna infidelidad amorosa?',
    choices: ['Sí', 'No'],
    answer: [0, 100],
    mode: 'singular',
    type: 'weight_scale',
  },
  {
    id: 8,
    text: '¿Ha dicho alguna mentira para obtener algún trabajo?',
    choices: ['Sí', 'No'],
    answer: [0, 100],
    mode: 'singular',
    type: 'weight_scale',
  },
  {
    id: 9,
    text: 'Usted está en el parque de atracciones mecánicas con su pareja y sus hijos haciendo la fila para subir a la Rueda de Chicago. Un anuncio indica que todo niño menor de 10 años no paga boleta. Para evitarse un pago su pareja le pide que mienta sobre la edad de su hijo mayor, que ya tiene 11. ¿Usted qué hace?',
    choices: [
      'Hablo en privado con mi esposa para decirle que no va a mentir',
      'Habla en familia por qué está en desacuerdo con mentir',
      'Obvio, si se ve pequeño el niño, tiro a ahorrar lo de la boleta',
    ],
    answer: [50, 100, 0],
    mode: 'singular',
    type: 'weight_scale',
  },
  {
    id: 10,
    text: '¿Alguna vez lo/la castigaron por decir la verdad?',
    choices: ['Sí', 'No'],
    answer: [100, 0],
    mode: 'singular',
    type: 'weight_scale',
  },
  {
    id: 11,
    text: '¿Alguna vez su papá o mamá, o la persona encargada de su crianza, le pidió decir una mentira?',
    choices: ['Sí', 'No'],
    answer: [100, 0],
    mode: 'singular',
    type: 'weight_scale',
  },
  {
    id: 12,
    text: '¿Alguna vez se confabuló con su papá o mamá para mentir?',
    choices: ['Sí', 'No'],
    answer: [0, 100],
    mode: 'singular',
    type: 'weight_scale',
  },
  {
    id: 13,
    text: '¿Veía a su papá o mámá mentir delante suyo?',
    choices: ['Sí', 'No'],
    answer: [0, 100],
    mode: 'singular',
    type: 'weight_scale',
  },
  {
    id: 14,
    text: '¿Alguna vez lo/la han premiado por ser sincero/a?',
    choices: ['Sí', 'No'],
    answer: [100, 0],
    mode: 'singular',
    type: 'weight_scale',
  },
  {
    id: 15,
    text: '¿Ha visto a su papá o mamá enfrentar la verdad con valentía?',
    choices: ['Sí', 'No'],
    answer: [100, 0],
    mode: 'singular',
    type: 'weight_scale',
  },
  {
    id: 16,
    text: 'Usted va en el carro de un amigo que mientras conduce habla por su teléfono móvil. La policía de tránsito los detiene y usted escucha cómo su amigo le jura al policía que no estaba hablando por teléfono. Para zanjar la discusión el policía le pregunta a usted si es cierto o no que su amigo estaba hablando por teléfono mientras conducía. ¿Cuál sería su respuesta?',
    choices: [
      'Sí señor agente, usted tiene la razón, mi amigo hablaba por su teléfono mientras conducía',
      'Obvio que no, íbamos conversando juntos',
      'Señor agente, ¿por qué no arreglamos esto por las buenas?',
      'No me di cuenta, estaba distraído',
    ],
    answer: [100, 25, 0, 75],
    mode: 'singular',
    type: 'weight_scale',
  },
  {
    id: 17,
    text: 'A usted le gusta hablar con Pedro y tratar de ayudarlo con algunos de sus problemas personales, pero no tiene ningún sentimiento romántico hacia él. Sin embargo Pedro la invita a salir el viernes con intenciones claramente románticas y no de amistad. Usted qué contesta:',
    choices: [
      'No Pedrito, me caes bien pero no estoy interesada en ti. Si es una salida de amigos vamos, de lo contrario no.',
      'Voy a decirle que sí pero el viernes me invento algo para no poder ir',
      'Toca aceptar porque qué pena o qué pecado decirle que no. Ya en la disco busco cómo evadirme',
    ],
    answer: [100, 50, 0],
    mode: 'singular',
    type: 'weight_scale',
  },
  {
    id: 18,
    text: '¿Bajo qué circunstancias su compromiso con la verdad flaquea?',
    choices: [
      'Cuando me da pena aceptar algo acerca de mi mismo',
      'Cuando los beneficios a cambio de la mentira son muy altos (conseguir un trabajo,una rebaja...)',
      'Cuando decir la verdad es injusto',
      'Cuando el propósito es noble',
    ],
    answer: [25, 0, 75, 100],
    mode: 'singular',
    type: 'weight_scale',
  },
  {
    id: 19,
    text: '¿Ha mentido sobre su vida amorosa para hacerla parecer más exitosa?',
    choices: ['Sí', 'No'],
    answer: [0, 100],
    mode: 'singular',
    type: 'weight_scale',
  },
  {
    id: 20,
    text: '¿Ha mentido sobre su vida sexual?',
    choices: ['Sí', 'No'],
    answer: [0, 100],
    mode: 'singular',
    type: 'weight_scale',
  },
  {
    id: 21,
    text: '¿Ha mentido sobre sus logros profesionales?',
    choices: ['Sí', 'No'],
    answer: [0, 100],
    mode: 'singular',
    type: 'weight_scale',
  },
  {
    id: 22,
    text: '¿Ha simulado saber o entender de un tema por pena a parecer ignorante?',
    choices: ['Sí', 'No'],
    answer: [0, 100],
    mode: 'singular',
    type: 'weight_scale',
  },
];

const trivia = new Trivia({
  questions,
  el: triviaEl,
  mode: 'perception',
});

const getScores = (sessionId) => (
  new Promise((resolve, reject) => {
    fetch(`${apiUrl}/get-scores`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId }),
    })
      .then((response) => response.json())
      .then((response) => {
        if (!response.success) {
          reject(response.error);
        }
        resolve(JSON.parse(response.body));
      })
      .catch(reject);
  })
);

const saveAnswer = (body) => (
  new Promise((resolve, reject) => {
    fetch(`${apiUrl}/add-answer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
      .then((response) => response.json())
      .then((response) => {
        if (!response.success) {
          reject(response.error);
        }
        resolve();
      })
      .catch(reject);
  })
);

function handleTriviaEnd(event) {
  const answers = Papa.unparse(event.detail.history);
  const body = Object.assign(s3Params, { answers });

  loader.classList.add('is-visible');

  saveAnswer(body)
    .then(() => {
      const sessionId = event.detail.session_id;
      return getScores(sessionId);
    })
    .then((data) => {
      const items = data.Items;
      loader.classList.remove('is-visible');
      trivia.el.style.display = 'none';
      results.style.display = 'block';
      const median = d3.median(items, (item) => item.score);
      myScore.textContent = `${event.detail.score.toFixed(2)}%`;
      elseScore.textContent = `${median.toFixed(2)}%`;
      renderGaugeChart(items, event.detail.score);
      TweenLite.fromTo('svg', 0.5, { scale: 0 }, { scale: 1 });
    })
    .catch(() => { /* handle error */ });
}

trivia.el.addEventListener('ended', handleTriviaEnd);

start.addEventListener('click', () => {
  document.body.classList.add('active-game');
  welcome.remove();
  triviaEl.style.display = 'block';
  trivia.init();
});
