import Cookies  from "js-cookie";
import sendAndReceiveData from "../lib/sendForm&ReceiveData";
//Renvoie à la page login si il n' y a pas de cookie
export default async function cookieExist(){
    const cookie = Cookies.get("token")
    if (cookie){
        const cookieForm = new FormData();
        cookieForm.append("token", cookie)
        cookieForm.append("nature", "cookie")
        cookieForm.append("origin", "AllPage")
        const response = await sendAndReceiveData("/api/home", cookieForm)
        if (response.Accept){
            return cookie
        }else{
            window.location.href = '/'
            return "cookie not valid"
        }
    }else{
        window.location.href = '/'
        return "cookie not exist"
    }
}