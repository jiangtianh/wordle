import { useEffect, useState, useRef } from 'react';
import words from "an-array-of-english-words";
import './App.css';
import Keyboard from './Keyboard';

function App() {

  const getRandomWord = async () => {
    try {
      const response = await fetch('/wordle-La.txt');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const fileContent = await response.text();
      const words = fileContent.split('\n').map(word => word.trim()).filter(word => word.length > 0);
      const randomWord = words[Math.floor(Math.random() * words.length)];
      console.log(randomWord);
      return randomWord.toUpperCase();
    } catch (error) {
      console.error('Error fetching the word list:', error);
      return '';
    }
  };

  const restartGame = async () => {
    setCurrentGuess('');
    setGuesses([]);
    const newWord = await getRandomWord();
    setTargetWord(newWord); // Generate a new target word
    setGameStatus('playing');
    setShowNotification(false);
  };


  const [currentGuess, setCurrentGuess] = useState('');
  const currentGuessRef = useRef(currentGuess); // Ref to store the latest value of currentGuess

  const [guesses, setGuesses] = useState<string[]>([]); // Store all guesses
  const guessesRef = useRef(guesses); // Ref to store the latest value of guesses
  const [targetWord, setTargetWord] = useState('');
  const targetWordRef = useRef(targetWord);
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const gameStatusRef = useRef(gameStatus);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    const fetchWord = async () => {
      const word = await getRandomWord();
      setTargetWord(word);
    };
    fetchWord();
  }, []);


  // Update the ref whenever currentGuess changes
  useEffect(() => {
    currentGuessRef.current = currentGuess;
  }, [currentGuess]);

  useEffect(() => {
    guessesRef.current = guesses;
  }, [guesses]);

  // Update the gameStatusRef whenever gameStatus changes
  useEffect(() => {
    gameStatusRef.current = gameStatus;
  }, [gameStatus]);
  useEffect(() => {
    targetWordRef.current = targetWord;
  }, [targetWord]);


  const checkWordValidity = (word: string) => {
    return words.includes(word.toLowerCase());
  }


  const handleKeyClick = (key: string) => {
    if (gameStatusRef.current !== 'playing') {
      return; // Don't handle key clicks if the game is not in progress
    }

    if (key === 'BACKSPACE') {
      setCurrentGuess((prev) => prev.slice(0, -1)); // Remove the last character

    } else if (key === 'ENTER') {
      if (currentGuessRef.current.length === 5) {
        const isValidWord = checkWordValidity(currentGuessRef.current);

        if (isValidWord) {
          const submittedGuess = currentGuessRef.current;

          if (submittedGuess === targetWordRef.current) {
            setGameStatus('won');
            gameStatusRef.current = 'won';
          } else if (guessesRef.current.length + 1 >= 6) {
            setGameStatus('lost');
            gameStatusRef.current = 'lost';
          }

          // Add the submitted guess to the guesses list
          setGuesses((prev) => {
            const newGuesses = [...prev, submittedGuess];
            guessesRef.current = newGuesses; // Update the ref synchronously
            return newGuesses;
          });

          setCurrentGuess('');
          currentGuessRef.current = ''; // Update the ref synchronouslys
        } else {
          setShowNotification(true);
        }

      } else {
        console.log('Current guess is not 5 letters long');
      }
    } else if (/^[A-Z]$/.test(key)) {
      setCurrentGuess((prev) => {
        if (prev.length === 5) {
          return prev; // Don't add more than 5 letters
        }
        return prev + key;
      });
    }
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      let key = event.key.toUpperCase();
      if (key === 'BACKSPACE' || key === 'ENTER' || /^[A-Z]$/.test(key)) {
        handleKeyClick(key);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (showNotification) {
      const timer = setTimeout(() => {
        setShowNotification(false);
      }, 3000); // Hide after 3 seconds
      return () => clearTimeout(timer);
    }
  }, [showNotification]);

  // Function to determine the status of each letter in a guess
  const getLetterStatus = (guess: string, index: number) => {
    if (guess[index] === targetWordRef.current[index]) {
      return 'correct'; // Correct letter in the correct position
    } else if (targetWord.includes(guess[index])) {
      return 'present'; // Letter is present but in the wrong position
    } else {
      return 'absent'; // Letter is not in the word at all
    }
  };

  return (
    <div className="App">
      <h1>Wordle</h1>
      {gameStatus === 'won' && (
        <div className="message won">
          <div className="message-content">
            You won! 🎉
          </div>
          <div><button onClick={restartGame}>Restart</button></div>
        </div>
      )}
      {gameStatus === 'lost' && (
        <div className="message lost">
          <div className="message-content">
            You lost! The word was: {targetWordRef.current}
          </div>
          <div><button onClick={restartGame}>Restart</button></div>
        </div>
      )}
      {showNotification && (
        <div className="notification">Not a valid word!</div>
      )}
      <div className="grid">
        {[...Array(6)].map((_, rowIndex) => {
          const guess = guesses[rowIndex] || '';
          const isCurrentRow = rowIndex === guesses.length;

          return (
            <div key={rowIndex} className="row">
              {[...Array(5)].map((_, cellIndex) => {
                const letter = guess[cellIndex] || (isCurrentRow && currentGuess[cellIndex]) || '';
                const status = guess ? getLetterStatus(guess, cellIndex) : '';

                return (
                  <div
                    key={cellIndex}
                    className={`cell ${status}`}
                  >
                    {letter}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
      <Keyboard
        onKeyClick={handleKeyClick}
        guesses={guesses}
        targetWord={targetWordRef.current}
        disabled={gameStatus !== 'playing'}
      />
    </div>
  );
}

export default App;