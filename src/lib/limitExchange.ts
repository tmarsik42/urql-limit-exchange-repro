import { makeSubject, pipe, merge, filter, tap } from "wonka";
import type { Exchange, Operation } from "@urql/core";

export const limitExchange = (limit: number): Exchange => {
    return ({ forward }) => {
        return (operations$) => {
            let availableQuerySlotCount = limit;

            let activeOperations: number[] = [];
            let serialOperationQueue: Operation[] = [];
            let { source: serializedOperations$, next: dispatchOperation } =
                makeSubject<Operation>();

            const filteredOperations$ = pipe(
                operations$,
                filter((operation) => {
                    if (operation.kind === "teardown") {
                      serialOperationQueue = serialOperationQueue.filter(
                        (o) => o.key !== operation.key
                      );
                        serializedOperations$ = pipe(
                            serializedOperations$,
                            filter((o) => o.key !== operation.key)
                        );
                    }

                    if (operation.kind !== "query") {
                        return true;
                    } else if (availableQuerySlotCount === 0) {
                        serialOperationQueue.push(operation);

                        return false;
                    }

                    activeOperations.push(operation.key);
                    availableQuerySlotCount -= 1;

                    return true;
                })
            );

            return pipe(
                merge([filteredOperations$, serializedOperations$]),
                forward,
                tap((result) => {
                    if (
                        activeOperations.includes(result.operation.key)
                    ) {
                        const nextOperation = serialOperationQueue.shift();
                        availableQuerySlotCount += 1;
                        if (nextOperation) {
                            activeOperations.push(nextOperation.key);
                            availableQuerySlotCount -= 1;
                            dispatchOperation(nextOperation);
                        } else {
                            activeOperations = [];
                            availableQuerySlotCount = limit;
                        }
                    }
                })
            );
        };
    };
};
