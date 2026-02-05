import { AppStore } from "./appStore";

export class RootStore {
  appStore: AppStore;

  constructor() {
    this.appStore = new AppStore();
  }
}
