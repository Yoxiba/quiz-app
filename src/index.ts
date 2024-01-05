console.log("Hello World!");

type Questao = {
  question: string;
  options: string[];
  correct: number;
};

type Resultado = {
  nome: string;
  corretas: number;
};

let questoes: Questao[] = [];
let questaoAtual = 0;
let questaoRespondida = false;

fetch("pages/start.html")
  .then((resp) => resp.text())
  .then((html) => {
    const rootElem = document.getElementById("root") as HTMLElement;
    //if (rootElem) {
    rootElem.innerHTML = html;
    let button = document.getElementById("next");
    console.log(button);
    button?.addEventListener("click", (e: Event) => {
      fetch("pages/quiz.html")
        .then((resp) => resp.text())
        .then((html) => {
          const rootElem = document.getElementById("root") as HTMLElement;
          rootElem.innerHTML = html;

          carregarQuestoes();
        });
    });
    //}
  });
//lol
function salletnome(nome: string): void {
  localStorage.setItem("nome", nome);
}

function iniciarquiz(event: Event): void {
  event.preventDefault();
  const inputnome = document.getElementById("input-name") as HTMLInputElement;
  if (inputnome) {
    const nome = inputnome.value;
    salletnome(nome);
  }
}

async function carregarQuestoes(): Promise<void> {
  const dataJson = await fetch("./questions.json");
  const data = await dataJson.json();
  questoes = data.questions;
  questaoAtual = 0;

  // Limpar question_# storages
  questoes.forEach(async (value, index) => {
    localStorage.removeItem("question_" + index);
  });

  atualizarQuiz(questaoAtual);
}

function onClickResposta(numeroQuestao: number, posicaoResposta: number): void {
  localStorage.setItem("questao_" + numeroQuestao, String(posicaoResposta));
  questaoRespondida = true;

  // Meter a UI no botão como selecionado
}

async function onClickAvancar() {
  if (questaoRespondida) {
    console.log(questaoAtual + 1, questoes.length);
    if (questaoAtual + 1 === questoes.length) {
      // Ir para o leaderboard
      // Registar os resultados no estado global
      // Limpar os local storage: questao_0, questao_1 e questao_2
      /**
       * resultados:
       * [
       *  {name, corretas},
       *  ...
       * ]
       */

      let resultadosData = await localStorage.getItem("resultados");
      let resultados: Resultado[] = [];
      let nome = await localStorage.getItem("nome");

      // Verificar as questões que estão corretas
      let corretas = 0;
      questoes.forEach(async (questao, index) => {
        // Buscar o local storage com o index correspondente
        let respostaSelecionada = await localStorage.getItem(
          "questao_" + index
        );

        if (Number(respostaSelecionada) === questoes[index].correct) {
          corretas++;
        }
      });

      if (resultadosData) {
        resultados = JSON.parse(resultadosData) as Resultado[];
      }

      let novo_resultado = {
        nome: await localStorage.getItem("nome")!,
        corretas,
      };

      let nome_elemento_existente = -1;

      // Verificar se já existe um nome registado nos resultado.
      resultados.forEach((result, index) => {
        if (result.nome === nome) {
          nome_elemento_existente = index;
          return;
        }
      });

      if (nome_elemento_existente === -1) {
        resultados.push(novo_resultado);
      } else {
        resultados[nome_elemento_existente] = novo_resultado;
      }

      // Atualizar os resultados localStorage
      localStorage.setItem("resultados", JSON.stringify(resultados));

      paginaLeaderboard();

      // ... leaderboard
    } else {
      let respostaSelecionada = localStorage.getItem("questao_" + questaoAtual);

      let respostaCorreta =
        Number(respostaSelecionada) === questoes[questaoAtual].correct;

      alert(respostaCorreta ? "Acertou!" : "Errou!");
      atualizarQuiz(++questaoAtual);
    }
  } else {
    alert("Por favor, responda à questão");
  }
}

async function atualizarQuiz(numeroQuestao: number): Promise<void> {
  let questao = questoes[numeroQuestao];
  questaoRespondida = false;

  let questionNumber = document.querySelector(
    'h4[class="question-number"]'
  ) as HTMLHeadingElement;

  let questionContainer = document.querySelector(
    'div[class="question-container"]'
  ) as HTMLDivElement;

  let btnList = document.querySelector(
    'div[class="btn-list"]'
  ) as HTMLDivElement;

  questionNumber.innerHTML = numeroQuestao + 1 + "/" + questoes.length;
  questionContainer.innerHTML = questao.question;

  btnList.innerHTML = "";
  questao.options.forEach((option, index) => {
    let btnAnswer = document.createElement("button");
    btnAnswer.className = "btn-answr";
    btnAnswer.innerHTML = option;
    btnAnswer.onclick = () => onClickResposta(numeroQuestao, index);
    btnList.appendChild(btnAnswer);
  });
}

function paginaLeaderboard() {
  fetch("pages/leaderboard.html")
    .then((resp) => resp.text())
    .then((html) => {
      const rootElem = document.getElementById("root") as HTMLElement;
      rootElem.innerHTML = html;

      const resultadosString = localStorage.getItem("resultados");
      if (resultadosString) {
        const resultados: Resultado[] = JSON.parse(resultadosString);

        const resultadosOrdenados = resultados.sort(
          (a, b) => b.corretas - a.corretas
        );

        // Trocar o segundo lugar com o primeiro para a UI ficar correta
        let aux = resultadosOrdenados[0];
        resultadosOrdenados[0] = resultadosOrdenados[1];
        resultadosOrdenados[1] = aux;

        const containerPodium = document.querySelector(
          "div[class='container-podium']"
        ) as HTMLDivElement;

        const remainingList = document.querySelector(
          "div[class='remaining-list']"
        ) as HTMLDivElement;
        containerPodium.innerHTML = "";
        remainingList.innerHTML = "";
        resultadosOrdenados.slice(0, 3).forEach((resultado, index) => {
          let podiumClass = "";
          const nomeSplit = resultado.nome.split(" ");

          const iniciais =
            nomeSplit.slice(0, 1).map((valor) => valor[0])[0] +
            nomeSplit.slice(-1).map((valor) => valor[0])[0];

          switch (index) {
            case 0:
              podiumClass = "second-podium";
              break;
            case 1:
              podiumClass = "first-podium";
              break;
            case 2:
              podiumClass = "third-podium";
              break;
          }
          containerPodium.innerHTML += `
            <div class="podium-item">
              <div class="podium-rounded ${podiumClass}">${iniciais.toUpperCase()}</div>
              <div>${resultado.nome}</div>
              <div>${resultado.corretas}/${questoes.length}</div>
            </div>
          `;
        });

        const remainingResultados = resultadosOrdenados.slice(
          3,
          resultadosOrdenados.length
        );
        remainingResultados.forEach((resultado, index) => {
          remainingList.innerHTML += `
            <div class="remaining-item">${index + 4}. ${resultado.nome} <span>${
            resultado.corretas
          }/${questoes.length}</span></div>
          `;
        });
      }
    });
}
