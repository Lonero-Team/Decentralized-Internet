import Ding from "../ding";
import TtnInput from "./ttnInput";

export default class InputManager {
  private ttn: TtnInput;

  constructor(dingjs: Ding) {
    this.ttn = new TtnInput(dingjs);
  }
}
