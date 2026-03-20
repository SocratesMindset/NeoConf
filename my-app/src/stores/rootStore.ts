import { AppStore } from "./appStore";
import { AuthStore } from "./authStore";
import { ConferenceStore } from "./conferenceStore";

export class RootStore {
  appStore: AppStore;
  authStore: AuthStore;
  conferenceStore: ConferenceStore;

  constructor() {
    this.appStore = new AppStore();
    this.authStore = new AuthStore();
    this.conferenceStore = new ConferenceStore();
  }
}
