const express = require('express');
const parser = require('body-parser');
const loki = require('lokijs');
const locales = require('./locales');

const app = express();
const host = process.env.HOST || '127.0.0.1'; //'192.168.0.114';
const port = process.env.PORT || 3000;
const root = __dirname;

let lang = 'sk';
let data = {};
const db = new loki('data/db.js', {
	autoload: true,
	autoloadCallback: () => {
		data.pois = db.getCollection('pois');
/*
		console.log(data.pois.chain().sort((a, b) => {
			return a.localCompare(b);
			// if (a.title[lang] < b.title[lang]) return -1;
			// if (a.title[lang] > b.title[lang]) return 1;
			// return 0;
		}).data());
*/
	}
});

app.use(express.static(root));
app.use(parser.json());
app.set('view engine', 'ejs');

//app
app.get('/', (req, res) => {
	res.render('index.ejs', { pois: data.pois.data, locale: locales[lang], lang });
});

app.get('/lang/:lang', (req, res) => {
	lang = req.params.lang;
	res.redirect('/');
});

//admin
app.get('/admin', (req, res) => {
	res.render('admin.ejs', { pois: data.pois.data });
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

//server
app.listen(port, host, () => {
	console.log('Server started on localhost:3000');
	console.log('Press Ctrl+C to exit...');
});









app.get('/seed', (req, res) => {
	db.removeCollection('pois');
	db.addCollection('pois').insert([
		{
			position: { left: 100, top: 100 },
			title: { sk: 'gNadpis', en: 'xHeadline' },
			description: { sk: 'Popis', en: 'Description'},
			tags: [ 'monument', 'castle', 'cave' ],
			images: [ '001_01.jpg' ]
		},
		{
			position: { left: 200, top: 100 },
			title: { sk: 'zNadpis 2', en: 'eHeadline 2' },
			description: { sk: 'Popis 2', en: 'Description 2'},
			tags: [ 'mine', 'peak', 'water' ],
			images: [ '002_01.jpg' ]
		},
		{
			position: { left: 300, top: 100 },
			title: { sk: 'čNadpis 3', en: 'zHeadline 3' },
			description: { sk: 'Popis 3', en: 'Description 3'},
			tags: [ 'water', 'summer', 'site' ],
			images: [ '003_01.jpg' ]
		}
	]);
	db.saveDatabase('db');
	res.redirect('/admin')
});
