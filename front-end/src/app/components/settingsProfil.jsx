import { useState } from "react";
import styles from "../styles/profil.module.css"
function SettingsProfil({ onClose, user }){
    const [inputNickname, setInputNick] = useState(false)
    const [inputPassword, setPassword] = useState(false)
    const [inputDescr, setDescription] = useState(false)
    const [privateMode, setPrivateMode] = useState(false)
    const [change, setChange] = useState("")
    const handleNickname = ()=>{
        setInputNick(!inputNickname)
    }
    const handlePasword = ()=>{
        setPassword(!inputPassword)
    }
    const handleDescription=()=>{
        setDescription(!inputDescr)
    }
    const handlePrivateMode=()=>{
        setPrivateMode(!privateMode)
    }

    const handleChange=()=>{

    }

    return (
        <div className={styles.overlay}>
            <div className={styles.settingsContainer}>
                <div className={styles.center}>
                    <button className={styles.closeButton} onClick={onClose}>X</button>
                    <button className={styles.requestButton} onClick={handleNickname}>
                        <div className={styles.requestText}>
                            Do you want change your nickname?
                        </div>
                    </button>
                    {inputNickname &&(
                        <input type="text" id="change" placeholder={user.Nickname} className={styles.changeParam}/>
                    )}
                    <button className={styles.requestButton} onClick={handlePasword}>
                        <div className={styles.requestText}>
                            Do you want change your password?
                        </div>
                    </button>
                    {inputPassword &&(
                        <input type="text" id="change" placeholder="password" className={styles.changeParam}/>
                    )}
                    <button className={styles.requestButton} onClick={handleDescription}>
                        <div className={styles.requestText}>
                            Do you want change your description?
                        </div>
                    </button>
                    {inputDescr &&(
                        <input type="text" id="change" placeholder={user.AboutMe} className={styles.changeParam}/>
                    )}
                    <button className={styles.requestButton} onClick={handlePrivateMode}>
                        <div className={styles.requestText}>
                            Switch of mode (actually public)
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default SettingsProfil