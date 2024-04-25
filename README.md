Arman : page Home et creationPosts
Toufik : page login
Bradley : page register

#Toufik

##db
Pour t'aider tu peux utiliser les func pour manipuler la db qui se trouve dans back-end/middleware/dbFunc.
Il y a déjà je pense des funcs que tu peux d'ores et déjà utiliser certaines des funcs à l'intérieur
pour savoir si l'utilisateur est présent dans la db et bien sûr n'hésite pas à en rajouter si tu penses cela utile.

Je n'ai pas encore rajouté de func pour rajouter un user mais tu peux t'inspirer de la func "PushInPosts_db()" 
pour t'aider à la faire. Si t'as des questions n'hésite pas.

##Front et websocket

J'ai oublié de préciser pour le front évite de te servir d'une api en json pour vérifier les mots de passe et autres infos personnelles (lol).
C'est pas sécur... Mais utilise plutot le websocket pour le faire (Il peut-être d'autre méthodes mais c'est la plus intérressante pour toi je pense).
T'as un bonne exemple de websocket dans back-end/middleware/handlers/websocket.go. J'ai pu le tester pour la page home et ca peut être vachement utile je pense.

Beaucoup de petits trucs sympa ce trouve sur mes pages si t'as des difficultés pour manipuler et executer les élèments et les logiques de ta page. Pense aussi 
à mettre tout tes fetchs et websocket dans src/app/lib et toutes les logics dans components.


#Bradley

...dès que t'as fini sql on en reparle (mdr)

##