import {clone, cloneSet, union} from "../common";

export class Graph {
    name: string;
    nodes: Set<string> = new Set<string>();
    edges: Map<string, Set<string>> = new Map<string, Set<string>>()

    constructor(name: string) {
        this.name = name;
    }

    addNode(node: string) {
        this.nodes.add(node);
    }

    addEdge(from: string, to: string) {
        if(!this.edges.has(from))
            this.edges.set(from, new Set<string>());

        this.edges.get(from)?.add(to);
    }

    circleFrom(node: string, visited: Set<string> = new Set<string>()): Set<string>{
        if(visited.has(node))
            return visited;

        visited = cloneSet(visited);

        visited.add(node);

        let circle = new Set<string>();

        this.edges.get(node)?.forEach(to => {
            let newCircle = this.circleFrom(to, visited)

            if(newCircle !== null) {
                circle = union(circle, newCircle)
            }
        });

        return circle;
    }

    topologicalSort(): string[] {
        let sorted: string[] = [];

        let visited = new Set<string>();

        this.nodes.forEach(node => {
            this.topologicalSortHelper(node, visited, sorted);
        });

        return sorted.reverse();
    }

    topologicalSortHelper(node: string, visited: Set<string>, sorted: string[]) {
        if(visited.has(node))
            return;

        visited.add(node);

        this.edges.get(node)?.forEach(to => {
            this.topologicalSortHelper(to, visited, sorted);
        });

        sorted.push(node);
    }
}