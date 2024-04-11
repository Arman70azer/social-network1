//S'occupe de vérifier le validiter syntaxique du formulaire et des animations de la page 
document.addEventListener("DOMContentLoaded", () => {
  effectvisuelAvatarForm()
  validFormVerification()
});


function effectvisuelAvatarForm(){
  let input = document.getElementById("avatar");
  let imageName = document.getElementById("imageName");

  input.addEventListener("change", () => {
    let inputImage = document.querySelector("input[type=file]").files[0];

    imageName.innerText = inputImage.name;
  });
}

//Empêche l'envoie si des données sont mal renseignées
function validFormVerification() {
  const buttonForm = document.getElementById('button-submit');
  const emailInput = document.getElementById('email');
  const form = document.getElementById('formRegister');
  const passwordInput = document.getElementById('password');
  const firstName = document.getElementById("input-first-name");

  // Fonction de validation d'e-mail
  function validateEmail(email) {
      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return regex.test(email);
  }

  // Fonction de validation du mot de pass en fonction du nombre de caractère
  function validatePassword(password) {
    const regex = /./g; // Recherche de chaque caractère individuellement
    const count = (password.match(regex) || []).length;
    console.log(count)
    return count
  }

  // Fonction de gestion de la soumission du formulaire
  function handleSubmit(event) {
      event.preventDefault(); // Empêcher la soumission du formulaire par défaut

      // Vérifier si l'e-mail est valide
      if (!validateEmail(emailInput.value)) {
        ErrorNotifFor5secondes("emailError");
      }else if(validatePassword(passwordInput.value)<8){
        ErrorNotifFor5secondes("passwordError");
      }else if(!firstName.value){
        ErrorNotifFor5secondes("firstnameError");
      } else {
        form.submit();
      }
  }

  buttonForm.addEventListener('click', handleSubmit);
}

//Affiche une error jusqu'alors caché pour avertir l'user d'une donnée mal renseigné en renseigné l'id de celui-ci
function ErrorNotifFor5secondes(id){
  const error = document.getElementById(id)
  error.style.display = 'inline';
  setTimeout(()=>{
    error.style.display="none";
  }, 5000)
}