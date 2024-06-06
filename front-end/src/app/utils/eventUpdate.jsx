export default function eventUpdate(dataEvents, receivedMessage){
    let eventTarget;
    if (dataEvents){
        eventTarget = dataEvents.find((event) => event.Titre === receivedMessage.Event);
    }

    if (eventTarget) {
        if (receivedMessage.Nature === "New-followEvent" ) {
            if (!eventTarget.Followers) {
                // Si aucun follower n'existent, créer un tab vide
                eventTarget.Followers = [];
            }
            if (receivedMessage.ObjectOfRequest === "unfollowEvent" && eventTarget.Followers.length>0){
                eventTarget.Followers = eventTarget.Followers.filter((follow) => follow !== receivedMessage.User);
            }else if (receivedMessage.ObjectOfRequest === "followEvent"){
                eventTarget.Followers.push(receivedMessage.User)
            }
            
            //Si il était dans follower on le supprime 
            if (eventTarget.NoFollowers && eventTarget.NoFollowers.length>0){
                eventTarget.NoFollowers = eventTarget.NoFollowers.filter((follow)=> follow !== receivedMessage.User)
            }

        }else if (receivedMessage.Nature === "New-unfollowEvent"){
            if (!eventTarget.NoFollowers){
                eventTarget.NoFollowers = [];
            }
            if (receivedMessage.ObjectOfRequest === "unfollowEvent" && eventTarget.NoFollowers.length>0){
                eventTarget.NoFollowers = eventTarget.NoFollowers.filter((follow) => follow !== receivedMessage.User);
            }else if (receivedMessage.ObjectOfRequest === "followEvent"){
                eventTarget.NoFollowers.push(receivedMessage.User)
            }

            if (eventTarget.Followers && eventTarget.Followers.length>0){
                eventTarget.Followers = eventTarget.Followers.filter((follow)=> follow !== receivedMessage.User)
            }
        }
    }

    return eventTarget
}