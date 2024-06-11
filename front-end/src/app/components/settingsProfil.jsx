import { useState } from "react";
import styles from "../styles/profil.module.css"
import sendAndReceiveData from "../lib/sendForm&ReceiveData";
import Cookies from "js-cookie"
function SettingsProfil({ onClose, user, setUser }){
    const [message, setMessage] = useState({
        exist: false,
        message: ""
    })
    const [inputNickname, setInputNick] = useState(false)
    const [inputPassword, setPassword] = useState(false)
    const [inputDescr, setDescription] = useState(false)
    const [change, setChange] = useState("")
    const handleNickname = ()=>{
        setInputNick(!inputNickname)
        setPassword(false)
        setDescription(false)
        setChange("")
    }
    const handlePasword = ()=>{
        setPassword(!inputPassword)
        setInputNick(false)
        setDescription(false)
        setChange("")
    }
    const handleDescription=()=>{
        setDescription(!inputDescr)
        setPassword(false)
        setInputNick(false)
        setChange("")
    }
    const handlePrivateMode= async()=>{
        console.log("gg")
        const formData = new FormData
        formData.append("token", Cookies.get("token"))
        formData.append("nature", "SwitchMode")
        const response = await sendAndReceiveData("/api/profil", formData)
        setNewChange(response)
        setChange("")
    }

    const handleChange = (event) => {
        const {value } = event.target;
        setChange(value)
    }

    const handleKeyPress = async (e) => {
        if (e.key === 'Enter' && change){
            const formData = new FormData
            formData.append("token", Cookies.get("token"))
            let nature = ""
            if (inputNickname){
                nature = "Nickname"
            }else if (inputPassword){
                nature = "Password"
            }else if(inputDescr){
                nature = "AboutMe"
            }
            formData.append("nature", nature)
            formData.append("change", change)
            const response = await sendAndReceiveData("/api/profil", formData)
            setNewChange(response)
            setChange("")
        }
    };

    const setNewChange = (response)=>{
        if (response.Accept){
            switch(response.Nature){
                case("Nickname"):
                    setUser(response.Nature, response.ObjectOfRequest)
                    updateURLParameter("user", response.ObjectOfRequest)
                    onClose()
                    break
                case("Password"):
                    updateEffectuate(response)
                    break
                case ("SwitchMode"):
                    console.log("ghjkljhgfghjklkjg")
                    updateEffectuate(response)
                    break
                case ("AboutMe"):
                    setUser(response.Nature, response.ObjectOfRequest)
                    updateEffectuate({ObjectOfRequest:"Description has been change!"})
                    break
                default:
                    console.log("error setNewChange")
                    break
            }
        }else{
            updateEffectuate(response)
        }
    }
    function updateEffectuate(response){
        setMessage({
            exist:true,
            message: response.ObjectOfRequest
        })
        setTimeout(()=>{
            setMessage({
                exist:false,
                message: ""
            })
        }, 10000)
    }

    function updateURLParameter(param, value) {
        const url = new URL(window.location); // Créer une nouvelle instance de l'URL
        url.searchParams.set(param, value); // Mettre à jour ou ajouter le paramètre de requête
        window.history.pushState({}, '', url); // Mettre à jour l'URL sans recharger la page
    }

    return (
        <div className={styles.overlay}>
            <div className={styles.settingsContainer}>
                <div className={styles.center}>
                    <button className={styles.closeButton} onClick={onClose}>X</button>
                    {message.exist && (<div className={styles.information}> {message.message} </div>)}
                    <button className={styles.requestButton} onClick={handleNickname}>
                        <div className={styles.requestText}>
                            Do you want change your nickname?
                        </div>
                    </button>
                    {inputNickname &&(
                        <input type="text" id="change" placeholder={user.Nickname} value={change} className={styles.changeParam} onChange={handleChange} onKeyDown={handleKeyPress}/>
                    )}
                    <button className={styles.requestButton} onClick={handlePasword}>
                        <div className={styles.requestText}>
                            Do you want change your password?
                        </div>
                    </button>
                    {inputPassword &&(
                        <input type="password" id="change" placeholder="password" value={change} className={styles.changeParam} onChange={handleChange} onKeyDown={handleKeyPress}/>
                    )}
                    <button className={styles.requestButton} onClick={handleDescription}>
                        <div className={styles.requestText}>
                            Do you want change your description?
                        </div>
                    </button>
                    {inputDescr &&(
                        <input type="text" id="change" placeholder={user.AboutMe} value={change} className={styles.changeParam} onChange={handleChange} onKeyDown={handleKeyPress}/>
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