//import { render } from "dsl/jsx-runtime";
import page1 from "./page1";

const story = page1();
//const executed = render(story);

// For demo purposes, print the rendered AST:
if (
  import.meta.url === `file://${process.argv[1]}` ||
  process.env["VITE_INLINE_RUN"]
) {
  //console.log(JSON.stringify(executed, null, 2));
}
