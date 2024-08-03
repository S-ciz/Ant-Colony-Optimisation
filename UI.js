import { Graph } from "./main.js";

let aco;

const colorPath = (nest, food) => {
  const paths = aco.optimize(nest, food);
  const minPath = aco.getMinPath(paths, food);
  let str = nest;
  for (let node of minPath) {
    str += "->" + node.node;
  }


  //set parameters
  const numAnts = parseInt( document.querySelector('input#numAnts').value);
  const numTrials = parseInt( document.querySelector('input#numTrials').value )
  const evaporationRate = parseFloat(document.querySelector('input#evapoRate').value);
  
  if(numAnts && numTrials && evaporationRate)
  {
    aco.setNumAnts(numAnts);
    aco.setNumTrials(numTrials);
    aco.setEvaporationRate(evaporationRate);
  }

  return str + "[" + 'color="blue" ' + "]";
};

function loadCollectionEvents() {
  const Div = document.querySelector("div#collections");
  console.log(Div);
  Div.innerHTML = "Nodes will go here";

  const Input = document.querySelector("input#inputCollection");

  const Btn = document.querySelector("button#btnCollection");
  Btn.addEventListener("click", () => {
    Div.innerHTML = "";
    Div.innerHTML += Input.value + " ";
    Input.value = "";
    loadEdges(Div);
    aco = new Graph();
  });
}

function readListToSelectElement(selectElement, nodeCollection) {
  for (let node of nodeCollection) {
    if (node != "") {
      node = node.toUpperCase();
      let option = document.createElement("option");
      option.value = node;
      option.innerHTML = node;
      selectElement.appendChild(option);
    }
  }
}

function loadEdges(div) {
  const options = document.querySelector("#options");
  options.innerHTML = "";
  let select = document.createElement("select");
  let select2 = document.createElement("select");
  let nodeCollection = div.innerHTML.split(" ");

  readListToSelectElement(select, nodeCollection);
  readListToSelectElement(select2, nodeCollection);
  options.appendChild(select);
  options.appendChild(select2);
  const input = document.createElement("input");
  input.placeholder = "distance";
  input.type = "number";
  options.appendChild(input);

  // edges
  const EdgesList = document.querySelector("div.edges");
  EdgesList.innerHTML = "";

  const btnEdges = document.querySelector("button#btnEdge");
  btnEdges.addEventListener("click", () => {
    EdgesList.innerHTML += select.value + select2.value + `(${input.value})` + "  ";
    aco.addEdge(select.value, select2.value, parseInt(input.value));
  });
}


function DrawBestPath() {
  const nest = document.querySelector("input#nest").value.toUpperCase();
  const food = document.querySelector("input#food").value.toUpperCase();

  const foodList = food.split(" ");
  let newList = foodList.filter((item) => item !== "");
  //   let foodList = food.split(" ")
  const bpath = colorPath(nest, newList) + "\n";
  const results = aco.bfs(nest);
  const dot = "digraph G {" + bpath + results + "}";
  drawGraph(dot);
}

function drawGraph(dot) {
  const visualContainer = document.querySelector("main#graphic");
  visualContainer.innerHTML = "";
  console.log(aco);
  const viz = new Viz();
  viz
    .renderSVGElement(dot)
    .then(function (element) {
      visualContainer.appendChild(element);
    })
    .catch((error) => {
      console.log(error);
    });
}

function visualize() {
  const nest = document.querySelector("input#nest").value.toUpperCase();
  let results = aco.bfs(nest);
  const dot = "digraph G {" + results + "}";
  drawGraph(dot);
}


window.addEventListener("load", () => {
  loadCollectionEvents();
  const visualizeEl = document.querySelector("button#Visualize");
  visualizeEl.addEventListener("click", visualize);
  const bestPathEl = document.querySelector("button#bestPath");
  bestPathEl.addEventListener("click", DrawBestPath);
});

//to do: mutiple food sources*, pheromone intensity*, obstacles: later find out about laden vs unladen