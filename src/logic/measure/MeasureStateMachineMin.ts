import {StateMachine} from "../expressions/StateMachine";

export class MeasureStateMachineMin {
    printStatistics() {
        let measure = (calculation: () => void) => {
            let start = performance.now();
            calculation();
            let end = performance.now();
            return end - start;
        }

        console.log("states\ttime\ttime2\ttime3\ttime4");

        for (let i = 1; i < 30; i += 1) {
            let time = 0;
            let time2 = 0;
            let time3 = 0;
            let time4 = 0;

            for (let j = 0; j < 100; j++) {

                let machine = StateMachine.createMachine(i, 2);
                machine = machine.available().determination().available().clean();

                try {
                    time = measure(() => machine.clone().naiveMinimize());
                    time2 = measure(() => machine.clone().minimize());
                    time3 = measure(() => machine.clone().minimize2());
                    time4 = measure(() => machine.clone().minimize3());

                    console.log(i + "\t" + time + "\t" + time2 + "\t" + time3 + "\t" + time4);
                } catch (e) {
                    j--;
                }
            }

        }
    }
}