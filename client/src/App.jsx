import "./App.css";
import { useState, useEffect } from "react";
import loadingSpinner from "./assets/spinner.gif";
import lens from "./assets/lens.png";

function App() {
  // States
  const [prompt, updatePrompt] = useState(undefined);
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState(undefined);
  const [topics, setTopics] = useState(undefined);
  const [currentTopic, setCurrentTopic] = useState(undefined);
  const [currentQuestion, setCurrentQuestion] = useState(undefined);
  const [buttonsRendered, setButtonsRendered] = useState(false);
  const [userResponse, setUserResponse] = useState(undefined);
  const [goDeeper, setGoDeeper] = useState(undefined);
  const [retry, setRetry] = useState(undefined);
  const [nextTopic, setNextTopic] = useState(undefined);

  // Hook to check if the prompt is empty
  useEffect(() => {
    if (prompt != null && prompt.trim() === "") {
      setAnswer(undefined);
    }
  }, [prompt]);

  // Hook to check if the user response is empty
  useEffect(() => {
    if (userResponse != null && userResponse.trim() === "") {
      setUserResponse(undefined);
    }
  }, [userResponse]);

  // Hook to check if the topics are rendered
  useEffect(() => {
    if (topics && !buttonsRendered) {
      setButtonsRendered(true);
    }
  }, [topics, buttonsRendered]);

  // Function to clear Input field
  function clearInput() {
    const input = document.getElementById("response__input");
    if (!input) return;
    input.value = "";
  }

  // Function to reset button colors
  const resetButtons = () => {
    const buttonElements = document.getElementsByClassName("response-button");
    for (let i = 0; i < buttonElements.length; i++) {
      buttonElements[i].style.backgroundColor = "white";
    }
  };

  // Function to highlight the button by changing it's colour.
  const highlightButton = (index, color) => {
    const buttonElements = document.getElementsByClassName("response-button");
    for (let i = 0; i < buttonElements.length; i++) {
      if (buttonElements[i].textContent === index) {
        buttonElements[i].style.backgroundColor = color;
      }
    }
  };

  // Function to render buttons and user Response Input
  const renderButtonsAndInputs = (data) => {
    if (!data) {
      return null;
    }
    //
    const buttonElements = data.map((response, index) => (
      <button
        key={index}
        className="response-button"
        onClick={() => explainTopic({ target: { innerHTML: response } })}
      >
        {response}
      </button>
    ));

    const inputElement = (
      <div>
        <p>Submit your response to move to the next topic</p>
        <input
          type="text"
          className="spotlight__input"
          id="response__input"
          placeholder="Type your response here"
          onChange={(e) => setUserResponse(e.target.value)}
          disabled={loading}
        />
        <button onClick={evaluateResponse} disabled={loading}>
          Submit
        </button>
      </div>
    );

    return (
      <div>
        {currentQuestion && inputElement}
        <div>
          {goDeeper && (
            <button
              className="response-button"
              onClick={() =>
                getDeeperTopics({ target: { innerHTML: currentTopic } })
              }
            >
              Go Deeper
            </button>
          )}
          {nextTopic && (
            <button
              className="response-button"
              onClick={() => explainTopic({ target: { innerHTML: nextTopic } })}
            >
              Next Topic
            </button>
          )}
          {retry && (
            <button
              className="response-button"
              onClick={() =>
                explainTopic({ target: { innerHTML: currentTopic } })
              }
            >
              Retry
            </button>
          )}
        </div>
        <p>Choose your subtopic:</p>
        {buttonElements}
      </div>
    );
  };

  // Function to generate Subtopics
  const getTopics = async (event) => {
    if (event.key !== "Enter") {
      return;
    }

    try {
      setLoading(true);
      setGoDeeper(undefined);
      setRetry(undefined);
      setNextTopic(undefined);
      clearInput();
      setUserResponse(undefined);
      resetButtons();
      const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: prompt }),
      };

      const res = await fetch("/api/prompt/topics", requestOptions);
      if (!res.ok) {
        throw new Error("Something went wrong");
      }
      const { intro, data } = await res.json();

      let message =
        intro +
        " The following topics have been generated for you. Please choose a topic to dive deeper into. ";

      setAnswer(message);
      setTopics(data);
      setCurrentTopic(data[0]);
    } catch (err) {
      console.log(err);
      console.error(err, "err");
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch explaination for the topic selected.
  const explainTopic = async (event) => {
    const topic = event.target.innerHTML;
    setCurrentTopic(topic);
    setGoDeeper(undefined);
    setRetry(undefined);
    setNextTopic(undefined);
    clearInput();
    setUserResponse(undefined);
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic: topic, subject: prompt }),
    };

    try {
      setLoading(true);
      const res = await fetch("/api/prompt/explain/", requestOptions);
      if (!res.ok) {
        throw new Error("Something went wrong");
      }

      const { data, question } = await res.json();
      setAnswer(data + "\n\n" + question);
      setCurrentQuestion(question);
    } catch (err) {
      console.log(err);
      console.error(err, "err");
    } finally {
      setLoading(false);
    }
  };

  // Function to evaluate user responses
  const evaluateResponse = async (event) => {
    try {
      clearInput();
      setGoDeeper(undefined);
      setRetry(undefined);
      setLoading(true);
      const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: currentTopic,
          question: currentQuestion,
          user_response: userResponse,
        }),
      };
      const res = await fetch("/api/prompt/evaluate", requestOptions);
      if (!res.ok) {
        throw new Error("Something went wrong");
      }
      let { data, passed } = await res.json();
      if (passed) {
        data +=
          `You're Correct! You can now move to the next topic. Please choose the next topic or choose to dive deeper into ${currentTopic}`;
        let nextIndex = topics.indexOf(currentTopic) + 1;
        setNextTopic(topics[nextIndex]);
        setGoDeeper(true);
        highlightButton(currentTopic, "green");
      } else {
        data += "Please try again by clicking on the red button";
        setRetry(true);
        highlightButton(currentTopic, "red");
      }
      setAnswer(data);
      setUserResponse("");
    } catch (err) {
      console.log(err);
      console.error(err, "err");
    } finally {
      setLoading(false);
    }
  };

  // Function to generate more subtopics
  const getDeeperTopics = async (event) => {
    const prompt = event.target.innerHTML;
    setGoDeeper(undefined);
    setRetry(undefined);
    setNextTopic(undefined);
    clearInput();
    setUserResponse(undefined);
    resetButtons();
    try {
      setLoading(true);
      const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: prompt }),
      };

      const res = await fetch("/api/prompt/topics", requestOptions);
      if (!res.ok) {
        throw new Error("Something went wrong");
      }
      const { data } = await res.json();
      let message =
        `The following topics have been generated for ${currentTopic} . Please choose a subtopic to move forward`;
      let response = data.join("\n");
      setAnswer(message);
      setTopics(data);
    } catch (err) {
      console.log(err);
      console.error(err, "err");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <div className="app-container">
        <h1>Convai Tutor</h1>
        <div className="spotlight__wrapper">
          <div className="spotlight__answer">{answer && <p>{answer}</p>}</div>
          <input
            type="text"
            className="spotlight__input"
            placeholder="What are we learning today..."
            disabled={loading}
            style={{
              backgroundImage: loading
                ? `url(${loadingSpinner})`
                : `url(${lens})`,
            }}
            onChange={(e) => updatePrompt(e.target.value)}
            onKeyDown={(e) => getTopics(e)}
          />
        </div>
        <div className="response-buttons">{renderButtonsAndInputs(topics)}</div>
      </div>
    </div>
  );
}

export default App;
