
# Busdriver The Cardgame

Busdriver is a party game that is played with a normal deck of cards. We felt the need to be able to play this game without physical cards. Mostly due to concerns of space, ruining cards with spilt drinks, or just forgetting the deck and being unable to play because of it. But everyone is used to carrying a phone, and so, we decided to digitalize it. This project has been made at Tallinn University for the Software Development Project.


## Link to Busdriver The Cardgame:

https://bussijuht.com


## Authors

- [@Hans Oskar Trolla](https://www.github.com/hansotTLU)
- [@Ken Rasmus Kuning](https://www.github.com/kunn28)
- [@Jan Markus Kähara](https://www.github.com/JanMarkusK)
- [@Joosep Madar](https://www.github.com/joosep5)
- [@Ander Laansalu](https://www.github.com/AnderLaansalu)


## Acknowledgements

 - [Firebase & Firestore(version 3.5.1)](https://firebase.google.com)
 - [Github(git version 1.7.3.4)](https://github.com)


## To further develop on your local PC:

Open powershell and insert:

```bash
  Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Then, open this repo in VSCode, and enter the following lines in order:

```bash
  cd hosting
  npm install -g firebase-tools
  firebase login
```

To run the website on your local machine, enter:

```bash
  cd hosting
  firebase serve
```
    
To deploy the website online, enter:

```bash
  cd hosting
  firebase deploy
```

To stop the deployment and make the site unable to run, enter the following:

```bash
  npx firebase hosting:disable
```
## License

[MIT](https://choosealicense.com/licenses/mit/)

