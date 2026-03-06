import { AppStore } from "./appStore";
import { ConferenceStore } from "./conferenceStore";

export class RootStore {
  appStore: AppStore;
  conferenceStore: ConferenceStore;

  constructor() {
    this.appStore = new AppStore();
    this.conferenceStore = new ConferenceStore();
  }
}
