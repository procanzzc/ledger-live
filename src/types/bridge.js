// @flow

// NB this new "bridge" is a re-take of live-desktop bridge ideas
// with a focus to eventually make it shared across both projects.

// a WalletBridge is implemented on renderer side.
// this is an abstraction on top of underlying blockchains api (libcore / ethereumjs / ripple js / ...)
// that would directly be called from UI needs.

import { BigNumber } from "bignumber.js";
import type { Observable } from "rxjs";
import type {
  AccountLike,
  Account,
  AccountRaw,
  CryptoCurrency,
  TransactionStatus,
  Transaction,
  SignOperationEvent,
  SignedOperation,
  Operation,
  DerivationMode,
  SyncConfig
} from ".";

export type ScanAccountEvent = {
  type: "discovered",
  account: Account
}; // more events will come in the future

export type ScanAccountEventRaw = {
  type: "discovered",
  account: AccountRaw
};

// unique identifier of a device. it will depends on the underlying implementation.
export type DeviceId = string;

// Abstraction related to a currency
export interface CurrencyBridge {
  // Preload data required for the bridges to work. (e.g. tokens, delegators,...)
  // Assume to call it at every load time but as lazy as possible (if user have such account already AND/OR if user is about to scanAccounts)
  // returned value is a serializable object
  // fail if data was not able to load.
  preload(): Promise<Object>;

  // reinject the preloaded data (typically if it was cached)
  // method need to treat the data object as unsafe and validate all fields / be backward compatible.
  hydrate(data: mixed): void;

  // Scan all available accounts with a device
  scanAccounts({
    currency: CryptoCurrency,
    deviceId: DeviceId,
    scheme?: ?DerivationMode,
    syncConfig: SyncConfig
  }): Observable<ScanAccountEvent>;
}

// Abstraction related to an account
export interface AccountBridge<T: Transaction> {
  // synchronizes an account continuously to update with latest blochchains state.
  // The function emits updater functions each time there are data changes (e.g. blockchains updates)
  // an update function is just a Account => Account that perform the changes (to avoid race condition issues)
  // initialAccount parameter is used to point which account is the synchronization on, but it should not be used in the emitted values.
  // the sync can be stopped at any time using Observable's subscription.unsubscribe()
  sync(
    initialAccount: Account,
    syncConfig: SyncConfig
  ): Observable<(Account) => Account>;

  // a Transaction object is created on UI side as a black box to put all temporary information to build the transaction at the end.
  // There are a bunch of edit and get functions to edit and extract information out ot this black box.
  // it needs to be a serializable JS object
  createTransaction(account: Account): T;

  updateTransaction(t: T, patch: $Shape<T>): T;

  // prepare the remaining missing part of a transaction typically from network (e.g. fees)
  // and fulfill it in a new transaction object that is returned (async)
  // It can fails if the the network is down.
  prepareTransaction(account: Account, transaction: T): Promise<T>;

  // calculate derived state of the Transaction, useful to display summary / errors / warnings. tells if the transaction is ready.
  getTransactionStatus(
    account: Account,
    transaction: T
  ): Promise<TransactionStatus>;

  // heuristic that provide the estimated max amount that can be set to a send.
  // this is usually the balance minus the fees, but it really depends between coins (reserve, burn, frozen part of the balance,...).
  // it is an heuristic in that this is not necessarily correct and it can be +-delta (so the info can exceed the spendable or leave some dust).
  // it's used as informative UI and also used for "dry run" approaches, but it shouldn't be used to determine the final SEND MAX amount.
  // it returns an amount in the account unit
  // if a transaction is provided, it can be used to precise the information
  // if it not provided, you can assume to take the worse case scenario (like sending all utxo to a legacy cost more fees to it have less spendable)
  estimateMaxSpendable({
    account: AccountLike,
    parentAccount?: ?Account,
    transaction?: ?T
  }): Promise<BigNumber>;

  // finalizing a transaction by signing it with the ledger device
  // This results of a "signed" event with a signedOperation
  // than can be locally saved and later broadcasted
  signOperation({
    account: Account,
    transaction: T,
    deviceId: DeviceId
  }): Observable<SignOperationEvent>;

  // broadcasting a signed transaction to network
  // returns an optimistic Operation that this transaction is likely to create in the future
  broadcast({
    account: Account,
    signedOperation: SignedOperation
  }): Promise<Operation>;
}
