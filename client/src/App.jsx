import "./App.css";
import { useState, useEffect } from "react";
import loadingSpinner from "./assets/spinner.gif";
import lens from "./assets/lens.png";

function App() {
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

  useEffect(() => {
    if (prompt != null && prompt.trim() === "") {
      setAnswer(undefined);
    }
  }, [prompt]);

  useEffect(() => {
    if (userResponse != null && userResponse.trim() === "") {
      setUserResponse(undefined);
    }
  }, [userResponse]);

  useEffect(() => {
    if (topics && !buttonsRendered) {
      setButtonsRendered(true);
    }
  }, [topics, buttonsRendered]);

  function clearInput() {
    const input = document.getElementById("response__input");
    if (!input) return;
    input.value = "";
  }

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
      const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: prompt }),
      };

      const res = await fetch("/api/prompt/topics", requestOptions);
      if (!res.ok) {
        throw new Error("Something went wrong");
      }
      const { intro ,data } = await res.json();

      let message = intro + " The following topics have been generated for you. Please choose a topic to dive deeper into. ";

      // let response = data.join("\n");
      setAnswer(message);
      setTopics(data);
      // updatePrompt("");
    } catch (err) {
      console.log(err);
      console.error(err, "err");
    } finally {
      setLoading(false);
    }
  };

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
      body: JSON.stringify({ topic: topic }),
    };

    try {
      setLoading(true);
      const res = await fetch("/api/prompt/explain/", requestOptions);
      //console.log(res);
      if (!res.ok) {
        throw new Error("Something went wrong");
      }

      const { data, question } = await res.json();
      setAnswer(data + " " + question);
      setCurrentQuestion(question);
      // updatePrompt("");
    } catch (err) {
      console.log(err);
      console.error(err, "err");
    } finally {
      setLoading(false);
    }
  };

  const highlightButton = (index, color) => {
    const buttonElements = document.getElementsByClassName("response-button");
    for (let i = 0; i < buttonElements.length; i++) {
      if (buttonElements[i].textContent === index) {
        buttonElements[i].style.backgroundColor = color;
      }
    }
  };

  const resetButtons = () => {
    const buttonElements = document.getElementsByClassName("response-button");
    for (let i = 0; i < buttonElements.length; i++) {
      buttonElements[i].style.backgroundColor = 'white';
    }
  };

  const evaluateResponse = async (event) => {
    try {
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
      console.log(data);
      // data = data.split(".").slice(1).join(".").trim();
      if (passed) {
        data +=
          "You're Correct! You can now move to the next topic. Please choose the next topic or choose to dive deeper into the topic";
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

  const getDeeperTopics = async (event) => {
    const prompt = event.target.innerHTML;
    resetButtons();
    clearInput();
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
      // const data = ["Apple", "Banana", "Mango", "Organg", "Pineapple"];
      let message = "These are the subtopics we'll be going forward with:\n";
      let response = data.join("\n");
      setAnswer(message + response);
      setTopics(data);
      // updatePrompt("");
    } catch (err) {
      console.log(err);
      console.error(err, "err");
    } finally {
      setLoading(false);
    }
  };

  const renderButtonsAndInputs = (data) => {
    if (!data) {
      return null;
    }

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
        <p>Choose your subtopic:</p>
        {buttonElements}
        {currentQuestion && inputElement}
      </div>
    );
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
      </div>
    </div>
  );
}

export default App;
