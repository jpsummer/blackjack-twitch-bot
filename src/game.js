export default function Game(channel, client, userstate){

    this.gameActive = true
    this.channel = channel
    this.client = client
    this.username = userstate["display-name"]
    this.userId = userstate["user-id"]
    this.userType = userstate["user-type"]
    //this.isSub = userstate.subscriber



}





/*          USERSTATE OBJECT
{
    badges: { broadcaster: '1', warcraft: 'horde' },
    client-nonce: "8b7005f135dc3c33ff63773b27e74600",
    color: '#FFFFFF',
    display_name: 'Schmoopiie',
    emotes: { '25': [ '0-4' ] },
    first-msg: false
    flags: null
    id: "32f0193f-f935-4b32-9dda-098a24b3de17"
    mod: true,
    room_id: '58355428',
    subscriber: false,
    tmi-sent-ts: "1642595157114"
    turbo: true,
    user_id: '58355428',
    user_type: 'mod',
    emotes_raw: '25:0-4',
    badges_raw: 'broadcaster/1,warcraft/horde',
    username: 'schmoopiie',
    message_type: 'action'
}
 */