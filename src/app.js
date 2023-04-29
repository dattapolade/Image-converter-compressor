const express = require('express');
const multer = require('multer');
const path = require("path");
const bodyParser = require('body-parser')
const sharp = require('sharp');
const fs = require('fs');
const app = express();
const viewPath = path.join(__dirname, "../views");

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', viewPath);

const upload = multer({
	dest: 'public/uploads/'
});

app.get('/', (req, res) => {
	res.render('index', { converted: null })
});


app.post('/upload', upload.single('image'), async (req, res) => {
	try {
		if (!req.file) {
			return res.status(400).send('No image file uploaded.');
		}
		const output = fs.createWriteStream(req.file.path + '.' + req.body.format);
		const width = parseInt(req.body.width);
		const height = parseInt(req.body.height);

		await sharp(req.file.path).resize(width, height).toFormat(req.body.format).pipe(output);


		output.on('close', () => {
			const convertedPath = req.file.path + '.' + req.body.format;
			res.render('index', { converted: convertedPath.replace('public\\', '') });
		});
	}
	catch (err) {
		console.error(err);
		res.status(500).send(err.message); 0
	}
});

app.get('/download', (req, res) => {
	const convertedPath = 'public/' + req.query.path;
	res.download(convertedPath);
});

app.listen(3000, () => {
	console.log("server is running");
})

