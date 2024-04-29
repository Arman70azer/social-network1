
export default async function sendFormToHome(formData){
    try {
        console.log(formData)
        const response = await fetch('http://localhost:8000/api/home', {
            method: 'POST',
            body: formData
        });
    } catch (error) {
        console.error('Error submitting form:', error);
    }
}