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
          console.log('map', { place: destination, address: p.address });
          return { place: destination, address: p.address };
        })
        // filter does the delivering, if place = address, remove the parcel
        .filter(p => p.place != p.address);
      console.log('filter', new VillageState(destination, parcels));
      return new VillageState(destination, parcels);
    }
  }
}

let first = new VillageState('Post Office', [
  { place: 'Post Office', address: "Alice's House" }
]);
let next = first.move("Alice's House");

// console.log(next.place);
// console.log(next.parcels);
// console.log(first.place);

// function runRobot(state, robot, memory) {
//   for (let turn = 0;; turn++) {
//     if (state.parcels.length == 0) {
//       console.log(`Done in ${turn} turns`);
//       break
//     }
//   }
// }