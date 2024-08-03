export class Graph {
  constructor() {
    this.graph = [];
    this.numAnts = 10; // Define the number of ants
    this.numTrials = 100
    this.evaporationRate = 0.5;
    this.initPLevel = 1;
  }

  setNumAnts(n)
  {
    this.numAnts = n;
  }
  setNumTrials(t)
  {
  this.numTrials = t;
  }
  setEvaporationRate(e)
  {
    this.evaporationRate = e;
  }

  reverse(str) {
    return str.split("").reverse().join("");
  }

  bfs(startNode, widthCondition= true) {
    let queue = [startNode];
    let visited = [];
    visited[startNode] = true;

    let str = "";
    let strArr = []; // ab  reverse ba

    while (queue.length > 0) {
      let currElement = queue.shift();
      for (let element of this.graph[currElement]) {
        let newWord = currElement + element.node;
        let results = strArr.find(
          (item) => item == newWord || item == this.reverse(newWord)
        );
        if (!results) {
          strArr.push(newWord);
          let combineCosts =
            "(" + element.distance + ":" + element.pLevel + ")";
            const displayPenwidth = `penwidth=${2*element.pLevel }`
          str +=
            currElement +
            " -> " +
            element.node +
            "[" +
            `label="${combineCosts.toString()}" ${widthCondition ? displayPenwidth: " "}
              ` +
            "];" +
            "\n";
        }

        if (!visited[element.node]) {
          visited[element.node] = true;
          queue.push(element.node);
        }
      }
    }

    console.log(str)
    return str;
  }
  addEdge(a, b, distance) {
    if (!this.graph[a]) {
      this.graph[a] = [];
    }
    if (!this.graph[b]) {
      this.graph[b] = [];
    }
    this.graph[a].push({
      node: b,
      distance: distance,
      pLevel: this.initPLevel,
    });
    this.graph[b].push({
      node: a,
      distance: distance,
      pLevel: this.initPLevel,
    });
  }

  totalDistance(pathList) {
    let sum = 0;
    for (let entry of pathList) {
      sum += entry.distance;
    }

    return sum;
  }

  getNextNode(currNode, visitedNodes) {
    let children = this.graph[currNode];
    let probabilities = [];
    let sum = 0;
    for (let i = 0; i < children.length; i++) {
      if (!visitedNodes.includes(children[i].node)) {
        sum += children[i].pLevel * (1 / children[i].distance);
      }
    }
    for (let i = 0; i < children.length; i++) {
      if (!visitedNodes.includes(children[i].node)) {
        probabilities.push({
          pLevel: children[i].pLevel,
          distance: children[i].distance,
          node: children[i].node,
          probability: (children[i].pLevel * (1 / children[i].distance)) / sum,
        });
      }
    }

    probabilities.sort((a, b) => a.probability - b.probability);

    // Cumulative probability
    let cumulativeProbabilities = [];
    let cumulative = 0;
    for (let i = 0; i < probabilities.length; i++) {
      cumulative += probabilities[i].probability;
      cumulativeProbabilities.push({
        pLevel: probabilities[i].pLevel,
        distance: probabilities[i].distance,
        node: probabilities[i].node,
        cumProb: cumulative,
      });
    }

    let r = Math.random();
    for (let obj of cumulativeProbabilities) {
      if (r < obj.cumProb) {
        return { node: obj.node, distance: obj.distance, pLevel: obj.pLevel };
      }
    }

    return null;
  }

  updatePheromone(path, isbestPath= false) {
    for (let i = 0; i < path.length - 1; i++) {
      let currNode = path[i].node;
      let nextNode = path[i + 1].node;
      let distance = path[i + 1].distance;
      let edge = this.graph[currNode].find((item) => item.node === nextNode);

      if(isbestPath)
      {
        edge.pLevel = edge.pLevel * (1 - this.evaporationRate) + 10 / distance;
      }else 
      {
        edge.pLevel = edge.pLevel * (1 - this.evaporationRate) + 1 / distance;
      }
      
    }
  }

  isInEndNode(currNode, endNodes) {
    return endNodes.find((item) => item == currNode);
  }

  optimize(startNode, endNode) {
    let t = 0;
    let paths = [];
    while (t < this.numTrials) {
      for (let a = 0; a < this.numAnts; a++) {
        // Construct Path
        let currNode = startNode;
        let path = [];
        let visitedNodes = [currNode];
        while (!this.isInEndNode(currNode, endNode)) {
          const nextNode = this.getNextNode(currNode, visitedNodes);
          if (nextNode !== null) {
            path.push(nextNode);
            visitedNodes.push(nextNode.node);
            currNode = nextNode.node;
          } else {
            break; // If no next node is found, break the loop
          }
        }

        paths.push(path);
      }
      let bestPath = this.getMinPath(paths, endNode);
      for(let path of paths)
      {
        this.updatePheromone(path, path=== bestPath);
      }
      t++;
    }
    return paths;
  }

  getMinPath(paths, endNodes) {
    let minPath = [];
    let minDistance = Infinity;

    for (let path of paths) {
      let distance = this.totalDistance(path);
      if (
        minDistance > distance &&
        this.isInEndNode(path[path.length - 1].node, endNodes) !== undefined
      ) {
        minDistance = distance;
        minPath = path;
      }
    }

    //update graph

    // let currNode = "A";
    // for (let p of minPath) {
    //   let childrenCurNode = this.graph[currNode];
    //   let child = childrenCurNode.find((item) => item.node == p.node);
    //   child.pLevel = p.pLevel;
    //   currNode = child.node;
    // }

    return minPath;
  }
}
