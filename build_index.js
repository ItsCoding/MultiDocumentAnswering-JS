import openai from "openai";

const fs = require("fs");

const open_file = (filepath) => {
  let file = fs.readFileSync(filepath, "utf8");
  return file;
};

openai.api_key = open_file("openaiapikey.txt");

const gpt3_embedding = (content, engine = "text-similarity-ada-001") => {
  let response = openai.Embedding.create(content, engine);
  let vector = response["data"][0]["embedding"]; // this is a normal list
  return vector;
};

let alltext = open_file("input.txt");
let chunks = textwrap.wrap(alltext, 4000);
let result = [];
for (var i = 0; i < chunks.length; i++) {
  let embedding = gpt3_embedding(chunks[i]);
  let info = { content: chunks[i], vector: embedding };
  console.log(info, "\n\n\n");
  result.push(info);
}
let outfile = fs.openSync("index.json", "w");
fs.writeFileSync(outfile, JSON.stringify(result, null, 2));
