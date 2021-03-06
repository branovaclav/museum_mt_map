const express = require('express');
const parser = require('body-parser');
const loki = require('lokijs');
const locales = require('./locales');

const app = express();
const host = process.env.HOST || '127.0.0.1';
const port = process.env.PORT || 3000;
const root = __dirname;

let lang = 'sk';
let pois = {};
let abcsort = (poi1, poi2) => {
	let a = poi1.title[lang]; let b = poi2.title[lang];
	return a < b ? -1 : (a > b ? 1 : 0);
};

const db = new loki('data/db.js', {
	autoload: true,
	autoloadCallback: () => {
		let collection = db.getCollection('pois');
		pois = {
			collection,
			data: {
				all: collection.data,
				sorted: collection.chain().sort(abcsort).data()
			}
		};
	}
});

app.use(express.static(root));
app.use(parser.json());
app.set('view engine', 'ejs');

//app
app.get('/', (req, res) => {
	res.render('index.ejs', { pois: pois.data.sorted, locale: locales[lang], lang });
});

app.get('/lang/:lang', (req, res) => {
	lang = req.params.lang;
	pois.data.sorted = pois.collection.chain().sort(abcsort).data();
	res.redirect('/');
});

//admin
app.get('/admin', (req, res) => {
	res.render('admin.ejs', { pois: pois.data.all });
});

app.post('/admin', (req, res) => {
	res.send( pois.collection.insert(req.body.data) );
	db.saveDatabase('db');
});

app.put('/admin', (req, res) => {
	let doc = pois.collection.get(req.body.id);
	Object.assign(doc, req.body.data);
	res.send( pois.collection.update(doc) );
	db.saveDatabase('db');
});

app.delete('/admin', (req, res) => {
	res.send( pois.collection.remove(pois.collection.get(req.body.id)) );
	db.saveDatabase('db');
});

//server
app.listen(port, host, () => {
	console.log('Server started on localhost:3000');
	console.log('Press Ctrl+C to exit...');
});
