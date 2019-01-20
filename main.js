const roads = [
  "Alice's House-Bob's House",
  "Alice's House-Cabin",
  "Alice's House-Post Office",
  "Bob's House-Town Hall",
  "Daria's House-Ernie's House",
  "Daria's House-Town Hall",
  "Ernie's House-Grete's House",
  "Grete's House-Farm",
  "Grete's House-Shop",
  'Marketplace-Farm',
  'Marketplace-Post Office',
  'Marketplace-Shop',
  'Marketplace-Town Hall',
  'Shop-Town Hall'
];

// This graph will be a collection of points(villages) with lines between them (roads)
function buildGraph(edges) {
  let graph = Object.create(null);
  function addEdge(from, to) {
    if (graph[from] == null) {
      graph[from] = [to];
    } else {
      graph[from].push(to);
    }
  }
  for (let [from, to] of edges.map(r => r.split('-'))) {
    addEdge(from, to);
    addEdge(to, from);
  }
  return graph;
}
// Given an array of edges, buildGraph creates a map object that
//stores an array of connected Nodes
const roadGraph = buildGraph(roads);

// we define village's state and don't change the state when the robot moves but compute
// a new state for the situation after the move.

class VillageState {
  constructor(place, parcels) {
    this.place = place;
    this.parcels = parcels;
  }

  move(destination) {
    // check whether there is a road from current place to destination
    // if not, you cannot move so return old state
    if (!roadGraph[this.place].includes(destination)) {
      return this;
    }
    // road exists, create new state with the destination as the robot's new place.
    else {
      // create new set of parcels, parcels robot is carrying need to move with it
      // parcels that are addressed to the new place need to be delivered
      let parcels = this.parcels
        // map takes care of the moving
        .map(p => {
          if (p.place != this.place) return p;
          // console.log('map', { place: destination, dropOffAddress: p.dropOffAddress });
          return {
            place: destination,
            dropOffAddress: p.dropOffAddress
          };
        })
        // filter does the delivering, if place = dropOffAddress, remove the parcel
        .filter(p => p.place != p.dropOffAddress);
      // console.log('filter', new VillageState(destination, parcels));
      return new VillageState(destination, parcels);
    }
  }
}

// let first = new VillageState('Post Office', [
//   { place: 'Post Office', dropOffAddress: "Alice's House" }
// ]);
// let next = first.move("Alice's House");

// console.log(next.place);
// console.log(next.parcels);
// console.log(first.place);

function runRobot(state, robot, memory) {
  for (let turn = 0; ; turn++) {
    if (state.parcels.length == 0) {
      return turn;
    }
    let action = robot(state, memory);
    state = state.move(action.direction);
    memory = action.memory;
    // console.log(`Moved to ${action.direction}`);
  }
}

// dumb solution, robot walks in random direction
function randomPick(arr) {
  let choice = Math.floor(Math.random() * arr.length);
  return arr[choice];
}

function randomRobot(state) {
  return { direction: randomPick(roadGraph[state.place]) };
}

VillageState.random = function(parcelCount = 5) {
  let parcels = [];
  for (let i = 0; i < parcelCount; i++) {
    let dropOffAddress = randomPick(Object.keys(roadGraph));
    let place;
    // We don't want any parcels sent from the same place they are addressed to
    // the do loop keeps picking new places when it gets one that's equal to the address
    do {
      place = randomPick(Object.keys(roadGraph));
    } while (place == dropOffAddress);
    parcels.push({ place, dropOffAddress });
  }
  return new VillageState('Post Office', parcels);
};

// runRobot(VillageState.random(), randomRobot);

// route that passes all places in the village
const mailRoute = [
  "Alice's House",
  'Cabin',
  "Alice's House",
  "Bob's House",
  'Town Hall',
  "Daria's House",
  "Ernie's House",
  "Grete's House",
  'Shop',
  "Grete's House",
  'Farm',
  'Marketplace',
  'Post Office'
];

function routeRobot(state, memory) {
  if (memory.length == 0) {
    memory = mailRoute;
  }
  return { direction: memory[0], memory: memory.slice(1) };
}

// runRobot(VillageState.random(), routeRobot, []);

function findRoute(graph, from, to) {
  // keep a work list: array of places to be explored next, along with route that got us there.
  let work = [{ at: from, route: [] }];
  for (let i = 0; i < work.length; i++) {
    let { at, route } = work[i];
    for (let place of graph[at]) {
      if (place == to) return route.concat(place);
      if (!work.some(w => w.at == place)) {
        work.push({ at: place, route: route.concat(place) });
      }
    }
  }
}

function optimalRobot({ place, parcels }, route) {
  if (route.length == 0) {
    let parcel = parcels[0];
    // if parcel hasn't been picked up yet, plot route toward it
    if (parcel.place != place) {
      route = findRoute(roadGraph, place, parcel.place);
    } else {
      // parcel has been picked up, needs to be delivered, plot route towards dropOff
      route = findRoute(roadGraph, place, parcel.dropOffAddress);
    }
  }
  return { direction: route[0], memory: route.slice(1) };
}

// runRobot(VillageState.random(), optimalRobot, []);

function compareRobots(robot1, memory1, robot2, memory2) {
  let total1 = 0;
  total2 = 0;
  for (let i = 0; i < 100; i++) {
    let state = VillageState.random();
    total1 += runRobot(state, robot1, memory1);
    total2 += runRobot(state, robot2, memory2);
  }

  console.log(
    `$ robot1 needed ${total1 / 100} steps; robot2 needed ${total2 /
      100} steps.`
  );
}
compareRobots(routeRobot, [], optimalRobot, []);
