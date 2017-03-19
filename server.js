const express = require('express');
const parser = require('body-parser');
const loki = require('lokijs');

const app = express();
const host = process.env.HOST || '127.0.0.1';
const port = process.env.PORT || 3000;
const root = __dirname;

let data = {};
const db = new loki('db.js', {
	autoload: true,
	autoloadCallback: () => {
		data.pois = db.getCollection('pois');
	}
});

app.use(express.static(root));
app.use(parser.json());
app.set('view engine', 'ejs');

app.get('/admin', (req, res) => {
	res.render('index.ejs', { pois: data.pois.data });
});

app.post('/admin', (req, res) => {
	res.send( data.pois.insert(req.body.data) );
	db.saveDatabase('db');
});

app.put('/admin', (req, res) => {
	let doc = data.pois.get(req.body.id);
	Object.assign(doc, req.body.data);
	res.send( data.pois.update(doc) );
	db.saveDatabase('db');
});

app.delete('/admin', (req, res) => {
	res.send( data.pois.remove(data.pois.get(req.body.id)) );
	db.saveDatabase('db');
});

app.listen(port, host, () => {
	console.log('Server started on localhost:3000');
	console.log('Press Ctrl+C to exit...');
});






app.get('/seed', (req, res) => {
	db.removeCollection('pois');
	db.addCollection('pois').insert([
		{
			position: { left: 100, top: 100 },
			title: { sk: 'Nadpis', en: 'Headline' },
			description: { sk: 'Popis', en: 'Description'},
			tags: [ 'monument', 'castle', 'cave' ],
			images: [ 'image_001.jpg' ]
		},
		{
			position: { left: 200, top: 100 },
			title: { sk: 'Nadpis 2', en: 'Headline 2' },
			description: { sk: 'Popis 2', en: 'Description 2'},
			tags: [ 'mine', 'peak', 'water' ],
			images: [ 'image_002.jpg' ]
		}
	]);
	db.saveDatabase('db');
	res.redirect('/')
});
