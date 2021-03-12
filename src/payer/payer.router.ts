import express, { Request, Response } from "express";
import * as PayersTransactionsService from "./payer-txn.service";
import { PayerBalance, PayerTransaction } from "./payer-txn.interface";
import { StatusCodes, getReasonPhrase } from "http-status-codes";
import { responseStructure } from "../util";

export const payerTransactionRouter = express.Router();

// get transactions
payerTransactionRouter.get("/", async (_req: Request, res: Response) => {
  try {
    res.status(StatusCodes.OK).json("Fetch Rewards Test...");
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error.message);
  }
});

// get transactions
payerTransactionRouter.get(
  "/transactions",
  async (_req: Request, res: Response) => {
    try {
      const payersTransactions: Array<PayerTransaction> = await PayersTransactionsService.getPayersTransactions();
      res
        .status(StatusCodes.OK)
        .json(
          responseStructure(
            StatusCodes.OK,
            payersTransactions,
            getReasonPhrase(StatusCodes.OK)
          )
        );
    } catch (error) {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(
          responseStructure(
            StatusCodes.INTERNAL_SERVER_ERROR,
            null,
            getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR)
          )
        );
    }
  }
);

payerTransactionRouter.get("/balance", async (_req: Request, res: Response) => {
  try {
    const payerBalance: Array<PayerBalance> = await PayersTransactionsService.getPayersBalances();
    res
      .status(StatusCodes.OK)
      .json(
        responseStructure(
          StatusCodes.OK,
          payerBalance,
          getReasonPhrase(StatusCodes.OK)
        )
      );
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(
        responseStructure(
          StatusCodes.INTERNAL_SERVER_ERROR,
          null,
          getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR)
        )
      );
  }
});

payerTransactionRouter.post(
  "/add-transaction",
  async (req: Request, res: Response) => {
    try {
      let data = await PayersTransactionsService.addPayerTransaction(req.body);
      if (data.error) {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json(
            responseStructure(StatusCodes.BAD_REQUEST, null, data.error.message)
          );
      }
      res
        .status(StatusCodes.OK)
        .json(
          responseStructure(
            StatusCodes.OK,
            data.data,
            "Transaction Added Succefully"
          )
        );
    } catch (error) {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(
          responseStructure(
            StatusCodes.INTERNAL_SERVER_ERROR,
            null,
            getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR)
          )
        );
    }
  }
);

payerTransactionRouter.post(
  "/spend-points",
  async (req: Request, res: Response) => {
    try {
      let data = await PayersTransactionsService.spendPoints(req.body);
      if (data.isError) {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json(
            responseStructure(
              StatusCodes.BAD_REQUEST,
              data.detail,
              data.message
            )
          );
      } else {
        res
          .status(StatusCodes.OK)
          .json(
            responseStructure(
              StatusCodes.OK,
              data.detail,
              getReasonPhrase(StatusCodes.OK)
            )
          );
      }
    } catch (error) {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(
          responseStructure(
            StatusCodes.INTERNAL_SERVER_ERROR,
            null,
            getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR)
          )
        );
    }
  }
);
