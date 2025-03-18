import "./Keyboard.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBackspace, faLevelDownAlt } from '@fortawesome/free-solid-svg-icons';

const Keyboard = ({ onKeyClick, guesses, targetWord }: any) => {
    const keys1 = ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'];
    const keys2 = ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'];
    const keys3 = ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE'];

    const getKeyStatus = (key: string) => {
        if (!guesses.length) return ""

        const isKeyPressed = guesses.some((guess: string) => guess.includes(key));

        if (!isKeyPressed) return "";

        if (targetWord.includes(key)) {
            const isCorrect = guesses.some((guess: string) => {
                for (let i = 0; i < guess.length; i++) {
                    if (guess[i] === key && targetWord[i] === key) {
                        return true;
                    }
                }
                return false;
            });

            return isCorrect ? "correct" : "present";
        } else {
            return 'absent';
        }
    };


    return (
        <div className="keyboard">
            <div className="row">
                {keys1.map((key) => (
                    <button key={key} onClick={() => onKeyClick(key)} className={`key ${getKeyStatus(key)}`}>{key}</button>
                ))}
            </div>
            <div className="row">
                {keys2.map((key) => (
                    <button key={key} onClick={() => onKeyClick(key)} className={`key ${getKeyStatus(key)}`}>{key}</button>
                ))}
            </div>
            <div className="row">
                {keys3.map((key) => (
                    <button
                        key={key}
                        onClick={() => onKeyClick(key)}
                        className={`key ${key === 'ENTER' || key === 'BACKSPACE' ? 'large' : ''} ${getKeyStatus(key)}`}
                    >
                        {key === 'BACKSPACE' ? (
                            <FontAwesomeIcon icon={faBackspace} />
                        ) : key === 'ENTER' ? (
                            <FontAwesomeIcon icon={faLevelDownAlt} rotation={90} />
                        ) : (
                            key
                        )}
                    </button>

                ))}
            </div>
        </div>
    );
}
export default Keyboard;