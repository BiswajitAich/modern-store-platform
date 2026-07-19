import { hash } from "bcrypt";

async function main() {
  console.log(await hash("(@geniousBiswajit)", 10));
}

main();

