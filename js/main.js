
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async() => {
  try {
  let reg;
  reg = await navigator.serviceWorker.register('./sw.js', {type: "module"});
  console.log('Service worker registrada! 😎', reg);
  }catch (err) {
  console.log('😢 Service worker registro falhou:', err);
  }
  });
}
  

var constraints = { video: {facingMode: "user"}, audio: false };


const cameraView = document.querySelector("#camera--view"),
cameraOutput = document.querySelector("#camera--output"),
cameraTrigger = document.querySelector("#camera--trigger"),
cameraSensor = document.querySelector("#camera--sensor")




function cameraStart(){
navigator.mediaDevices
 .getUserMedia(constraints)
 .then(function (stream){
  let track = stream.getTracks[0];
  cameraView.srcObject = stream;
})
.catch(function (error){
  console.error("Ocorreu um Erro.", error);
});
}

cameraTrigger.onclick = function () {
cameraSensor.width = cameraView.videoWidth;
cameraSensor.height = cameraView.videoHeight;
cameraSensor.getContext("2d").drawImage(cameraView, 0, 0);
cameraOutput.src = cameraSensor.toDataURL("image/webp");
adicionarDados(cameraOutput.src);
cameraOutput.classList.add("taken");
};


window.addEventListener("load", cameraStart, false);


import { openDB } from "idb";

let db;
async function criarDB(){
  try {
      db = await openDB('banco', 2, {
          upgrade(db, oldVersion, newVersion, transaction){
              switch  (oldVersion) {
                  case 0:
                  case 1:
                      const store = db.createObjectStore('dado', {
                          keyPath: 'nome' 

                      });

                      store.createIndex('id', 'id');
                      console.log("Banco de dados criado!");
              }
          }
      });
      console.log("banco de dados aberto!");
  }catch (e) {
      console.log('Erro ao criar/abrir banco: ' + e.message);
  }
}

window.addEventListener('DOMContentLoaded', async event =>{
  criarDB();
  document.getElementById('btnCarregar').addEventListener('click', buscarTodosDados);


});

async function buscarTodosDados(){
  if(db == undefined){
      console.log("O banco de dados está fechado.");
  }
  const tx = await db.transaction('dado', 'readonly');
  const store = await tx.objectStore('dado');
  const dados = await store.getAll();
  if(dados){
      const divLista = dados.map(dado => {
          return `<div class="item">
                  <p>${dado.nome}</p>
                  <img src="${dado.fototirada}" alt=""/>
                 </div>`
      });
      listagem(divLista.join(' '));
  } 
}

async function adicionarDados(fototirada) {
  let nome = document.getElementById("nome").value;

  const tx = await db.transaction('dado', 'readwrite')
  const store = tx.objectStore('dado');
  try {
      await store.add({ nome: nome, fototirada:fototirada});
      await tx.done;
      limparCampos();
      console.log('Registro adicionado com sucesso!');
  } catch (error) {
      console.error('Erro ao adicionar registro:', error);
      tx.abort();
  }
}


function limparCampos() {
  document.getElementById("nome").value = '';

}

function listagem(text){
  document.getElementById('resultados').innerHTML = text;
}
