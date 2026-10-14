import OpenAI from "openai";
import dotenv from "dotenv";
import { isEmpty } from "../utils/isEmpty.js";

dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (isEmpty(OPENAI_API_KEY)) {
  throw new Error("OPENAI_API_KEY environment variable is not set");
}

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY, // Ensure the API key is stored securely
});

const ScoreMultiChoice = (answer) => {
  console.log("--- Scoring MCQ ---");
  const { multiChoices = [], multiOptions = [] } = answer;
  console.log("Received multiChoices:", multiChoices);
  // console.log("Received multiOptions:", JSON.stringify(multiOptions));

  if (isEmpty(multiOptions)) {
    console.log("Result: 0 (No options provided)");
    return 0;
  }

  const correctIndices = new Set(
    multiOptions.reduce((acc, option, idx) => {
      if (option.isCorrect) acc.push(idx);
      return acc;
    }, [])
  );
  console.log("Correct indices:", ...correctIndices);

  const userChoices = new Set(multiChoices);
  console.log("User choices:", ...userChoices);

  if (userChoices.size !== correctIndices.size) {
    console.log("Result: 0 (Incorrect number of answers selected)");
    return 0;
  }

  for (const choice of userChoices) {
    if (!correctIndices.has(choice)) {
      console.log(`Result: 0 (Incorrect choice: ${choice})`);
      return 0;
    }
  }

  console.log("Result: 10 (Perfect match)");
  return 10;
};

const ScoreTrueFalse = (answer) => {
  const { trueFalseSubmit, correctAnswer } = answer;
  if (isEmpty(trueFalseSubmit) || isEmpty(correctAnswer)) {
    return 0;
  }
  let score = 0;
  // Normalize both answers to be case-insensitive and trim whitespace
  const normalizedUserAnswer = String(trueFalseSubmit).trim().toLowerCase();
  const normalizedCorrectAnswer = String(correctAnswer).trim().toLowerCase();

  if (normalizedUserAnswer === normalizedCorrectAnswer) {
    score = 10;
  } else {
    score = 0;
  }
  return parseFloat(score);
};

const ScoreSingleWord = (answer) => {
  console.log("--- Scoring Single Word ---");
  const { correctAnswer, singleWords } = answer;
  console.log("Received correctAnswers:", correctAnswer);
  console.log("Received singleWords from user:", singleWords);

  if (isEmpty(correctAnswer) || !Array.isArray(correctAnswer) || !Array.isArray(singleWords)) {
    console.log("Result: 0 (Invalid input data)");
    return 0;
  }

  // Aggressive normalization: trim, lowercase, and remove all non-alphanumeric characters.
  const normalize = (str) => String(str).trim().toLowerCase().replace(/[^a-z0-9]/gi, '');

  const normalizedCorrect = new Set(correctAnswer.map(normalize).filter(s => s.length > 0));
  console.log("Normalized correct answers:", ...normalizedCorrect);

  const normalizedUser = new Set(singleWords.map(normalize).filter(s => s.length > 0));
  console.log("Normalized user answers:", ...normalizedUser);

  if (normalizedCorrect.size === 0) {
    const score = normalizedUser.size === 0 ? 10 : 0;
    console.log(`Result: ${score} (No correct answer defined)`);
    return score;
  }

  if (normalizedUser.size !== normalizedCorrect.size) {
    console.log("Result: 0 (Incorrect number of words submitted)");
    return 0;
  }

  for (const word of normalizedUser) {
    if (!normalizedCorrect.has(word)) {
      console.log(`Result: 0 (Incorrect word: '${word}')`);
      return 0;
    }
  }

  console.log("Result: 10 (Perfect match)");
  return 10;
};

const ScoreEssay = async (answer) => {
  const { correctAnswer, submitEssay } = answer;
  if(isEmpty(submitEssay) || isEmpty(correctAnswer)) {
    return { score: 0, grammar: 0, concept: 0, completeness: 0 };
  }
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      // messages: [
      //   {
      //     role: "user",
      //     content: `Evaluate the similarity between these two answers:
      //       Correct Answer: ${correctAnswer}
      //       Student Answer: ${submitEssay}

      //       Provide a score (0-10) based on correctness. Give me only the score as output.`,
      //   },
      // ],
      messages: [
        {
          role: "user",
          content: `
            Evaluate the student's answer by comparing it to the correct answer and scoring it based on the following criteria:

            1. **Relevance to Correct Answer:** If the student's response is unrelated to the correct answer, assign 0 to all categories. If related, proceed with evaluation.

            2. **Grammar (0-10):** Assess sentence structure, spelling, and punctuation.

            3. **Concept Understanding (0-10):** Rate how well the student demonstrates knowledge of the topic.

            4. **Completeness (0-10):** Evaluate how thoroughly the student answers the question.

            Provide only three numerical scores separated by commas, in the format: "8,7,9".

            **Correct Answer:** ${correctAnswer}  
            **Student Answer:** ${submitEssay}`,
        },
      ],
      max_tokens: 20,
    });

    const aiText = response.choices[0].message.content.trim();
    const scores = aiText.split(",").map((num) => parseFloat(num));

    const [grammar, concept, completeness] = scores.map((score) => 
      isNaN(score) ? 0: score
    );

    const score = ((grammar * 0.1 + concept * 0.6 + completeness * 0.3)).toFixed(2);
    return {score, grammar, concept, completeness};
    // let score = parseFloat(response.choices[0].message.content.trim());
    // if (isNaN(score) || !score || isEmpty(score)) score = 0;
    // return score;
  } catch (error) {
    console.error("Error scoring essay:", error);
    return {score: 0, grammar: 0, concept: 0, completeness: 0};
  }
};

export { ScoreMultiChoice, ScoreTrueFalse, ScoreSingleWord, ScoreEssay };