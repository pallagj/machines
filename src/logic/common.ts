export function clone(obj: any){
    return JSON.parse(JSON.stringify(obj));
}

export function cloneSet<Type>(s: Set<Type>) : Set<Type> {
    let y = new Set<Type>();
    s.forEach(e => y.add(e));
    return y;
}
export function union(a: Set<string>, b: Set<string>): Set<string>{
    let y = new Set<string>();

    a.forEach(e => y.add(e));
    b.forEach(e => y.add(e));

    return y;
}


export function intersect(a: Set<string>, b: Set<string>) : Set<string> {
    return new Set(
        // @ts-ignore
        [...a].filter(x => b.has(x)));
}

export function difference(a: Set<string>, b: Set<string>) : Set<string> {
    return new Set(
        // @ts-ignore
        [...a].filter(element => !b.has(element)));
}

export function hasIntersect(a: Set<string>, b: Set<string>) : boolean {
    // @ts-ignore
    return intersect(a, b).size > 0;
}

export function toArray(a: Set<string> | undefined) : Array<string> {
    if(a === undefined) {
        return [];
    }

    // @ts-ignore
    return [...a];
}

