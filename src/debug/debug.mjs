import { parseArgs } from "node:util";

const {
  values: { name, cool },
} = parseArgs({
  options: {
    name: {
      type: "string",
      short: "n",
    },
    cool: {
      type: "boolean",
      short: "c",
    },
  },
});

console.log(`${name} is ${cool ? "cool" : "not cool"}`);
