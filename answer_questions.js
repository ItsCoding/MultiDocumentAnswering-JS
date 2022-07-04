import { Configuration, OpenAIApi } from "openai"
import * as data from "./index.json"
import * as math from "mathjs"

const configuration = new Configuration({
    apiKey: open_file("openaiapikey.txt"),
  });
  

const openai = new OpenAIApi(configuration);



function open_file(filepath) {
    let file = fs.readFileSync(filepath, "utf8");
    return file;
}


function gpt3_embedding(content, engine='text-similarity-ada-001') {
    // Probabbly not needed...
    // content = content.encode('ASCII','ignore').decode();

    let response = openai.Embedding.create(content,engine);
    let vector = response['data'][0]['embedding'];  // this is a normal list
    return vector;
}


function similarity(v1, v2) {  // return dot product of two vectors
    // return np.dot(v1, v2);
    return math.dot(v1, v2);
    // console.error("No numpy available #fixThis")
}


function search_index(text, data, count=20) {
    let vector = gpt3_embedding(text);
    let scores = [];
    for (i of data) {
        let score = similarity(vector, i['vector']);
        //console.log(score);
        scores.push({content: i['content'], score: score});
    }
    //ToDo: Sorted is not available in JS
    let ordered = sorted(scores, function(d) { return d['score']; }, true);
    return ordered.slice(0, count);
}


function gpt3_completion(prompt, engine='text-davinci-002', temp=0.6, top_p=1.0, tokens=2000, freq_pen=0.25, pres_pen=0.0, stop=['<<END>>']) {
    // let max_retry = 5;
    // let retry = 0;
    // Probabbly not needed...
    // let prompt = prompt.encode(encoding='ASCII',errors='ignore').decode();
        try {
            let response = openai.createCompletion({
                engine:engine,
                prompt:prompt,
                temperature:temp,
                max_tokens:tokens,
                top_p:top_p,
                frequency_penalty:freq_pen,
                presence_penalty:pres_pen,
                stop:stop});
            let text = response['choices'][0]['text'].trim();

            text = text.replaceAll('\s+', ' ');
            let filename = '%s_gpt3.txt' % time();
            fs.writeFileSync(`gpt3_logs/${Date.now()}_gpt3.txt` % filename, 'PROMPT:\n\n' + prompt + '\n\n==========\n\nRESPONSE:\n\n' + text);
            return text;
        } catch (oops) {
            // retry += 1;
           
            return "GPT3 error: %s" % oops;
            
            console.log('Error communicating with OpenAI:', oops);
        }
}


const main = () => {
    let query = "Who are you" //Insert your question here
    let result = search_index(query, data);
    let answers = [];
    result.forEach(item => {
        let prompt = open_file('prompt_answer.txt').replace('<<PASSAGE>>',item.content).replace("<<QUERY>>", query)
        let answer = gpt3_completion(prompt);
        console.log(query)
        console.log(answer);
        answers.push({prompt: prompt, answer: answer});
    });

    let all_answers = answers.join('\n\n');
    //Split text in 10000 characters chunks
    let chunks = all_answers.match(/.{1,10000}/g);
    let final = [];
    chunks.forEach(chunk => {
        let prompt = open_file('prompt_summary.txt').replace('<<SUMMARY>>',chunk)
        let summary = gpt3_completion(prompt);
        final.push(summary);
    })
    console.log(final.join('\n\n'));

}

main();