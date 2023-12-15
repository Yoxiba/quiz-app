console.log("Hello World!");
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
        });
    });
    //}
  });
//lol
function salvarnome(nome: string): void {
  localStorage.setItem("nome", nome);
}
function iniciarquiz(event: Event): void {
  event.preventDefault();
  const inputnome = document.getElementById("input-name") as HTMLInputElement;
  if (inputnome) {
    const nome = inputnome.value;
    salvarnome(nome);
  }
}
