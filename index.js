// server.js

var doGithubStuff = async (resolve, reject) => {
  
  var GitHub = require('github-api');
  var Twit = require('twit');
  
  const gh = new GitHub({token:process.env.GIT_HUB_TOKEN});
  
  const randomWord = require('random-word');
  var retries = 0;
  
  do {
    var searchWord = randomWord();
    console.log(searchWord);
    // Note this differs from docs quite a bit.. :(
    var searchRequest = gh.search({q:searchWord});
    
    try {
      var data = await searchRequest.forRepositories();  
      var repos = data.data;
      console.log(repos.length);
    }
    catch (err){
      console.log("error")
      console.log(err);
    }
    retries++;
  } while (retries < 10 && !(repos === undefined) && (repos.length == 0))
  
  if (repos === undefined || repos.length == 0) {
    reject("failed to find repos");
    return;
  }
    
  var randoRepo = repos[Math.floor(Math.random()*repos.length)];
    
  var repoFullName = randoRepo.full_name;
  var repoName = randoRepo.name;
  var user = randoRepo.owner.login;

  var repo = gh.getRepo(user, repoName);
  repo.listCommits().then(function(commits) {
    
    var commitsData = commits.data;
    var commitMessage = commitsData[0].commit.message;
    var htmlUrl = commitsData[0].html_url;
    
    console.log(commitMessage);
    console.log(htmlUrl);
    
    return {commitMessage:commitMessage, url:htmlUrl};
  }).then(function(commitData){
      /* Be sure to update the .env file with your API keys. See how to get them: https://botwiki.org/tutorials/how-to-create-a-twitter-app */      
    var twitterConfig = {
      consumer_key: process.env.TWITTER_CONSUMER_KEY,
      consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
      access_token: process.env.TWITTER_ACCESS_TOKEN,
      access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
    }
    
    var t = new Twit(twitterConfig);
    
    t.post('statuses/update', { status: commitData.commitMessage + " " + commitData.url }, function(err, data, twitterResponse) {
        console.log(data)
        console.log(err)
	reject(Error(err))
    });
    resolve("Status updated");
  }).catch(function(err){
    console.log(err);
    reject(Error(err));
  })
  
}

exports.handler = async (event) => {
	const promise = new Promise(function(resolve, reject) {
		doGithubStuff(resolve,reject);
    })
  return promise

};


