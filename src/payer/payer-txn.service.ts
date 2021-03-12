import {
  PayerBalance,
  PayerDetailedTransaction,
  PayerTransaction,
  SpendPoint,
  SpendPointRes,
} from "./payer-txn.interface";
import { v4 as uuidv4 } from "uuid";
import {
  addPayerTransactionSchema,
  spendPointsSchema,
} from "./payer.validation";
import { ValidationError } from "joi";

// in memory store
let payersTransactionsStore: Array<PayerDetailedTransaction> = [];

// in memory store for spent transactions
let spentTransactionsStore: Array<PayerDetailedTransaction> = [];

// in memory store for spent points
let spentPointsStore: Array<SpendPoint> = [];

// in memory store for balance
let balance: Array<PayerBalance> = [];

// get all payers transaction
export const getPayersTransactions = async (): Promise<
  Array<PayerTransaction>
> => payersTransactionsStore;

// get one payer transaction
export const getOnePayerTransaction = async (
  payerId: string
): Promise<PayerTransaction | undefined> =>
  payersTransactionsStore.find((data) => data.payerId === payerId);

// order payer transactions
export const sortPayersTransactionsStore = (
  store: Array<PayerDetailedTransaction>
) => {
  if (store.length) {
    payersTransactionsStore = store.sort((a, b) => a.time - b.time);
  }
};

// add to payers transactions
export const addPayerTransaction = async (
  data: PayerTransaction
): Promise<{
  error: ValidationError | undefined;
  data: Array<PayerDetailedTransaction>;
}> => {
  const { error } = addPayerTransactionSchema.validate(data);
  if (!error) {
    // add payer id and time
    let payerTxn: PayerDetailedTransaction = {
      ...data,
      payerId: uuidv4(),
      time: new Date(data.timestamp).getTime(),
    };

    payersTransactionsStore = [...payersTransactionsStore, payerTxn];
    sortPayersTransactionsStore(payersTransactionsStore);
  }

  return { error, data: payersTransactionsStore };
};

// update store point
export const updateStorePoints = async (
  payerId: string,
  points: number
): Promise<Array<PayerDetailedTransaction>> => {
  return payersTransactionsStore.map((txn) => {
    if (txn.payerId === payerId) {
      txn.points = points;
    }
    return txn;
  });
};

// get the spent points
export const getSpentPoints = async (): Promise<
  Array<PayerDetailedTransaction>
> => {
  return payersTransactionsStore.filter((data) => {
    return data.points === 0;
  });
};

// removes the spent points
export const removeSpentPoints = async (): Promise<
  Array<PayerDetailedTransaction>
> => {
  return payersTransactionsStore.filter((data) => {
    return data.points !== 0;
  });
};

// spend points
export const spendPoints = async (data: SpendPoint): Promise<SpendPointRes> => {
  const { error } = spendPointsSchema.validate(data);
  if (!error) {
    let pointToSpend = data.points;
    if (payersTransactionsStore.length) {
      let payersTransactionsObj: {
        [key: string]: { balance: number; spent: number; isAdded?: boolean };
      } = {};

      for (const values of payersTransactionsStore) {
        if (payersTransactionsObj[values.payer]) {
          payersTransactionsObj[values.payer] = {
            balance:
              payersTransactionsObj[values.payer].balance + values.points,
            spent: payersTransactionsObj[values.payer].spent,
          };
        } else {
          payersTransactionsObj[values.payer] = {
            balance: values.points,
            spent: 0,
          };
        }

        if (pointToSpend) {
          let substractedPoint = 0;
          if (pointToSpend > values.points) {
            pointToSpend -= values.points;
            substractedPoint = values.points;

            //  updates the store with the new points
            payersTransactionsStore = await updateStorePoints(
              values.payerId,
              0
            );
          } else {
            substractedPoint = pointToSpend;

            // updates the store with the new points
            payersTransactionsStore = await updateStorePoints(
              values.payerId,
              values.points - pointToSpend
            );
            pointToSpend = 0;
          }
          payersTransactionsObj[values.payer].balance -= substractedPoint;
          payersTransactionsObj[values.payer].spent -= substractedPoint;
        }
      }

      // add spent points
      spentTransactionsStore = [
        ...spentTransactionsStore,
        ...(await getSpentPoints()),
      ];

      // remains only unspent points
      payersTransactionsStore = await removeSpentPoints();

      // spent points
      spentPointsStore = Object.entries(payersTransactionsObj).map(
        (data: any) => {
          return { payer: data[0], points: data[1].spent };
        }
      );

      let copyPayersTransactionsObj = { ...payersTransactionsObj };

      if (balance.length) {
        // update balance
        balance = balance.map((data: PayerBalance) => {
          let dataKey = Object.keys(data);
          if (copyPayersTransactionsObj[dataKey[0]]) {
            data[dataKey[0]] = copyPayersTransactionsObj[dataKey[0]].balance;
            copyPayersTransactionsObj[dataKey[0]].isAdded = true;
          }
          return data;
        });

        // if not added
        balance = [
          ...balance,
          ...Object.entries(payersTransactionsObj)
            .filter((data) => !data[1].isAdded)
            .map((newBalance) => {
              return { [newBalance[0]]: newBalance[1].balance };
            }),
        ];
      } else {
        // add balance
        balance = Object.entries(payersTransactionsObj).map((data) => {
          return { [data[0]]: data[1].balance };
        });
      }
      return {
        isError: false,
        detail: spentPointsStore,
        message: "Success",
      };
    } else {
      return {
        isError: true,
        detail: [],
        message: "No Transaction added",
      };
    }
  } else {
    return {
      isError: true,
      detail: [],
      message: error.message,
    };
  }
};

// get balance
export const getPayersBalances = async (): Promise<
  Array<{ [key: string]: number }>
> => {
  return balance;
};
