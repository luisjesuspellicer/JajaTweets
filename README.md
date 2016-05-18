# JajaTweets

Proyecto de sistemas y tecnologías Web (2016).


- Travis-CI: [![Build Status](https://travis-ci.com/luisjesuspellicer/STW.svg?token=JNjXRfgfaA5ApsYs48bd&branch=master)](https://travis-ci.com/luisjesuspellicer/STW)
- Heroku: [https://jajatweets.herokuapp.com/](https://jajatweets.herokuapp.com/)


## Installation
1. Run "npm install" on application directory.
2. Establish the following environment variables in your system (or IDE):

  ```
  export MY_SECRET="[Secret for generating JWT]"
  export TWITTER_CONSUMER_KEY="[Your Twitter app consumer key]"
  export TWITTER_CONSUMER_SECRET="[Your Twitter app consumer secret]"
  export CURRENT_DOMAIN="[Domain where the app is going to be executed, ex: http://localhost:3000]"
  export PORT="[Port where the app is going to be listening, ex: 80]"
  ```

3. Run "npm test" to test the application backend (or execute the script "test.sh").
4. Run "npm start" to start using the complete application.
