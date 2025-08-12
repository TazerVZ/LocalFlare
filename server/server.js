import { createServer } from 'http';
import staticHandler from 'serve-handler';
import ws, { WebSocketServer } from 'ws';

const server = createServer((req, res) => {
	return staticHandler(req, res, { public: 'public' })
});

const wss = new WebSocketServer({ server })

const connections = new Map();
let id = 1;

wss.on('connection', (client) => {

	connections.set(id, client);
	console.log(`New connection ${id}`);
	id++;



	client.on('message', (msg) => {
		const { userID, message } = JSON.parse(msg)
		if (userID) sendToUser(userID, message);
		else broadcast(message)

	})
})

function broadcast(msg) {
	for (const client of wss.clients) {
		if (client.readyState === ws.OPEN) {
			client.send(msg)
		}
	}
}

function sendToUser(userId, msg) {
	for (const [cid, client] of connections) {
		if (cid === Number(userId) && client.readyState === ws.OPEN) {
			client.send(msg);
			return;
		}
	}
};

server.listen(process.argv[2] || 8080, () => {
	console.log(`server listening...`);
})
