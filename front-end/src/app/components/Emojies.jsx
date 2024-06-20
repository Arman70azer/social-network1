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
      <div className={styles.bottomPage}>
        {/* Utilisez un formulaire pour éviter la soumission par défaut */}
        <form onSubmit={(e) => e.preventDefault()}>
          <button className={styles.margeEmojies} onClick={(e) => insertEmoji('U+1F600', e)}>😀</button>
          <button className={styles.margeEmojies} onClick={(e) => insertEmoji('U+1F601', e)}>😁</button>
          <button className={styles.margeEmojies} onClick={(e) => insertEmoji('U+1F606', e)}>😆</button>
          <button className={styles.margeEmojies} onClick={(e) => insertEmoji('U+1F605', e)}>😅</button>
          <button className={styles.margeEmojies} onClick={(e) => insertEmoji('U+1F923', e)}>🤣</button>
          <button className={styles.margeEmojies} onClick={(e) => insertEmoji('U+1F602', e)}>😂</button>
          <button className={styles.margeEmojies} onClick={(e) => insertEmoji('U+1F609', e)}>😉</button>
          <button className={styles.margeEmojies} onClick={(e) => insertEmoji('U+1F607', e)}>😇</button>
          <button className={styles.margeEmojies} onClick={(e) => insertEmoji('U+1F60D', e)}>😍</button>
          <button className={styles.margeEmojies} onClick={(e) => insertEmoji('U+1F929', e)}>🤩</button>
          <button className={styles.margeEmojies} onClick={(e) => insertEmoji('U+1F618', e)}>😘</button>
          <button className={styles.margeEmojies} onClick={(e) => insertEmoji('U+1F972', e)}>🥲</button>
          <button className={styles.margeEmojies} onClick={(e) => insertEmoji('U+1F61C', e)}>😜</button>
        </form>
      </div>
    </div>
  );
};

const listEmoji = {

}


export default EmojiPickerComponent;
