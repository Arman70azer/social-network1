import Cookies  from "js-cookie";
//Renvoie à la page login si il n' y a pas de cookie
export default function cookieExist(){
    const cookie = Cookies.get("user")
    const cookie2 = Cookies.get("token")
    if (cookie && cookie2){
        return cookie
    }else{
        window.location.href = '/'
    }
}