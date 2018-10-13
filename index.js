const WebSocket = require('ws');
const fs = require('fs');
const axios = require('axios');
const twitter = require('twitter');
const settings = require('./setting');
const ws = new WebSocket('ws://localhost:5672');
var client = new twitter({
    consumer_key: settings.consumer_key,
    consumer_secret:settings.consumer_secret,
    access_token_key:settings.access_token_key,
    access_token_secret:settings.access_token_secret
});

ws.on('message', function incoming(data){
    let music_data = JSON.parse(data);
    if(music_data['channel'] == 'track'){
        let music = music_data['payload'];
        let tweet_template = `${music['title']} / ${music['album']}
         -- ${music['artist']}`;
        const tweet = async () => {
            const res = await axios.get(music['albumArt'], {responseType: 'arraybuffer'});
            fs.writeFileSync(`./thumbnail.jpg`, new Buffer(res.data), 'binary');
            const thumbnail = fs.readFileSync('./thumbnail.jpg');
            client.post('media/upload', {media: thumbnail}, (err, media, res) => {
                if(!err){
                    client.post('statuses/update', {status: tweet_template, media_ids: media.media_id_string}, (err, tw, res) => {
                        if(err) console.log(err);
                    });
                }
            });
        };
        tweet();
    }
});