export default function eventUpdate(dataEvents, receivedMessage){
    let eventTarget;
    if (dataEvents){
        eventTarget = dataEvents.find((event) => event.Titre === receivedMessage.Event);
    }
    console.log(eventTarget.Titre)
}