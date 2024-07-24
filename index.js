// the page is used to display the tweet, replies for the tweet
// icons to like, retweet, and to reply to the tweet
// icons to upload, delete a tweet & reply
// current user is considered to be @Krishna and the other user's
// tweet and replies are imported from data.js file.

// importing the hardcoded tweets info from data.js
import { staticTweetsData } from './data.js'
// importing a function from CDN to create an unique id
import { v4 as uuidv4 } from 'https://jspm.dev/uuid';

// store the tweet info in a local variable. this should be an array
let tweetsData = JSON.parse(window.localStorage.getItem('twimba')) || staticTweetsData

// there can be only 1 click at a time
document.addEventListener('click', function(e){
    if(e.target.dataset.like){  // when the user likes the tweet
        handleLikeClick(e.target.dataset.like) 
    }
    else if(e.target.dataset.retweet){  // when the user retweets
        handleRetweetClick(e.target.dataset.retweet)
    }
    else if(e.target.dataset.reply){    // when the user wants to see all the responses of the tweet
        handleReplyClick(e.target.dataset.reply)
    }
    else if(e.target.id === 'tweet-btn'){   // when the user posts a tweet
        handleTweetBtnClick()
    }
    
    else if (e.target.dataset.userTweetDelete){ // when the user deletes their own tweet
        handleUserTweetDelete(e.target.dataset.userTweetDelete)
    }
    else if (e.target.dataset.userReplyDelete){ // when the user deletes their reply tweet
        handleUserReplyDelete(e.target.dataset.userReplyDelete)
    }
    else if(e.target.dataset.userUpload){   // when the user wants to reply to a tweet

        // since each tweet is uniquely identified, the reply of each tweet is identified by,
        // tweetid * replyid
        // once the reply is uploaded the tweet is updated with the reply
        const userReply = document.getElementById(`userReply-${e.target.dataset.userUpload}`)
        
        // check for null value submission
        let text = userReply.value
        if (!(text.split(' ').join(''))) {
            window.alert(`Post reply`)
            return
        }
        
        // reply is updated
        tweetsData.filter(function(lTweet){
            
            if (lTweet.uuid === e.target.dataset.userUpload) {
                
                let rUuid = uuidv4()
                lTweet.isReplied = true
                lTweet.replies.unshift({
                    handle: `@Krishna`,
                    profilePic: `images/profile.png`,
                    tweetText: `${userReply.value}`,
                    replyUuid: `${lTweet.uuid}*${rUuid}`
                })
            }
            return lTweet
        })
        
        render()    // latest data is rendered to the page
    }
    window.localStorage.setItem('twimba', JSON.stringify(tweetsData))   // local storage is updated
})

function handleLikeClick(tweetId){ 

    const targetTweetObj = tweetsData.filter(function(tweet){
        return tweet.uuid === tweetId
    })[0]   // the liked tweet is filtered

    // the user can like only once.
    // if clicked multiple times, each time the like button is toggled.
    // respective like value should be calculated
    if (targetTweetObj.isLiked){
        targetTweetObj.likes--
    }
    else{
        targetTweetObj.likes++ 
    }
    targetTweetObj.isLiked = !targetTweetObj.isLiked    // toggling determined using a boolean variable
    render()    // latest data is rendered to the page
}

function handleRetweetClick(tweetId){
    const targetTweetObj = tweetsData.filter(function(tweet){
        return tweet.uuid === tweetId
    })[0]   // the retweeted tweet is filtered
    
    // the user can retweet only once.
    // if clicked multiple times, each time the retweet button is toggled.
    // respective retweet value should be calculated
    if(targetTweetObj.isRetweeted){
        targetTweetObj.retweets--
    }
    else{
        targetTweetObj.retweets++
    }
    targetTweetObj.isRetweeted = !targetTweetObj.isRetweeted    // toggling determined using a boolean variable
    render()    // latest data is rendered to the page
}

function handleReplyClick(replyId){
    // replies-<tweetId> is the dataset value for each reply icon
    // when clicked, the replies of the tweet are displayed.
    // on multiple clicking, they are toggled.
    document.getElementById(`replies-${replyId}`).classList.toggle('hidden')
}

function handleTweetBtnClick(){
    const tweetInput = document.getElementById('tweet-input')

    // check for null value submission
    let text = tweetInput.value    
    if (!(text.split(' ').join(''))) {
        window.alert(`Post tweet`)
        return
    }
    // new tweet is updated
    if(tweetInput.value){
        if (tweetsData) {
            tweetsData.unshift({
                handle: `@Krishna`,
                profilePic: `images/profile.png`,
                likes: 0,
                retweets: 0,
                tweetText: tweetInput.value,
                replies: [],
                isLiked: false,
                isRetweeted: false,
                uuid: uuidv4()
            })
        }
        
    render()    // latest data is rendered to the page
    tweetInput.value = ''   // user value is cleared once rendered
    }

}

function handleUserTweetDelete(tweetDeleteId) {
    const filteredTweetsData = tweetsData.filter(function(tuuid){
        if (tweetDeleteId === tuuid.uuid){
            return false    // respective tweet is deleted
        }
        else
            return true
    })
    tweetsData = filteredTweetsData
    render()    // latest data is rendered to the page
}

function handleUserReplyDelete(replyDeleteId){
    // each reply is uniquely identified by <tweetId>*<replyId>
    const currUuid = replyDeleteId.split("*")[0]
    const filteredTweetsData = tweetsData.filter(function(tuuid, ind){
        if (currUuid === tuuid.uuid){
            // target tweet
            const filteredRepliesData = tuuid.replies.filter(function(ruuid){
                if (replyDeleteId === ruuid.replyUuid){
                    return false    // respective reply is deleted
                }
                else{
                    return true    
                }
            })
            tweetsData[ind].replies = filteredRepliesData   // latest reply info is updated for the tweet
        }
        return true
        
    })  
    tweetsData = filteredTweetsData  // tweet info is updated
    render()    // latest data is rendered to the page
}

function getFeedHtml(){
    let feedHtml = ``   // holds the html content of the tweet container
    
    if (!tweetsData)    // initial page loading
        return null
    
    // each tweet is looped, respective styling is handled and rendered to the page
    tweetsData.forEach(function(tweet){
        
        //  boolean to color the like icon
        let likeIconClass = ''
        
        if (tweet.isLiked){
            likeIconClass = 'liked'
        }
        
        // boolean to color the retweet icon
        let retweetIconClass = ''
        
        if (tweet.isRetweeted){
            retweetIconClass = 'retweeted'
        }

        // get the replies of the looped tweet
        let tweetRepliesHtml = getRepliesHtml(tweet)
        
        // update all the tweets in feedHtml
        // if the tweet belongs to the current user, then the user can delete 
        // their tweet. so, each of their tweets is attached with a delete icon.
        // this is identified using a dataset- userTweetDelete which holds the
        // tweet id.
        
        let hideDeleteIcon = `hide`
        if (tweet.handle === `@Krishna`) {
            hideDeleteIcon = ``
        }
        
        // attaching 3 icons to each tweet- reply, like, retweet.
        // reply is identified using dataset- reply which holds tweet id
        // like is identified using dataset- like which holds tweet id
        // retweet is identified using dataset- retweet which holds tweet id
        // 
        // then the replies of the tweet are hidden initially. The replies
        // are identified using the id- replies-<tweet id>
        feedHtml += 
`
<div class="tweet">
    <div class="tweet-inner">
        <img src="${tweet.profilePic}" class="profile-pic">
        <div>    
            <div class="user-tweet">
                <p class="handle">${tweet.handle}</p>
                <div class=${hideDeleteIcon}>
                    <i class="fa-solid fa-trash-can"
                    data-user-tweet-delete = "${tweet.uuid}"></i>
                </div>
            </div>
        
            <p class="tweet-text">${tweet.tweetText}</p>
            <div class="tweet-details">
                <span class="tweet-detail">
                    <i class="fa-regular fa-comment-dots"
                    data-reply="${tweet.uuid}"
                    ></i>
                    ${tweet.replies.length}
                </span>
                <span class="tweet-detail">
                    <i class="fa-solid fa-heart ${likeIconClass}"
                    data-like="${tweet.uuid}"
                    ></i>
                    ${tweet.likes}
                </span>
                <span class="tweet-detail">
                    <i class="fa-solid fa-retweet ${retweetIconClass}"
                    data-retweet="${tweet.uuid}"
                    ></i>
                    ${tweet.retweets}
                </span>
            </div>   
        </div>            
    </div>
    <div class="hidden" id="replies-${tweet.uuid}">
        ${tweetRepliesHtml}
    </div>   
</div>

`
        
    })
   return feedHtml  // the tweet HTML content is returned
}

function getRepliesHtml(p_tweet) {
    
        //  repliesHtml holds the HTML content of the replies of a specific tweet.
        // it is made visible only when the user clicks on the reply icon
        
        // the first section of the reply container should provide the textarea to the user
        // to reply to the tweet
        // an upload icon is attached in this container, this is identified using the dataset- userUpload which holds the tweet Id
        // the textarea is identified using the dataset- userReply which holds the tweet Id and the
        // id- userReply-<tweet id>
        let repliesHtml = `
<div class="tweet-reply">
    <div class="tweet-inner">
        <img src="./images/profile.png" class="profile-pic">
            <div>
                <div class="new-tweet-icon">
                    <p class="handle">@Krishna</p>
                    <div>
                        <i class="fa-solid fa-arrow-up-from-bracket"
                        data-user-upload="${p_tweet.uuid}"
                        ></i>
                    </div>
                </div>
                <textarea 
                class="new-tweet" 
                placeholder="Add tweet" 
                id="userReply-${p_tweet.uuid}"
                data-user-reply="${p_tweet.uuid}"></textarea>
                
            </div>
        </div>
</div>
        `
        
        // if there are replies for the tweet, append each reply to the reply HTML content
        if(p_tweet.replies.length > 0){
            p_tweet.replies.forEach(function(reply){
                
                // check if the current reply belongs the current user.
                // if so, then the user can delete their reply
                // for that, a delete icon is attached to the reply
                // this is uniquely identified using the dataset- userReplyDelete
                // which holds the <tweet id>*<reply id>
                let hideDeleteIcon = `hide`
                if (reply.handle === `@Krishna`) {
                    hideDeleteIcon = ``
                }
                
                repliesHtml+=`
<div class="tweet-reply">
    <div class="tweet-inner">
        <img src="${reply.profilePic}" class="profile-pic">
        <div>
            <div class="old-tweet-reply">
                <p class="handle">${reply.handle}</p>
                <div class=${hideDeleteIcon}>
                    <i class="fa-solid fa-trash-can"
                    data-user-reply-delete="${reply.replyUuid}"></i>
                </div>
            </div>
            <p class="tweet-text">${reply.tweetText}</p>
        </div>
    </div>
</div>
`
            })
        }

    return repliesHtml
}

function render(){
    // tweet info is rendered to the page
    document.getElementById('feed').innerHTML = getFeedHtml()
}

render()    // explicit call

