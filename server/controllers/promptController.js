const OpenAI = require('openai-api');
const dotenv = require('dotenv');
dotenv.config()

const openai = new OpenAI(process.env.OPENAI_KEY);

async function generateText(prompt) {
    const response = await openai.complete({
        engine: 'text-davinci-003',
        prompt: prompt,
        maxTokens: 150,
        n: 1,
        stop: null,
        temperature: 0.5
    });
    return response.data.choices[0].text;
}

const getSubtopics = async (req, res) => {
    try {
        let subject = req.body.subject;
        const prompt_subtopics = `Give a list of subtopics for learning ${subject}.`
        const prompt_intro = `Give a very short inroduction to ${subject}.`
        let response_subtopics = await generateText(prompt_subtopics);
        const response_intro = await generateText(prompt_intro);
        const subtopics = response_subtopics.trim().split('\n').map(line => line.split('. ')[1]);
        console.log(subtopics);
        res.status(201).json({
            data: subtopics,
            intro: response_intro,
            status: "Success"
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Internal Server Error",
            status: "Error",
            error: err,
        });
    }
};

const explainTopic = async (req, res) => {
    try {
        const topic = req.body.topic;
        const prompt = `Give a brief description on ${topic} for a newbie.`
        let response = await generateText(prompt);
        const second_prompt = `Using this prompt ${prompt}, ask a simple question on this topic understand if the student understood about ${topic}.`
        let second_response = await generateText(second_prompt);
        res.status(201).json({
            data: response,
            question: second_response,
            status: "Success"
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Internal Server Error",
            status: "Error",
            error: err,
        });
    }
};

const evaluateResponse = async (req, res) => {
    try {
        const user_response = req.body.user_response;
        const topic = req.body.topic;
        const question = req.body.question;
        const prompt = `Given ML training info and Tutor’s question: ${question} and Student’s response: ${user_response}, does it show sufficient understanding of the ${topic}?. Answer it using "You" instead of "They"`
        let response = await generateText(prompt);
        if (response.includes('Yes')) {
            res.status(201).json({
                data: response,
                passed: true,
                status: "Success"
            });
        } else {
            res.status(201).json({
                data: response,
                passed: false,
                status: "Success"
            });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Internal Server Error",
            status: "Error",
            error: err,
        });
    }
};



module.exports = { generateText, getSubtopics, evaluateResponse, explainTopic };