console.log("Hello World!");
fetch("pages/start.html")
  .then((resp) => resp.text())
  .then((html) => {
    const rootElem = document.getElementById("root") as HTMLElement;
    //if (rootElem) {
    rootElem.innerHTML = html;
    //}
  });
//lol
