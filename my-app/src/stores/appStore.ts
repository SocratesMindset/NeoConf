import { makeAutoObservable } from "mobx";

export class AppStore {
  appName = "NeoConf";
  counter = 0;

  constructor() {
    makeAutoObservable(this);
  }

  setAppName(name: string) {
    this.appName = name;
  }

  increment() {
    this.counter += 1;
  }

  resetCounter() {
    this.counter = 0;
  }
}
