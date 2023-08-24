import { routes } from "../utils";
import { identify } from "./contacts/identify";

routes.use("/identify", identify);

export default routes;
