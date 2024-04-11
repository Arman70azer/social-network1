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
  const emailError = document.getElementById('emailError');
  const form = document.getElementById('formRegister');

  // Fonction de validation d'e-mail
  function validateEmail(email) {
      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return regex.test(email);
  }

  // Fonction de gestion de la soumission du formulaire
  function handleSubmit(event) {
      event.preventDefault(); // Empêcher la soumission du formulaire par défaut

      // Vérifier si l'e-mail est valide
      if (!validateEmail(emailInput.value)) {
        ErrorNotifFor5secondes(emailError)
      } else {
          form.submit();
      }
  }

  buttonForm.addEventListener('click', handleSubmit);
}

//Affiche une error jusqu'alors caché pour avertir l'user d'une donnée mal renseigné
function ErrorNotifFor5secondes(htmlElement){
  htmlElement.style.display = 'inline';
  setTimeout(()=>{
    htmlElement.style.display="none";
  }, 5000)
}