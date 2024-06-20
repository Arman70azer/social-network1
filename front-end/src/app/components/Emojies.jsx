import styles from "../styles/emojies.module.css"
const EmojiPickerComponent = ({text, setText}) => {

  // Fonction pour insérer un émoji à partir du code Unicode
  const insertEmoji = (unicode, e) => {
    e.preventDefault(); // Empêcher l'événement de soumission par défaut
    const emoji = String.fromCodePoint(parseInt(unicode.replace('U+', ''), 16));
    const cursorPosition = text.length; // Position du curseur à la fin du texte
    const newText = text.slice(0, cursorPosition) + emoji + text.slice(cursorPosition);
    setText(newText);
  };

  return (
    <div>
      <form onSubmit={(e) => e.preventDefault()}>
        {/* Utilisez un formulaire pour éviter la soumission par défaut */}
        <button className={styles.margeEmojies} onClick={(e) => insertEmoji('U+1F601', e)}>😄</button>
        <button className={styles.margeEmojies} onClick={(e) => insertEmoji('U+1F601', e)}>😄</button>
        <button className={styles.margeEmojies} onClick={(e) => insertEmoji('U+1F601', e)}>😄</button>
        <button className={styles.margeEmojies} onClick={(e) => insertEmoji('U+1F601', e)}>😄</button>
        <button className={styles.margeEmojies} onClick={(e) => insertEmoji('U+1F601', e)}>😄</button>
        <button className={styles.margeEmojies} onClick={(e) => insertEmoji('U+1F601', e)}>😄</button>
        <button className={styles.margeEmojies} onClick={(e) => insertEmoji('U+1F601', e)}>😄</button>
        <button className={styles.margeEmojies} onClick={(e) => insertEmoji('U+1F601', e)}>😄</button>
        
      </form>
    </div>
  );
};

const listEmoji = {

}


export default EmojiPickerComponent;
