import Echo from "laravel-echo";
import pusher from "pusher-js";
import api from "../api/axios";

window.pusher = pusher;

const echo = new Echo({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: import.meta.env.VITE_REVERB_HOST,
    wsPort: import.meta.env.VITE_REVERB_PORT,
    forceTLS: import.meta.env.VITE_REVERB_SCHEME,
    disableStats: true,
    enabledTransports: ['ws', 'wss'],
    authorizer: (channel) => {
        return {
            authorize: (socketId, callback) => {
                api.post('/api/broadcasting/auth', {
                    socket_id: socketId,
                    channel_name: channel.name
                },{
                    withCredentials:true
                }).then(response =>callback(false, response.data)).catch(error =>callback(true, error))
                }
            }
        }
    }
)

window.Echo = echo;
export default echo;