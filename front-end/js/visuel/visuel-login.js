
//S'occupe de vérifier le validiter syntaxique du formulaire et des animations de la page 
document.addEventListener("DOMContentLoaded", () => {
    validFormVerification()
});
  
//Affiche une error jusqu'alors caché pour avertir l'user d'une donnée mal renseigné en renseigné l'id de celui-ci
function ErrorNotifFor5secondes(id){
    const error = document.getElementById(id)
    error.style.display = 'inline';
    setTimeout(()=>{
      error.style.display="none";
    }, 5000)
}

// Fonction de gestion de la soumission du formulaire
function validFormVerification() {
    const form = document.getElementById("formLogin");
    const username = document.getElementById("username");
    const password = document.getElementById("password");
    const buttonForm= document.getElementById("button-submit")

    function handleSubmit(event){
        event.preventDefault(); // Empêcher la soumission du formulaire par défaut

        // Vérifier si l'e-mail est valide
        if (!username.value){
            ErrorNotifFor5secondes("usernameError");
        }else if (!password.value){
            ErrorNotifFor5secondes("passwordError")
        } else {
            form.submit();
        }
    }
    buttonForm.addEventListener('click', handleSubmit);
}